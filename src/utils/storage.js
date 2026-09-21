import { ref, set, get, remove, onValue } from 'firebase/database';
import { database } from '../firebase.js';

// 세션 코드 생성
export function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 세션 생성
export function createSession(code, teacherName) {
  const sessionRef = ref(database, `sessions/${code}`);
  const session = {
    code,
    teacherName,
    createdAt: Date.now(),
    currentRound: 1,
    teams: [],
    round1JobExplained: false,
    round2JobExplained: false,
    round3JobExplained: false,
    round4JobExplained: false,
    round5JobExplained: false,
    round6JobExplained: false
  };
  return set(sessionRef, session)
    .then(() => session)
    .catch((error) => {
      console.error('Error creating session:', error);
      throw error;
    });
}

// 세션 가져오기
export function getSession(code) {
  const sessionRef = ref(database, `sessions/${code}`);
  return get(sessionRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    })
    .catch((error) => {
      console.error('Error getting session:', error);
      return null;
    });
}

// 세션 저장
export function saveSession(code, sessionData) {
  const sessionRef = ref(database, `sessions/${code}`);
  // Firebase 규칙(.validate)이 code, createdAt 필드를 요구하므로
  // 어떤 경로로 저장하더라도 두 필드가 항상 포함되도록 보정합니다.
  const dataToSave = {
    ...sessionData,
    code,
    createdAt: sessionData.createdAt || sessionData.startTime || Date.now()
  };
  return set(sessionRef, dataToSave)
    .catch((error) => {
      console.error('Error saving session:', error);
      throw error;
    });
}

// 세션 삭제 (수업 종료 시 완전 삭제)
export function deleteSession(code) {
  const sessionRef = ref(database, `sessions/${code}`);
  return remove(sessionRef)
    .catch((error) => {
      console.error('Error deleting session:', error);
      throw error;
    });
}

// 팀 추가
export function addTeam(sessionCode, teamName) {
  return getSession(sessionCode).then((session) => {
    if (!session) {
      throw new Error('Session not found');
    }
    const teamId = `team_${Date.now()}`;
    const newTeam = {
      id: teamId,
      name: teamName,
      totalScore: 0,
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      round4Score: 0,
      round5Score: 0,
      round6Score: 0
    };
    // 빈 배열은 Firebase에 저장되지 않아 teams가 없을 수 있으므로 보정
    if (!session.teams) session.teams = [];
    session.teams.push(newTeam);
    return saveSession(sessionCode, session).then(() => newTeam);
  });
}

// 팀 목록 가져오기
export function getTeams(sessionCode) {
  return getSession(sessionCode).then((session) => {
    return session ? session.teams : [];
  });
}

// 팀 저장
export function saveTeams(sessionCode, teams) {
  return getSession(sessionCode).then((session) => {
    if (!session) return;
    session.teams = teams;
    return saveSession(sessionCode, session);
  });
}

// 팀 점수 업데이트
export function updateTeamScore(sessionCode, teamId, points) {
  return getSession(sessionCode).then((session) => {
    if (!session) return;
    const team = session.teams.find((t) => t.id === teamId);
    if (!team) return;
    team.totalScore += points;
    const roundKey = `round${session.currentRound}Score`;
    if (team.hasOwnProperty(roundKey)) {
      team[roundKey] += points;
    }
    return saveSession(sessionCode, session);
  });
}

// 개인 점수 업데이트
export const updateMemberScore = async (sessionCode, teamId, studentName, score) => {
  try {
    const session = await getSession(sessionCode);
    if (!session || !session.teams) return;
    const teamIndex = session.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return;
    if (!session.teams[teamIndex].memberScores) {
      session.teams[teamIndex].memberScores = {};
    }
    const current = session.teams[teamIndex].memberScores[studentName] || 0;
    session.teams[teamIndex].memberScores[studentName] = current + score;
    await saveSession(sessionCode, session);
  } catch (error) {
    console.error('Error updating member score:', error);
  }
};

// 라운드 변경
export function updateRound(sessionCode, roundNumber) {
  return getSession(sessionCode).then((session) => {
    if (!session) return;
    session.currentRound = roundNumber;
    return saveSession(sessionCode, session);
  });
}

// 배지 가져오기
export function getBadge(sessionCode, teamId) {
  return getSession(sessionCode).then((session) => {
    if (!session) return null;
    const team = session.teams.find((t) => t.id === teamId);
    return team ? team.badge : null;
  });
}

// 순위 가져오기
export function getRank(sessionCode, teamId) {
  return getSession(sessionCode).then((session) => {
    if (!session) return 0;
    const sortedTeams = [...session.teams].sort((a, b) => b.totalScore - a.totalScore);
    return sortedTeams.findIndex((t) => t.id === teamId) + 1;
  });
}

// ── 포스터 전용 함수 (세션 본체와 분리) ─────────────────────
// 이미지가 큰 포스터를 세션 전체(set)에 얹어서 매번 다시 쓰지 않도록,
// sessions/{code}/posters/{posterId} 경로에 개별로 저장합니다.
// 이렇게 하면 점수/라운드 변경 등 다른 세션 업데이트가 발생해도
// 포스터 이미지가 함께 재전송되지 않습니다.

// 포스터 하나 추가 (세션 전체를 건드리지 않음)
export function addPoster(code, posterData) {
  const posterId = `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const posterRef = ref(database, `sessions/${code}/posters/${posterId}`);
  return set(posterRef, { ...posterData, id: posterId })
    .then(() => posterId)
    .catch((error) => {
      console.error('Error adding poster:', error);
      throw error;
    });
}

// 포스터 목록만 실시간 구독 (교사 화면 전용 — 학생 화면은 구독하지 않음)
export function subscribeToPosters(code, callback) {
  const postersRef = ref(database, `sessions/${code}/posters`);
  const unsubscribe = onValue(postersRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.values(snapshot.val()));
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to posters:', error);
  });
  return unsubscribe;
}

// 라운드 6 초기화 시 포스터 전체 삭제
export function clearPosters(code) {
  const postersRef = ref(database, `sessions/${code}/posters`);
  return remove(postersRef)
    .catch((error) => {
      console.error('Error clearing posters:', error);
      throw error;
    });
}

// 실시간 세션 구독
export function subscribeToSession(code, callback) {
  const sessionRef = ref(database, `sessions/${code}`);
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to session:', error);
  });
  return unsubscribe;
}

// 모든 세션 가져오기
export function getAllSessions() {
  const sessionsRef = ref(database, 'sessions');
  return get(sessionsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const sessions = [];
        snapshot.forEach((childSnapshot) => {
          sessions.push(childSnapshot.val());
        });
        return sessions;
      }
      return [];
    })
    .catch((error) => {
      console.error('Error getting all sessions:', error);
      return [];
    });
}
