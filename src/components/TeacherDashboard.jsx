import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSession, saveSession, subscribeToSession } from '../utils/storage';

function TeacherDashboard() {
  const { sessionCode, currentRound, setCurrentRound, teams, setTeams, setCurrentScreen } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);

  // Firebase 실시간 구독
  useEffect(() => {
    if (!sessionCode) return;

    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (session) {
        setTeams(session.teams || []);
        setCurrentRound(session.currentRound || 0);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sessionCode]);

  useEffect(() => {
    document.body.className = currentRound > 0 ? `round-${currentRound}-bg` : '';
    return () => {
      document.body.className = '';
    };
  }, [currentRound]);

  // 순위 계산 함수 (로컬)
  const getRankLocal = (score) => {
    const sortedScores = teams.map(t => t.totalScore || 0).sort((a, b) => b - a);
    return sortedScores.indexOf(score) + 1;
  };

  // 배지 계산 함수 (로컬)
  const getBadgeLocal = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: '#FFD700', name: '1등' };
    if (rank === 2) return { emoji: '🥈', color: '#C0C0C0', name: '2등' };
    if (rank === 3) return { emoji: '🥉', color: '#CD7F32', name: '3등' };
    return { emoji: '🏅', color: '#94a3b8', name: `${rank}등` };
  };

  const startRound = async (round) => {
    setCurrentRound(round);
    setShowResults(false);
    
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      
      session.currentRound = round;
      
      if (round === 1) {
        session.round1JobExplained = false;
      } else if (round === 2) {
        session.round2JobExplained = false;
        session.round2MissionCompleted = false;
      } else if (round === 3) {
        session.round3JobExplained = false;
      } else if (round === 4) {
        session.round4JobExplained = false;
      } else if (round === 5) {
        session.round5JobExplained = false;
        session.round5VideoWatched = false;
      } else if (round === 6) {
        session.round6JobExplained = false;
        session.round6Posters = [];
      }
      
      await saveSession(sessionCode, session);
      document.body.className = `round-${round}-bg`;
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const completeJobExplanation = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      
      if (currentRound === 1) {
        session.round1JobExplained = true;
      } else if (currentRound === 2) {
        session.round2JobExplained = true;
      } else if (currentRound === 3) {
        session.round3JobExplained = true;
      } else if (currentRound === 4) {
        session.round4JobExplained = true;
      } else if (currentRound === 5) {
        session.round5JobExplained = true;
      } else if (currentRound === 6) {
        session.round6JobExplained = true;
      }
      await saveSession(sessionCode, session);
      alert('✅ 미션이 시작되었습니다!');
    } catch (error) {
      console.error('Error completing job explanation:', error);
    }
  };

  const completeVideoWatching = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      
      session.round5VideoWatched = true;
      await saveSession(sessionCode, session);
      alert('✅ 퀴즈가 시작되었습니다!');
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  const completeMission = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      
      session.round2MissionCompleted = true;
      await saveSession(sessionCode, session);
      alert('✅ 퀴즈가 시작되었습니다!');
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  const pauseRound = async () => {
    setCurrentRound(0);
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      
      session.currentRound = 0;
      await saveSession(sessionCode, session);
      document.body.className = '';
    } catch (error) {
      console.error('Error pausing round:', error);
    }
  };

  const showFinalResults = () => {
    setShowResults(true);
    pauseRound();
  };

  const allScores = teams ? teams.map(t => t.totalScore || 0) : [];
  const maxScore = Math.max(...allScores, 0);

  if (showResults) {
    const sortedTeams = [...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    
    return (
      <div className="container">
        <div className="card card-large text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h1>최종 결과</h1>
          <p className="subtitle">모든 라운드가 종료되었습니다!</p>

          {/* 시상대 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '1rem',
            margin: '3rem 0',
            minHeight: '250px'
          }}>
            {sortedTeams.slice(0, 3).map((team, idx) => {
              const rank = idx + 1;
              const badge = getBadgeLocal(rank);
              const heights = ['200px', '250px', '180px'];
              const order = [1, 0, 2]; // 2등, 1등, 3등 순서
              
              return (
                <div
                  key={team.id}
                  style={{
                    order: order[idx],
                    width: '150px',
                    height: heights[idx],
                    background: `linear-gradient(135deg, ${badge.color}44 0%, ${badge.color}22 100%)`,
                    border: `3px solid ${badge.color}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem 1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '3rem' }}>{badge.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {team.name}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: badge.color }}>
                      {team.totalScore || 0}점
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 전체 순위 */}
          <div className="card mt-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h3>📊 전체 순위</h3>
            <div style={{ marginTop: '1rem' }}>
              {sortedTeams.map((team, idx) => {
                const rank = idx + 1;
                const badge = getBadgeLocal(rank);
                
                return (
                  <div
                    key={team.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: rank <= 3 ? `linear-gradient(90deg, ${badge.color}22 0%, transparent 100%)` : 'rgba(255,255,255,0.02)',
                      borderLeft: rank <= 3 ? `4px solid ${badge.color}` : '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{badge.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{team.name}</div>
                        <div className="text-small" style={{ opacity: 0.7 }}>
                          {team.members?.join(', ') || ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {team.totalScore || 0}점
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-primary mt-3"
            onClick={() => setShowResults(false)}
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 헤더 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>🎮 교사 관제 페이지</h2>
            <p className="subtitle">세션 코드: <strong style={{ fontSize: '1.5rem', color: '#a78bfa' }}>{sessionCode}</strong></p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (window.confirm('정말 종료하시겠습니까?')) {
                setCurrentScreen('home');
              }
            }}
          >
            종료
          </button>
        </div>
      </div>

      {/* 라운드 제어 */}
      <div className="card mt-2">
        <h3>🎯 라운드 제어</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {[1, 2, 3, 4, 5, 6].map((round) => (
            <button
              key={round}
              onClick={() => startRound(round)}
              className={currentRound === round ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                fontSize: '1.1rem',
                fontWeight: currentRound === round ? 700 : 400
              }}
            >
              Round {round}
            </button>
          ))}
          <button
            onClick={pauseRound}
            className="btn btn-secondary"
            style={{ gridColumn: 'span 2' }}
          >
            ⏸️ 일시정지
          </button>
        </div>

        {currentRound > 0 && (
          <div className="mt-2">
            <button
              onClick={completeJobExplanation}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              ✅ 직업 설명 완료 (미션 시작)
            </button>

            {currentRound === 2 && (
              <button
                onClick={completeMission}
                className="btn btn-primary mt-1"
                style={{ width: '100%' }}
              >
                ✅ 미션 완료 (퀴즈 시작)
              </button>
            )}

            {currentRound === 5 && (
              <button
                onClick={completeVideoWatching}
                className="btn btn-primary mt-1"
                style={{ width: '100%' }}
              >
                ✅ 영상 시청 완료 (퀴즈 시작)
              </button>
            )}
          </div>
        )}
      </div>

      {/* 팀 현황 */}
      <div className="card mt-2">
        <h3>📊 참가 팀 ({teams.length}팀)</h3>
        
        <div style={{ marginTop: '1rem' }}>
          {teams.length === 0 ? (
            <div className="alert alert-info">
              <p>아직 참가한 팀이 없습니다</p>
              <p className="text-small mt-1">학생들이 세션 코드로 입장하여 팀을 만들 수 있습니다</p>
            </div>
          ) : (
            teams
              .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
              .map((team, idx) => {
                const rank = idx + 1;
                const badge = getBadgeLocal(rank);
                
                return (
                  <div
                    key={team.id}
                    className="card"
                    style={{
                      marginBottom: '0.5rem',
                      background: rank <= 3
                        ? `linear-gradient(135deg, ${badge.color}22 0%, ${badge.color}11 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: rank <= 3 ? `2px solid ${badge.color}` : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>{badge.emoji}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{team.name}</div>
                          <div className="text-small" style={{ opacity: 0.7 }}>
                            {team.members?.join(', ') || '팀원 없음'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                          {team.totalScore || 0}점
                        </div>
                        <div className="text-small" style={{ opacity: 0.7 }}>
                          {rank}등
                        </div>
                      </div>
                    </div>

                    {/* 라운드별 점수 */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {[1, 2, 3, 4, 5, 6].map((r) => (
                        <div key={r} style={{ textAlign: 'center' }}>
                          <div className="text-small" style={{ opacity: 0.7 }}>R{r}</div>
                          <div style={{ fontWeight: 600 }}>{team[`round${r}Score`] || 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* 최종 결과 보기 버튼 */}
      <div className="card mt-2">
        <button
          onClick={showFinalResults}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
        >
          🏆 최종 결과 보기
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
