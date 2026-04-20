import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { subscribeToSession } from '../utils/storage';
import Round1 from './rounds/Round1';
import Round2 from './rounds/Round2';
import Round3 from './rounds/Round3';
import Round4 from './rounds/Round4';
import Round5 from './rounds/Round5';
import Round6 from './rounds/Round6';

function StudentGame() {
  const { sessionCode, studentData, setCurrentScreen } = useGame();
  const [currentRound, setCurrentRound] = useState(0);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    if (!sessionCode) return;

    const unsubscribe = subscribeToSession(sessionCode, async (session) => {
      if (session) {
        setCurrentRound(session.currentRound || 0);

        if (session.currentRound > 0) {
          document.body.className = `round-${session.currentRound}-bg`;
        } else {
          document.body.className = '';
        }

        if (session.teams && studentData?.teamId) {
          const myTeam = session.teams.find(t => t.id === studentData.teamId);
          if (myTeam) {
            // ✅ 현재 학생 이름을 team 객체에 포함시켜 라운드 컴포넌트에서 사용 가능하게
            setTeam({ ...myTeam, currentStudentName: studentData.studentName });
          }
        }
      }
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, studentData]);

  if (!team) {
    return (
      <div className="container">
        <div className="card text-center">
          <div className="loading">
            <div style={{ fontSize: '4rem' }}>⏳</div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentRound === 0) {
    return (
      <div className="container">
        <div className="card card-large text-center">
          <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🚀</div>
          <h2>환영합니다, {studentData.studentName}님!</h2>
          <p className="subtitle" style={{ marginTop: '1rem' }}>
            팀: <strong>{team.name}</strong>
          </p>
          <div className="alert alert-info mt-2">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏱️</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>
              선생님이 라운드를 시작할 때까지 기다려주세요
            </p>
          </div>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>현재 팀 점수</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fbbf24' }}>
              {team.totalScore || 0}
            </div>
          </div>
          <button
            className="btn btn-secondary mt-3"
            onClick={() => { if (window.confirm('정말 나가시겠습니까?')) setCurrentScreen('home'); }}
          >
            나가기
          </button>
        </div>
      </div>
    );
  }

  // ✅ 모든 라운드에 team(currentStudentName 포함) 전달
  return (
    <div className="container">
      {currentRound === 1 && <Round1 team={team} sessionCode={sessionCode} />}
      {currentRound === 2 && <Round2 team={team} sessionCode={sessionCode} />}
      {currentRound === 3 && <Round3 team={team} sessionCode={sessionCode} />}
      {currentRound === 4 && <Round4 team={team} sessionCode={sessionCode} />}
      {currentRound === 5 && <Round5 team={team} sessionCode={sessionCode} />}
      {currentRound === 6 && <Round6 team={team} sessionCode={sessionCode} />}
    </div>
  );
}

export default StudentGame;
