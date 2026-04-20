// ========== 세션 관리 ==========
export const saveSession = (code, data) => {
  localStorage.setItem(`sessions:${code}`, JSON.stringify(data));
};

export const getSession = (code) => {
  const data = localStorage.getItem(`sessions:${code}`);
  return data ? JSON.parse(data) : null;
};

export const deleteSession = (code) => {
  localStorage.removeItem(`sessions:${code}`);
};

// ========== 팀 관리 ==========
export const saveTeams = (code, teams) => {
  localStorage.setItem(`teams:${code}`, JSON.stringify(teams));
};

export const getTeams = (code) => {
  const data = localStorage.getItem(`teams:${code}`);
  return data ? JSON.parse(data) : [];
};

export const updateTeamScore = (code, teamId, points) => {
  const teams = getTeams(code);
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.totalScore = (team.totalScore || 0) + points;
    saveTeams(code, teams);
  }
  return teams;
};

// ========== 세션 코드 생성 ==========
export const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// ========== 학생 데이터 ==========
export const saveStudentData = (data) => {
  localStorage.setItem('student_data', JSON.stringify(data));
};

export const getStudentData = () => {
  const data = localStorage.getItem('student_data');
  return data ? JSON.parse(data) : null;
};

export const clearStudentData = () => {
  localStorage.removeItem('student_data');
};

// ========== 등급 계산 ==========
export const getRank = (score, allScores) => {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  return sortedScores.indexOf(score) + 1;
};

export const getBadge = (score, rank) => {
  if (rank === 1) return { icon: '🥇', name: '우주 마스터', color: '#fbbf24' };
  if (rank === 2) return { icon: '🥈', name: '우주 전문가', color: '#d1d5db' };
  if (rank === 3) return { icon: '🥉', name: '우주 탐험가', color: '#f59e0b' };
  if (score >= 800) return { icon: '⭐', name: '우주 개척자', color: '#a78bfa' };
  if (score >= 600) return { icon: '🌟', name: '우주 도전자', color: '#60a5fa' };
  return { icon: '✨', name: '우주 초보자', color: '#34d399' };
};
