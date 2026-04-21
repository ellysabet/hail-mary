import { useState, useEffect } from 'react';
import { updateTeamScore, subscribeToSession, updateMemberScore } from '../../utils/storage';

function Round3({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  
  // Mission Part 1 상태
  const [experiencedFolds, setExperiencedFolds] = useState([]);
  const [currentFold, setCurrentFold] = useState(null);
  
  // Mission Part 2 상태
  const [sunAngle, setSunAngle] = useState(45);
  const [panelAngle, setPanelAngle] = useState(45);
  const [successCount, setSuccessCount] = useState(0);
  
  // Quiz 상태
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ── 실시간 구독: JobExplained 감지 ──
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
            // 교사 강제 이동
      if (session.round3Stage && session.round3Stage !== stage) {
        setStage(session.round3Stage);
      }
if (session?.round3JobExplained && (stage === 'job' || stage === 'story')) {
        setStage('mission1');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

  // 접기 방식 정보
  const foldTypes = {
    zfold: {
      name: 'Z-Fold',
      nameKo: '지그재그 접기',
      size: '40cm × 40cm × 20cm',
      difficulty: 1,
      speed: '5초',
      efficiency: '80%',
      cost: 1,
      pros: '제작 간단, 저렴',
      cons: '면적 효율 낮음',
      icon: '┃┃┃┃'
    },
    miura: {
      name: 'Miura-Fold',
      nameKo: '미우라 접기',
      size: '30cm × 30cm × 15cm',
      difficulty: 4,
      speed: '2초',
      efficiency: '95%',
      cost: 4,
      pros: '한 번에 펼침, 고효율',
      cons: '제작 어려움, 비쌈',
      realUse: '일본 우주 망원경',
      icon: '◇◇◇'
    },
    accordion: {
      name: 'Accordion-Fold',
      nameKo: '아코디언 접기',
      size: '25cm × 25cm × 30cm',
      difficulty: 2,
      speed: '8초',
      efficiency: '100%',
      cost: 3,
      pros: '가장 컴팩트, 최대 면적',
      cons: '전개 시간 김',
      realUse: 'ISS 태양전지판',
      icon: '≡≡≡'
    }
  };

  const experienceFold = (foldType) => {
    if (!experiencedFolds.includes(foldType)) {
      setExperiencedFolds([...experiencedFolds, foldType]);
    }
    setCurrentFold(foldType);
  };

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    if (quizAnswer === '0') {
      await updateTeamScore(sessionCode, team.id, 100);
      if (team.currentStudentName) {
        await updateMemberScore(sessionCode, team.id, team.currentStudentName, 100);
      }
    }
  };

  // Story 단계
  if (stage === 'story') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>☀️</div>
        </div>

        <div className="story-box" style={{ background: 'rgba(234, 179, 8, 0.2)', border: '2px solid rgba(234, 179, 8, 0.5)' }}>
          <p>"우주선에 에너지가 필요합니다! 태양전지판을 효율적으로 설계하고 최적의 각도로 태양을 향하게 하세요!"</p>
        </div>

        <button className="btn btn-primary mt-2" onClick={() => setStage('job')}>
          다음: 직업 소개 →
        </button>
      </div>
    );
  }

  // Job 단계
  if (stage === 'job') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🔬 관련 직업</h3>
        <div className="job-grid">
          <div className="job-card job-card-primary" style={{ 
            border: '3px solid #eab308',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.2) 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>⚡</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>에너지공학자 ⭐</h4>
            <p className="text-small">태양 에너지 시스템 설계</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🔌</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>전기공학자</h4>
            <p className="text-small">전력 시스템 관리</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🌍</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주환경연구원</h4>
            <p className="text-small">우주 환경 분석</p>
          </div>
        </div>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>👨‍🏫 교사 설명 시간</p>
          <p className="text-small">선생님의 직업 설명을 듣고 있어주세요!</p>
        </div>

        <div className="alert alert-warning mt-2" style={{ 
            background: 'rgba(251, 191, 36, 0.2)', 
            border: '2px solid rgba(251, 191, 36, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              선생님이 직업 설명을 완료하면 자동으로 미션이 시작됩니다
            </p>
          </div>
      </div>
    );
  }

  // Mission Part 1: 접기 방식 체험
  if (stage === 'mission1') {
    const allExperienced = experiencedFolds.length === 3;

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>📐 Mission 1: 태양전지판 접기 방식 체험</h3>
        <p>3가지 접기 방식을 모두 체험해보세요!</p>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>
            체험 완료: {experiencedFolds.length}/3
          </p>
        </div>

        {/* 접기 방식 선택 버튼 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          {Object.entries(foldTypes).map(([key, fold]) => (
            <button
              key={key}
              className="btn"
              style={{
                padding: '1.5rem',
                background: experiencedFolds.includes(key) 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: currentFold === key ? '3px solid #fbbf24' : 'none',
                position: 'relative'
              }}
              onClick={() => experienceFold(key)}
            >
              {experiencedFolds.includes(key) && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '1.5rem' }}>✓</div>
              )}
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{fold.icon}</div>
              <div style={{ fontWeight: 700 }}>{fold.nameKo}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>{fold.name}</div>
            </button>
          ))}
        </div>

        {/* 선택된 방식 상세 정보 */}
        {currentFold && (
          <div className="story-box mt-2" style={{ background: 'rgba(234, 179, 8, 0.2)', border: '2px solid rgba(234, 179, 8, 0.5)' }}>
            <h4 style={{ marginBottom: '1rem' }}>{foldTypes[currentFold].nameKo} ({foldTypes[currentFold].name})</h4>
            
            {/* 영상/애니메이션 영역 */}
            <div style={{ 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '12px', 
              padding: '1rem',
              marginBottom: '1.5rem',
              overflow: 'hidden'
            }}>
              {currentFold === 'zfold' && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    src="https://www.youtube.com/embed/3V-vnILN-1k?autoplay=1&mute=1&loop=1&playlist=3V-vnILN-1k"
                    title="Z-Fold Solar Panel"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {currentFold === 'miura' && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    src="https://www.youtube.com/embed/7Mb47w0vB04?autoplay=1&mute=1&loop=1&playlist=7Mb47w0vB04"
                    title="Miura-Fold"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {currentFold === 'accordion' && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    src="https://www.youtube.com/embed/I5PLNHAs2io?autoplay=1&mute=1&loop=1&playlist=I5PLNHAs2io"
                    title="Accordion-Fold ISS"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              <p style={{ 
                textAlign: 'center', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem', 
                opacity: 0.8 
              }}>
                🎥 실제 {foldTypes[currentFold].nameKo} 영상
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>📦 탑재 크기</p>
                <p style={{ fontWeight: 600 }}>{foldTypes[currentFold].size}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>⚙️ 기술 난이도</p>
                <p style={{ fontWeight: 600 }}>{'★'.repeat(foldTypes[currentFold].difficulty)}{'☆'.repeat(5 - foldTypes[currentFold].difficulty)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>⚡ 전개 속도</p>
                <p style={{ fontWeight: 600 }}>{foldTypes[currentFold].speed}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>📐 최종 면적</p>
                <p style={{ fontWeight: 600 }}>{foldTypes[currentFold].efficiency}</p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <p style={{ marginBottom: '0.5rem' }}>👍 <strong>장점:</strong> {foldTypes[currentFold].pros}</p>
              <p style={{ marginBottom: '0.5rem' }}>👎 <strong>단점:</strong> {foldTypes[currentFold].cons}</p>
              {foldTypes[currentFold].realUse && (
                <p style={{ marginBottom: 0 }}>🌟 <strong>실제 사용:</strong> {foldTypes[currentFold].realUse}</p>
              )}
            </div>
          </div>
        )}

        {/* 다음 단계 버튼 */}
        {allExperienced && (
          <button 
            className="btn btn-primary mt-2" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={() => setStage('summary')}
          >
            다음: 비교 정리 보기 →
          </button>
        )}
      </div>
    );
  }

  // Summary: 비교 정리
  if (stage === 'summary') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem' }}>📊</div>
          <h3 style={{ marginTop: '1rem' }}>3가지 방식 비교 정리</h3>
        </div>

        {/* 비교 표 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
                <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>항목</th>
                <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>Z-Fold</th>
                <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>Miura</th>
                <th style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>Accordion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}>탑재 크기</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>40×40×20cm</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>30×30×15cm</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(34, 197, 94, 0.2)' }}>25×25×30cm ⭐</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}>기술 난이도</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>★☆☆☆☆</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>★★★★☆</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>★★☆☆☆</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}>전개 속도</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>5초</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(34, 197, 94, 0.2)' }}>2초 ⭐</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>8초</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}>면적 효율</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>80%</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>95%</td>
                <td style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(34, 197, 94, 0.2)' }}>100% ⭐</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="story-box" style={{ background: 'rgba(234, 179, 8, 0.2)', border: '2px solid rgba(234, 179, 8, 0.5)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>💡 핵심 포인트</p>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
            <li><strong>컴팩트 ↔ 전개 속도:</strong> Accordion은 가장 작지만 전개가 느림</li>
            <li><strong>난이도 ↔ 효율:</strong> Miura는 어렵지만 빠르고 효율적</li>
            <li><strong>실제 선택:</strong> ISS는 면적 효율을 우선해 Accordion 사용!</li>
          </ul>
        </div>

        <div className="alert alert-success mt-2" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            ✅ 이제 태양전지판이 펼쳐졌습니다!<br/>
            최적의 각도를 맞춰 에너지를 생산하세요!
          </p>
        </div>

        <button 
          className="btn btn-primary mt-2" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          onClick={() => {
            // 태양 각도 랜덤 설정
            setSunAngle(Math.floor(Math.random() * 90));
            setStage('mission2');
          }}
        >
          다음: 각도 맞추기 시작 →
        </button>
      </div>
    );
  }

  // Mission Part 2: 각도 맞추기
  if (stage === 'mission2') {
    const isCorrect = Math.abs(panelAngle - sunAngle) <= 5;

    const handleSuccess = () => {
      const newCount = successCount + 1;
      setSuccessCount(newCount);
      
      if (newCount >= 3) {
        // 3번 성공하면 Explanation으로
        setTimeout(() => setStage('explanation'), 1000);
      } else {
        // 다음 문제
        setTimeout(() => {
          setSunAngle(Math.floor(Math.random() * 90));
          setPanelAngle(45);
        }, 1500);
      }
    };

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🎯 Mission 2: 태양 각도 맞추기</h3>
        <p>태양전지판을 태양 쪽으로 향하게 하세요!</p>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>
            성공: {successCount}/3 {successCount > 0 && '🎉'}
          </p>
        </div>

        {/* 시각화 영역 */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '12px',
          position: 'relative',
          height: '250px'
        }}>
          {/* 태양 */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: `${sunAngle}%`,
            fontSize: '3rem',
            transition: 'left 0.3s'
          }}>
            ☀️
          </div>

          {/* 태양전지판 */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: `translateX(-50%) rotate(${panelAngle - 90}deg)`,
            transition: 'transform 0.3s'
          }}>
            <div style={{
              width: '120px',
              height: '15px',
              background: isCorrect 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '4px',
              border: '2px solid rgba(255,255,255,0.5)'
            }}></div>
          </div>

          {/* 받침대 */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '30px',
            background: '#64748b'
          }}></div>
        </div>

        {/* 각도 조절 슬라이더 */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>태양 위치: {sunAngle}°</span>
            <span style={{ fontWeight: 700, color: isCorrect ? '#22c55e' : '#3b82f6' }}>
              패널 각도: {panelAngle}° {isCorrect && '✓'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={panelAngle}
            onChange={(e) => setPanelAngle(parseInt(e.target.value))}
            style={{ width: '100%', height: '8px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.3rem' }}>
            <span>0°</span>
            <span>45°</span>
            <span>90°</span>
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          className="btn btn-primary mt-2"
          style={{ 
            width: '100%', 
            padding: '1rem',
            background: isCorrect 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
          }}
          onClick={handleSuccess}
          disabled={!isCorrect}
        >
          {isCorrect ? '✓ 정확합니다! 클릭하세요!' : `목표: ${sunAngle}° ± 5°`}
        </button>
      </div>
    );
  }

  // Explanation: 각도의 비밀
  if (stage === 'explanation') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '6rem' }}>🎓</div>
          <h3 style={{ marginTop: '1rem' }}>태양 각도의 비밀</h3>
        </div>

        <div className="story-box" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.5)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            ☀️ 태양 입사각과 에너지 효율
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                📐 각도별 효율
              </p>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><strong>90° (정면):</strong> 100% 효율 ⭐</li>
                <li><strong>45° (비스듬):</strong> 70% 효율</li>
                <li><strong>0° (평행):</strong> 0% 효율</li>
              </ul>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px'
            }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                🛰️ 실제 ISS는?
              </p>
              <p style={{ lineHeight: '1.8' }}>
                ISS의 태양전지판은 <strong>태양 추적 시스템</strong>을 장착!
                자동으로 태양을 따라 회전하여 항상 최적 각도를 유지합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-2" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            💡 이제 배운 내용을 퀴즈로 확인해볼까요?
          </p>
        </div>

        <button 
          className="btn btn-primary mt-2" 
          onClick={() => setStage('quiz')}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          퀴즈 시작하기 →
        </button>
      </div>
    );
  }

  // Quiz
  if (stage === 'quiz') {
    const options = [
      '컴팩트한 접기 + 정확한 각도 조절',
      '빠른 전개 + 높은 가격',
      '쉬운 제작 + 고정 각도',
      '큰 크기 + 무거운 무게'
    ];

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 3</span>
            <h2>☀️ 우주 에너지 확보</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            우주선 태양전지판 설계에서 가장 중요한 2가지는?
          </p>
          {options.map((opt, i) => {
            let className = 'quiz-option';
            if (quizAnswer === i.toString()) className += ' selected';
            if (quizSubmitted) {
              if (i === 0) className += ' correct';
              else if (quizAnswer === i.toString()) className += ' wrong';
            }

            return (
              <button
                key={i}
                className={className}
                onClick={() => !quizSubmitted && setQuizAnswer(i.toString())}
                disabled={quizSubmitted}
              >
                {i + 1}. {opt}
                {quizSubmitted && i === 0 && ' ✓ 정답'}
                {quizSubmitted && quizAnswer === i.toString() && i !== 0 && ' ✗'}
              </button>
            );
          })}
        </div>

        {!quizSubmitted ? (
          <button
            className="btn btn-primary mt-2"
            onClick={submitQuiz}
            disabled={!quizAnswer}
          >
            답안 제출하기
          </button>
        ) : (
          <div className={`alert ${quizAnswer === '0' ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '3rem' }}>{quizAnswer === '0' ? '🎉' : '😢'}</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {quizAnswer === '0' ? '정답입니다!' : '아쉽네요!'}
            </p>
            <p>
              {quizAnswer === '0' 
                ? '100점 획득! 컴팩트한 설계와 정확한 각도 조절이 핵심이에요!' 
                : '다음 라운드에서 만회하세요!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round3;
