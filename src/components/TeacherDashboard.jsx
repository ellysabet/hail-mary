import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSession, saveSession, getTeams, getBadge, getRank } from '../utils/storage';

function TeacherDashboard() {
  const { sessionCode, currentRound, setCurrentRound, teams, setTeams, setCurrentScreen } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null); // 선택된 포스터

  // 실시간 팀 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTeams = getTeams(sessionCode);
      setTeams(updatedTeams);
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionCode]);

  const startRound = (round) => {
    setCurrentRound(round);
    setShowResults(false);
    
    // 세션 업데이트
    const session = getSession(sessionCode);
    session.currentRound = round;
    
    // Round별 직업 설명 상태 초기화
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
    
    saveSession(sessionCode, session);
    
    // body 클래스 업데이트
    document.body.className = `round-${round}-bg`;
  };

  const completeJobExplanation = () => {
    const session = getSession(sessionCode);
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
    saveSession(sessionCode, session);
    alert('✅ 미션이 시작되었습니다!');
  };

  const completeVideoWatching = () => {
    const session = getSession(sessionCode);
    session.round5VideoWatched = true;
    saveSession(sessionCode, session);
    alert('✅ 퀴즈가 시작되었습니다!');
  };

  const completeMission = () => {
    const session = getSession(sessionCode);
    session.round2MissionCompleted = true;
    saveSession(sessionCode, session);
    alert('✅ 퀴즈가 시작되었습니다!');
  };

const pauseRound = async () => {
  setCurrentRound(0);
  const session = await getSession(sessionCode);
  session.currentRound = 0;
  await saveSession(sessionCode, session);
  document.body.className = '';
};

const showFinalResults = () => {
  setShowResults(true);
  pauseRound();
};

