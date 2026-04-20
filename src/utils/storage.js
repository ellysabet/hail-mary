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
    round6JobExplained: false,
    round6Posters: []
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
  return set(sessionRef, sessionData)
    .catch((error) => {
      console.error('Error saving session:', error);
      throw error;
    });
}

// 세션 삭제
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

    // 현재 라운드 점수 업데이트
    const roundKey = `round${session.currentRound}Score`;
    if (team.hasOwnProperty(roundKey)) {
      team[roundKey] += points;
    }

    return saveSession(sessionCode, session);
  });
}

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
