import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSession, saveSession, subscribeToSession } from '../utils/storage';

const getPersonalGrade = (score) => {
  if (score >= 500) return { grade: '우주 마스터',  color: '#FFD700', emoji: '🌟', bg: 'rgba(255,215,0,0.15)',    desc: '모든 임무 완벽 수행!' };
  if (score >= 400) return { grade: '우주 전문가',  color: '#a78bfa', emoji: '🚀', bg: 'rgba(167,139,250,0.15)', desc: '우수한 임무 수행 능력' };
  if (score >= 300) return { grade: '우주 탐험가',  color: '#60a5fa', emoji: '🛸', bg: 'rgba(96,165,250,0.15)',  desc: '다양한 임무 경험 보유' };
  if (score >= 200) return { grade: '우주 대원',    color: '#34d399', emoji: '🌍', bg: 'rgba(52,211,153,0.15)',  desc: '임무 수행 중인 대원' };
  return             { grade: '우주 훈련생',        color: '#94a3b8', emoji: '🪐', bg: 'rgba(148,163,184,0.15)', desc: '우주 여정을 시작하는 중' };
};

function TeacherDashboard() {
  const { sessionCode, currentRound, setCurrentRound, teams, setTeams, setCurrentScreen } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [resultsTab, setResultsTab] = useState('team');
  const [round6Posters, setRound6Posters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);

  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (session) {
        setTeams(session.teams || []);
        setCurrentRound(session.currentRound || 0);
        setRound6Posters(session.round6Posters || []);
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode]);

  useEffect(() => {
    document.body.className = currentRound > 0 ? `round-${currentRound}-bg` : '';
    return () => { document.body.className = ''; };
  }, [currentRound]);

  const getBadgeLocal = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: '#FFD700' };
    if (rank === 2) return { emoji: '🥈', color: '#C0C0C0' };
    if (rank === 3) return { emoji: '🥉', color: '#CD7F32' };
    return { emoji: '🏅', color: '#94a3b8' };
  };

  const getIndividualRankings = () => {
    const individuals = [];
    (teams || []).forEach(team => {
      (team.members || []).forEach(member => {
        individuals.push({ name: member, teamName: team.name, score: team.memberScores?.[member] || 0 });
      });
    });
    return individuals.sort((a, b) => b.score - a.score);
  };

  const startRound = async (round) => {
    setCurrentRound(round);
    setShowResults(false);
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session.currentRound = round;
      if (round === 1) session.round1JobExplained = false;
      else if (round === 2) { session.round2JobExplained = false; session.round2MissionCompleted = false; }
      else if (round === 3) session.round3JobExplained = false;
      else if (round === 4) session.round4JobExplained = false;
      else if (round === 5) { session.round5JobExplained = false; session.round5VideoWatched = false; }
      else if (round === 6) { session.round6JobExplained = false; session.round6Posters = []; session.round6QuizStarted = false; }
      await saveSession(sessionCode, session);
      document.body.className = `round-${round}-bg`;
    } catch (e) { console.error(e); }
  };

  const completeJobExplanation = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session[`round${currentRound}JobExplained`] = true;
      await saveSession(sessionCode, session);
      alert('✅ 미션이 시작되었습니다!');
    } catch (e) { console.error(e); }
  };

  const completeVideoWatching = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session.round5VideoWatched = true;
      await saveSession(sessionCode, session);
      alert('✅ 퀴즈가 시작되었습니다!');
    } catch (e) { console.error(e); }
  };

  const completeMission = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session.round2MissionCompleted = true;
      await saveSession(sessionCode, session);
      alert('✅ 퀴즈가 시작되었습니다!');
    } catch (e) { console.error(e); }
  };

  const startRound6Quiz = async () => {
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session.round6QuizStarted = true;
      await saveSession(sessionCode, session);
      alert('✅ 퀴즈가 시작되었습니다!');
    } catch (e) { console.error(e); }
  };

    const pauseRound = async () => {
    setCurrentRound(0);
    try {
      const session = await getSession(sessionCode);
      if (!session) return;
      session.currentRound = 0;
      await saveSession(sessionCode, session);
      document.body.className = '';
    } catch (e) { console.error(e); }
  };

  const openResults = (doEndGame = false) => {
    if (doEndGame) pauseRound();
    setResultsTab('team');
    setShowResults(true);
  };

  // ── 순위 화면 (공용) ─────────────────────────────────────────
  if (showResults) {
    const sortedTeams = [...(teams || [])].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    const individualRankings = getIndividualRankings();

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3.5rem' }}>{currentRound === 0 ? '🏆' : '📊'}</div>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', marginTop: '0.5rem' }}>
              {currentRound === 0 ? '최종 결과' : '현재 순위'}
            </h1>
            <p className="subtitle">{currentRound === 0 ? '모든 라운드 종료' : `Round ${currentRound} 진행 중`}</p>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            {[['team','🏅 팀 순위'],['individual','👤 개인 순위']].map(([key, label]) => (
              <button key={key} onClick={() => setResultsTab(key)} style={{
                flex: 1, padding: '0.75rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 700, fontSize: 'clamp(0.85rem,2vw,1rem)',
                background: resultsTab === key ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'transparent',
                color: 'white', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {/* 팀 순위 */}
          {resultsTab === 'team' && (
            <>
              {sortedTeams.length >= 2 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', margin: '1.5rem 0', minHeight: '160px' }}>
                  {sortedTeams.slice(0, 3).map((team, idx) => {
                    const badge = getBadgeLocal(idx + 1);
                    const order = [1, 0, 2];
                    const heights = ['170px', '210px', '150px'];
                    return (
                      <div key={team.id} style={{ order: order[idx], width: 'clamp(90px,16vw,140px)', height: heights[idx], background: `linear-gradient(135deg,${badge.color}44,${badge.color}22)`, border: `3px solid ${badge.color}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', textAlign: 'center' }}>{badge.emoji}</div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: 'clamp(0.8rem,2vw,1rem)', wordBreak: 'keep-all' }}>{team.name}</div>
                          <div style={{ fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', fontWeight: 700, color: badge.color }}>{team.totalScore || 0}점</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {sortedTeams.map((team, idx) => {
                const rank = idx + 1;
                const badge = getBadgeLocal(rank);
                return (
                  <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: '0.5rem', borderRadius: '8px', background: rank <= 3 ? `linear-gradient(90deg,${badge.color}22,transparent)` : 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${rank <= 3 ? badge.color : 'rgba(255,255,255,0.1)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ fontSize: '1.8rem' }}>{badge.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{team.name}</div>
                        <div className="text-small" style={{ opacity: 0.6 }}>{team.members?.join(', ')}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{team.totalScore || 0}점</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.2rem', marginTop: '0.2rem' }}>
                        {[1,2,3,4,5,6].map(r => (
                          <div key={r} style={{ textAlign: 'center', fontSize: '0.68rem', opacity: 0.7 }}>
                            <div>R{r}</div><div style={{ fontWeight: 600 }}>{team[`round${r}Score`] || 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 개인 순위 */}
          {resultsTab === 'individual' && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem' }}>🎖️ 등급 기준 (6라운드 총점)</div>
                {[['우주 마스터','🌟','#FFD700','500점↑'],['우주 전문가','🚀','#a78bfa','400점↑'],['우주 탐험가','🛸','#60a5fa','300점↑'],['우주 대원','🌍','#34d399','200점↑'],['우주 훈련생','🪐','#94a3b8','~199점']].map(([g,e,c,l]) => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: `${c}22`, border: `1px solid ${c}`, borderRadius: '20px', fontSize: '0.8rem' }}>
                    <span>{e}</span><strong style={{ color: c }}>{g}</strong><span style={{ opacity: 0.75 }}>{l}</span>
                  </div>
                ))}
              </div>
              {individualRankings.length === 0
                ? <div className="alert alert-info"><p>아직 개인 점수 데이터가 없습니다.</p></div>
                : individualRankings.map((person, idx) => {
                    const g = getPersonalGrade(person.score);
                    return (
                      <div key={`${person.name}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', marginBottom: '0.5rem', background: g.bg, border: `1px solid ${g.color}44`, borderLeft: `4px solid ${g.color}`, borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2rem', height: '2rem', background: `${g.color}33`, border: `2px solid ${g.color}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: g.color, flexShrink: 0 }}>{idx + 1}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{person.name}</div>
                            <div className="text-small" style={{ opacity: 0.6 }}>{person.teamName} 팀</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: g.color }}>{g.emoji} {g.grade}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.65 }}>{g.desc}</div>
                          </div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 700, minWidth: '3rem', textAlign: 'right' }}>{person.score}점</div>
                        </div>
                      </div>
                    );
                  })
              }
            </>
          )}

          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowResults(false)}>
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 메인 대시보드 ────────────────────────────────────────────
  return (
    <div className="container">
      {/* 헤더 */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🎮 교사 관제 페이지</h2>
            <p style={{ marginTop: '0.25rem' }}>세션 코드: <strong style={{ fontSize: '1.4rem', color: '#a78bfa' }}>{sessionCode}</strong></p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap', width: 'auto', padding: '0.6rem 1.1rem', fontSize: '0.9rem' }} onClick={() => openResults(false)}>
              📊 순위 보기
            </button>
            <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap', width: 'auto', padding: '0.6rem 1.1rem', fontSize: '0.9rem' }} onClick={() => { if (window.confirm('정말 종료하시겠습니까?')) setCurrentScreen('home'); }}>
              종료
            </button>
          </div>
        </div>
      </div>

      {/* 라운드 제어 */}
      <div className="card mt-2">
        <h3>🎯 라운드 제어</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[1,2,3,4,5,6].map(round => (
            <button key={round} onClick={() => startRound(round)} className={currentRound === round ? 'btn btn-primary' : 'btn btn-secondary'} style={{ fontWeight: currentRound === round ? 700 : 400 }}>Round {round}</button>
          ))}
          <button onClick={pauseRound} className="btn btn-secondary" style={{ gridColumn: 'span 2' }}>⏸️ 일시정지</button>
        </div>
        {currentRound > 0 && (
          <div className="mt-2">
            <button onClick={completeJobExplanation} className="btn btn-primary" style={{ width: '100%' }}>✅ 직업 설명 완료 (미션 시작)</button>
            {currentRound === 2 && <button onClick={completeMission} className="btn btn-primary mt-1" style={{ width: '100%' }}>✅ 미션 완료 (퀴즈 시작)</button>}
            {currentRound === 5 && <button onClick={completeVideoWatching} className="btn btn-primary mt-1" style={{ width: '100%' }}>✅ 영상 시청 완료 (퀴즈 시작)</button>}
            {currentRound === 6 && (
              <button onClick={startRound6Quiz} className="btn btn-primary mt-1" style={{ width: '100%' }}>
                ✅ 포스터 감상 완료 (퀴즈 시작)
              </button>
            )}
          </div>
        )}
      </div>

      {/* 팀 현황 */}
      <div className="card mt-2">
        <h3>📊 참가 팀 ({(teams || []).length}팀)</h3>
        <div style={{ marginTop: '1rem' }}>
          {(teams || []).length === 0 ? (
            <div className="alert alert-info">
              <p>아직 참가한 팀이 없습니다</p>
              <p className="text-small mt-1">학생들이 세션 코드로 입장하여 팀을 만들 수 있습니다</p>
            </div>
          ) : (
            [...(teams || [])].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).map((team, idx) => {
              const rank = idx + 1;
              const badge = getBadgeLocal(rank);
              return (
                <div key={team.id} className="card" style={{ marginBottom: '0.5rem', background: rank <= 3 ? `linear-gradient(135deg,${badge.color}22,${badge.color}11)` : 'rgba(255,255,255,0.05)', border: rank <= 3 ? `2px solid ${badge.color}` : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{ fontSize: '2rem', flexShrink: 0 }}>{badge.emoji}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{team.name}</div>
                        <div className="text-small" style={{ opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.members?.join(', ') || '팀원 없음'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{team.totalScore || 0}점</div>
                      <div className="text-small" style={{ opacity: 0.7 }}>{rank}등</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.25rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {[1,2,3,4,5,6].map(r => (
                      <div key={r} style={{ textAlign: 'center' }}>
                        <div className="text-small" style={{ opacity: 0.6 }}>R{r}</div>
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

      {/* Round6 포스터 갤러리 */}
      {currentRound === 6 && round6Posters.length > 0 && (
        <div className="card mt-2">
          <h3>🎨 팀 포스터 갤러리 ({round6Posters.length}팀 제출)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginTop: '1rem' }}>
            {round6Posters.map((poster, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPoster(poster)}
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '2px solid rgba(16,185,129,0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {poster.image ? (
                  <img src={poster.image} alt={poster.title}
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                ) : (
                  <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{poster.icon || '🌍'}</div>
                )}
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{poster.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{poster.teamName} 팀</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 포스터 상세 모달 */}
      {selectedPoster && (
        <div
          onClick={() => setSelectedPoster(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
              border: '2px solid rgba(16,185,129,0.6)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setSelectedPoster(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '50%', width: '2rem', height: '2rem',
                color: 'white', cursor: 'pointer', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>{selectedPoster.teamName} 팀</div>
              {selectedPoster.image ? (
                <img src={selectedPoster.image} alt={selectedPoster.title}
                  style={{ width: '100%', maxWidth: '360px', borderRadius: '12px', marginBottom: '1.5rem', border: '2px solid rgba(255,255,255,0.2)' }} />
              ) : (
                <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>{selectedPoster.icon || '🌍'}</div>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{selectedPoster.title}</h3>
              <p style={{ lineHeight: 1.8, marginBottom: '1rem', opacity: 0.9 }}>{selectedPoster.idea}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', color: '#34d399' }}>"{selectedPoster.slogan}"</p>
            </div>
          </div>
        </div>
      )}

      {/* 최종 결과 버튼 */}
      <div className="card mt-2">
        <button onClick={() => openResults(true)} className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}>🏆 최종 결과 보기</button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
