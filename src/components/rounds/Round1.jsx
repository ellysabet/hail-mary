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
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    if (!sessionCode) return;

    const unsubscribe = subscribeToSession(sessionCode, async (session) => {
      if (session) {
        // 게임 종료 감지
        if (session.gameEnded) {
          setGameEnded(true);
          document.body.className = '';
          return;
        }

        setCurrentRound(session.currentRound || 0);

        if (session.currentRound > 0) {
          document.body.className = `round-${session.currentRound}-bg`;
        } else {
          document.body.className = '';
        }

        if (session.teams && studentData?.teamId) {
          const myTeam = session.teams.find(t => t.id === studentData.teamId);
          if (myTeam) {
            setTeam({ ...myTeam, currentStudentName: studentData.studentName });
          }
        }
      }
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, studentData]);

  // ── 게임 종료 축하 화면 ────────────────────────────────────
  if (gameEnded) {
    return (
      <div className="container">
        <div className="card card-large text-center" style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* 별 애니메이션 */}
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
            🚀✨
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', marginBottom: '1rem', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            탐사 여행 완료!
          </h1>

          <div style={{
            background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.1))',
            border: '2px solid rgba(251,191,36,0.4)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', lineHeight: 2, fontWeight: 500 }}>
              🎉 6번의 우주 임무를 모두 무사히 완수한 것을 축하합니다!
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg,rgba(167,139,250,0.15),rgba(139,92,246,0.1))',
            border: '2px solid rgba(167,139,250,0.4)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
            <p style={{ fontSize: 'clamp(0.95rem,2.5vw,1.1rem)', lineHeight: 2 }}>
              여러분 한 명 한 명이 앞으로 우주산업 발전에 기여할
              <strong style={{ color: '#a78bfa' }}> 큰 인재</strong>가 되길 진심으로 바랍니다.
            </p>
          </div>

          {/* 팀 점수 */}
          {team && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>
                {studentData?.studentName}님의 팀 최종 점수
              </p>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fbbf24' }}>
                {team.totalScore || 0}점
              </div>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {team.name} 팀
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
            {['🛸','🌍','🚀','⭐','🛰️','🌟'].map((e, i) => (
              <span key={i} style={{ fontSize: '2rem' }}>{e}</span>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setCurrentScreen('home')}
            style={{ marginTop: '0.5rem' }}
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