const allScores = teams ? teams.map(t => t.totalScore || 0) : [];

  return (
    <div className="container">
      {/* 헤더 */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>👨‍🏫 교사 관제 시스템</h2>
            <p className="text-small">세션 코드를 학생들에게 공유하세요</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">학생 입장 코드</p>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#fbbf24',
              background: 'rgba(251, 191, 36, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: '3px solid #fbbf24'
            }}>
              {sessionCode}
            </div>
          </div>
        </div>
      </div>

      {/* 라운드 제어 */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>🎮 라운드 제어</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          {[1, 2, 3, 4, 5, 6].map(round => (
            <button
              key={round}
              onClick={() => startRound(round)}
              className={`btn ${currentRound === round ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '1.1rem',
                padding: '1rem',
                position: 'relative'
              }}
            >
              Round {round}
              {currentRound === round && (
                <span style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px',
                  fontSize: '1.5rem'
                }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <button 
            onClick={pauseRound}
            className="btn btn-secondary"
            disabled={currentRound === 0}
          >
            ⏸️ 현재 라운드 일시정지
          </button>
          <button 
            onClick={showFinalResults}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            🏆 최종 결과 발표
          </button>
        </div>

        {/* Round 1 직업 설명 완료 버튼 */}
        {currentRound === 1 && (
          <button 
            onClick={completeJobExplanation}
            className="btn btn-primary mt-2"
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              fontSize: '1.1rem',
              padding: '1rem'
            }}
          >
            👨‍🏫 직업 설명 완료 → 미션 시작
          </button>
        )}

        {/* Round 2 버튼들 */}
        {currentRound === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={completeJobExplanation}
              className="btn btn-primary"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              👨‍🏫 직업 설명 완료 → 미션 시작
            </button>
            <button 
              onClick={completeMission}
              className="btn btn-primary"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              🚀 오프라인 미션 완료 → 퀴즈 시작
            </button>
          </div>
        )}

        {/* Round 3 버튼 */}
        {currentRound === 3 && (
          <button 
            onClick={completeJobExplanation}
            className="btn btn-primary mt-2"
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              fontSize: '1.1rem',
              padding: '1rem'
            }}
          >
            👨‍🏫 직업 설명 완료 → 미션 시작
          </button>
        )}

        {/* Round 4 버튼 */}
        {currentRound === 4 && (
          <button 
            onClick={completeJobExplanation}
            className="btn btn-primary mt-2"
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              fontSize: '1.1rem',
              padding: '1rem'
            }}
          >
            👨‍🏫 직업 설명 완료 → 미션 시작
          </button>
        )}

        {/* Round 5 버튼들 */}
        {currentRound === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={completeJobExplanation}
              className="btn btn-primary"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              👨‍🏫 직업 설명 완료 → 미션 시작
            </button>
            <button 
              onClick={completeVideoWatching}
              className="btn btn-primary"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              📹 영상 시청 완료 → 퀴즈 시작
            </button>
          </div>
        )}

        {/* Round 6 버튼 */}
        {currentRound === 6 && (
          <button 
            onClick={completeJobExplanation}
            className="btn btn-primary mt-2"
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              fontSize: '1.1rem',
              padding: '1rem'
            }}
          >
            👨‍🏫 직업 설명 완료 → 포스터 제작 시작
          </button>
        )}

        {currentRound > 0 && (
          <div className="alert alert-success mt-2">
            ✅ 현재 <strong>Round {currentRound}</strong> 진행 중
          </div>
        )}
      </div>

      {/* Round 6 포스터 갤러리 */}
      {currentRound === 6 && (() => {
        const session = getSession(sessionCode);
        const posters = session?.round6Posters || [];
        
        if (posters.length > 0) {
          return (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3>🎨 팀별 포스터 갤러리 ({posters.length}팀 제출)</h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                {posters.map((poster, idx) => (
                  <div
                    key={poster.teamId}
                    onClick={() => setSelectedPoster(poster)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      marginBottom: '0.5rem',
                      opacity: 0.8
                    }}>
                      {poster.teamName}
                    </div>
                    {poster.image ? (
                      <img 
                        src={poster.image} 
                        alt={poster.title} 
                        style={{ 
                          maxWidth: '100%', 
                          height: '150px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          marginBottom: '0.5rem'
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                        {poster.icon}
                      </div>
                    )}
                    <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700 }}>
                      {poster.title}
                    </h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                      {poster.idea.length > 80 ? poster.idea.substring(0, 80) + '...' : poster.idea}
                    </p>
                    <p style={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      fontStyle: 'italic',
                      opacity: 0.9
                    }}>
                      "{poster.slogan}"
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="alert alert-info mt-2">
                <p style={{ fontSize: '0.95rem' }}>
                  💡 포스터를 클릭하여 크게 보고, 발표를 유도하세요!
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* 팀 점수 현황 */}
      <div className="card">
        <h3>📊 참여 팀 현황 ({teams.length}팀)</h3>
        
        <div style={{ marginTop: '1rem' }}>
          {teams
            .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
            .map((team, idx) => {
              const rank = getRank(team.totalScore || 0, allScores);
              const badge = getBadge(team.totalScore || 0, rank);
              
              return (
                <div 
                  key={team.id}
                  className="card"
                  style={{
                    marginBottom: '0.5rem',
                    background: idx < 3 
                      ? `linear-gradient(135deg, ${badge.color}22 0%, ${badge.color}11 100%)`
                      : 'rgba(255,255,255,0.05)',
                    border: idx < 3 ? `2px solid ${badge.color}` : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{badge.icon}</div>
                      <div>
                        <h4 style={{ margin: 0 }}>{team.name}</h4>
                        {team.members && team.members.length > 0 && (
                          <p className="text-small" style={{ margin: 0, opacity: 0.7 }}>
                            {team.members.join(', ')}
                          </p>
                        )}
                        {showResults && (
                          <p className="text-small" style={{ margin: 0, color: badge.color }}>
                            {badge.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: badge.color }}>
                        {team.totalScore || 0}
                      </div>
                      <p className="text-small" style={{ margin: 0 }}>점</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 포스터 확대 모달 */}
      {selectedPoster && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedPoster(null)}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '800px', 
              width: '100%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '3px solid #10b981'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: 0 }}>{selectedPoster.teamName}의 포스터</h2>
              <button
                onClick={() => setSelectedPoster(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.3)',
                  border: '2px solid #ef4444',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              {selectedPoster.image ? (
                <img 
                  src={selectedPoster.image} 
                  alt={selectedPoster.title} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }} 
                />
              ) : (
                <div style={{ fontSize: '8rem', marginBottom: '1.5rem' }}>
                  {selectedPoster.icon}
                </div>
              )}
              <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 700 }}>
                {selectedPoster.title}
              </h1>
              <p style={{ 
                fontSize: '1.3rem', 
                lineHeight: '2', 
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px'
              }}>
                {selectedPoster.idea}
              </p>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                fontStyle: 'italic'
              }}>
                "{selectedPoster.slogan}"
              </p>
            </div>

            <p className="text-center text-small mt-2" style={{ opacity: 0.7 }}>
              화면을 클릭하거나 ✕ 버튼을 눌러 닫기
            </p>
          </div>
        </div>
      )}

      {/* 최종 결과 화면 */}
      {showResults && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowResults(false)}
        >
          <div className="card" style={{ maxWidth: '600px', margin: '2rem' }}>
            <h1 style={{ textAlign: 'center', fontSize: '3rem' }}>🎉</h1>
            <h2 style={{ textAlign: 'center' }}>최종 순위</h2>
            
            <div style={{ marginTop: '2rem' }}>
              {teams
                .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                .slice(0, 3)
                .map((team, idx) => {
                  const rank = idx + 1;
                  const badge = getBadge(team.totalScore || 0, rank);
                  
                  return (
                    <div 
                      key={team.id}
                      style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        background: `linear-gradient(135deg, ${badge.color}33 0%, ${badge.color}11 100%)`,
                        borderRadius: '12px',
                        border: `3px solid ${badge.color}`
                      }}
                    >
                      <div style={{ fontSize: '3rem' }}>{badge.icon}</div>
                      <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{team.name}</h3>
                      <p style={{ fontSize: '2.5rem', fontWeight: 700, color: badge.color, margin: '0.5rem 0' }}>
                        {team.totalScore || 0}점
                      </p>
                      <p style={{ color: badge.color, fontWeight: 600 }}>{badge.name}</p>
                    </div>
                  );
                })}
            </div>

            <p className="text-center text-small mt-2">화면을 클릭하면 닫힙니다</p>
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            if (window.confirm('정말 수업을 종료하시겠습니까?')) {
              setCurrentScreen('home');
            }
          }}
        >
          🏠 수업 종료하기
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
