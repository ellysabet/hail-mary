import { useState, useEffect } from 'react';
import { updateTeamScore, subscribeToSession, updateMemberScore } from '../../utils/storage';

function Round4({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  
  // 미션 상태
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [targets, setTargets] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [visitedTargets, setVisitedTargets] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 퀴즈 상태
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 탐사 항목 (순서대로!)
  const missionItems = [
    { 
      icon: '🔋', 
      name: '에너지 확인', 
      desc: '로봇 작동 필수!', 
      successMsg: '✅ Step 1 성공! 에너지원을 확인했습니다!',
      detailInfo: {
        title: '🔋 에너지 상태 분석',
        standard: '로봇 작동에 필요한 최소 에너지: 85%',
        result: '현재 에너지 잔량: 94%',
        conclusion: '✅ 에너지 충분! 탐사를 안전하게 진행할 수 있습니다.'
      }
    },
    { 
      icon: '🌡️', 
      name: '온도 측정', 
      desc: '생존 가능 온도?', 
      successMsg: '✅ Step 2 성공! 온도를 측정했습니다!',
      detailInfo: {
        title: '🌡️ 행성 온도 분석',
        standard: '인간 생존 가능 온도: -20°C ~ 50°C',
        result: '현재 행성 표면 온도: 15°C',
        conclusion: '✅ 생존 가능한 온도! 이주 프로젝트를 계속 진행합니다.'
      }
    },
    { 
      icon: '💧', 
      name: '물 탐지', 
      desc: '생명체 가능성', 
      successMsg: '✅ Step 3 성공! 물의 존재 여부를 확인했습니다!',
      detailInfo: {
        title: '💧 수자원 탐지',
        standard: '생명 유지에 필요한 물: 액체 상태 H₂O',
        result: '지하 50m 깊이에서 액체 상태의 물 발견!',
        conclusion: '✅ 수자원 확보 가능! 장기 정착에 유리한 환경입니다.'
      }
    },
    { 
      icon: '🪨', 
      name: '토양 샘플', 
      desc: '자원 확인', 
      successMsg: '✅ Step 4 성공! 토양 샘플을 채취했습니다!',
      detailInfo: {
        title: '🪨 토양 성분 분석',
        standard: '농업 가능 토양: 질소, 인, 칼륨 함유',
        result: '토양 성분: 질소 2.1%, 인 0.8%, 칼륨 1.5%',
        conclusion: '✅ 식물 재배 가능! 식량 자급자족이 가능한 환경입니다.'
      }
    },
    { 
      icon: '📸', 
      name: '사진 촬영', 
      desc: '탐사 기록', 
      successMsg: '✅ Step 5 성공! 사진 촬영을 완료했습니다!',
      detailInfo: {
        title: '📸 탐사 데이터 기록',
        standard: '필수 기록: 지형, 지질, 대기 상태',
        result: '고해상도 파노라마 사진 300장 촬영 완료',
        conclusion: '✅ 모든 탐사 완료! 이 행성은 이주에 적합합니다.',
        extra: '📡 모든 사진을 탐사선으로 전송합니다...'
      }
    }
  ];

  // ── 실시간 구독: JobExplained 감지 ──
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (session?.round4JobExplained && (stage === 'job' || stage === 'story')) {
        initializeGame();
        setStage('mission');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

  // 게임 초기화
  const initializeGame = () => {
    const startPos = { x: 0, y: 0 };
    setRobotPos(startPos);
    
    const gridSize = 5;
    const newTargets = [];
    const usedPositions = [{ x: 0, y: 0 }];
    
    for (let i = 0; i < missionItems.length; i++) {
      let pos;
      let attempts = 0;
      
      do {
        pos = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
        attempts++;
      } while (
        (isPositionUsed(pos, usedPositions) || isTooClose(pos, usedPositions)) &&
        attempts < 50
      );
      
      usedPositions.push(pos);
      newTargets.push({ ...pos, item: missionItems[i] });
    }
    
    setTargets(newTargets);
    setCurrentTarget(0);
    setVisitedTargets([]);
    setMoveCount(0);
    setShowSuccess(false);
  };

  const isPositionUsed = (pos, positions) => {
    return positions.some(p => p.x === pos.x && p.y === pos.y);
  };

  const isTooClose = (pos, positions) => {
    return positions.some(p => {
      const distance = Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y);
      return distance < 2;
    });
  };

  // 로봇 이동
  const moveRobot = (direction) => {
    if (showSuccess) return;
    
    let newX = robotPos.x;
    let newY = robotPos.y;
    
    if (direction === 'up' && robotPos.y > 0) newY--;
    if (direction === 'down' && robotPos.y < 4) newY++;
    if (direction === 'left' && robotPos.x > 0) newX--;
    if (direction === 'right' && robotPos.x < 4) newX++;
    
    setRobotPos({ x: newX, y: newY });
    setMoveCount(moveCount + 1);
    
    checkTargetReached(newX, newY);
  };

  const checkTargetReached = (x, y) => {
    const currentTargetPos = targets[currentTarget];
    
    if (currentTargetPos && x === currentTargetPos.x && y === currentTargetPos.y) {
      setVisitedTargets([...visitedTargets, currentTarget]);
      setSuccessMessage(currentTargetPos.item.successMsg);
      setShowSuccess(true);
    }
  };

  const continueToNext = () => {
    setShowSuccess(false);
    setCurrentTarget(currentTarget + 1);
    
    if (currentTarget === targets.length - 1) {
      setTimeout(() => {
        setStage('explanation');
      }, 500);
    }
  };

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    if (quizAnswer === '1') {
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
            <span className="round-badge">ROUND 4</span>
            <h2>🤖 행성 탐사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🪐</div>
        </div>

        <div className="story-box" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '2px solid rgba(16, 185, 129, 0.5)' }}>
          <p>"행성에 도착했지만 로봇을 먼저 보내 탐사를 해야 합니다! 로봇을 조종하여 중요한 순서대로 탐사를 진행하세요!"</p>
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
            <span className="round-badge">ROUND 4</span>
            <h2>🤖 행성 탐사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🔬 관련 직업</h3>
        <div className="job-grid">
          <div className="job-card job-card-primary" style={{ 
            border: '3px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🤖</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>로봇공학자 ⭐</h4>
            <p className="text-small">로봇 설계 및 프로그래밍</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>💻</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>소프트웨어 엔지니어</h4>
            <p className="text-small">로봇 제어 프로그램 개발</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>📊</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>데이터 분석가</h4>
            <p className="text-small">탐사 데이터 분석</p>
          </div>
        </div>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>👨‍🏫 교사 설명 시간</p>
          <p className="text-small">선생님의 직업 설명을 듣고 있어주세요!</p>
        </div>

        <div className="alert alert-warning mt-2" style={{ 
            background: 'rgba(16, 185, 129, 0.2)', 
            border: '2px solid rgba(16, 185, 129, 0.5)',
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

  // Mission 단계
  if (stage === 'mission') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 4</span>
            <h2>🤖 행성 탐사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🎮 로봇 조종 미션</h3>
        <p>버튼을 클릭해서 로봇을 이동시키세요!</p>

        {/* 진행 상황 */}
        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>
            진행 상황: {visitedTargets.length}/{targets.length} 완료
          </p>
          <p className="text-small">이동 횟수: {moveCount}번</p>
        </div>

        {/* 다음 목표 */}
        {currentTarget < targets.length && (
          <div className="story-box mt-2" style={{ 
            background: 'rgba(16, 185, 129, 0.2)', 
            border: '2px solid rgba(16, 185, 129, 0.5)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              다음 목표: Step {currentTarget + 1}
            </p>
            <div style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
              {missionItems[currentTarget].icon}
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              {missionItems[currentTarget].name}
            </p>
            <p className="text-small">{missionItems[currentTarget].desc}</p>
          </div>
        )}

        {/* 맵 그리드 */}
        <div style={{ 
          marginTop: '2rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {Array.from({ length: 25 }).map((_, index) => {
              const x = index % 5;
              const y = Math.floor(index / 5);
              const isRobot = robotPos.x === x && robotPos.y === y;
              const target = targets.find(t => t.x === x && t.y === y);
              const targetIndex = targets.indexOf(target);
              const isVisited = visitedTargets.includes(targetIndex);
              const isCurrent = targetIndex === currentTarget;

              return (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    background: isRobot 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : (target && isCurrent)
                      ? 'rgba(251, 191, 36, 0.3)'
                      : (target && isVisited)
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(255,255,255,0.1)',
                    border: (target && isCurrent) 
                      ? '3px solid #fbbf24' 
                      : '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    position: 'relative'
                  }}
                >
                  {isRobot && '🤖'}
                  {target && !isRobot && (
                    <>
                      <span style={{ opacity: isVisited ? 0.5 : 1 }}>
                        {target.item.icon}
                      </span>
                      {isVisited && (
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          fontSize: '1rem'
                        }}>
                          ✓
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 조작 버튼 */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            <div></div>
            <button 
              className="btn btn-primary"
              onClick={() => moveRobot('up')}
              disabled={showSuccess}
              style={{ padding: '1rem', fontSize: '1.5rem' }}
            >
              ⬆️
            </button>
            <div></div>
            
            <button 
              className="btn btn-primary"
              onClick={() => moveRobot('left')}
              disabled={showSuccess}
              style={{ padding: '1rem', fontSize: '1.5rem' }}
            >
              ◀️
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => moveRobot('down')}
              disabled={showSuccess}
              style={{ padding: '1rem', fontSize: '1.5rem' }}
            >
              ⬇️
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => moveRobot('right')}
              disabled={showSuccess}
              style={{ padding: '1rem', fontSize: '1.5rem' }}
            >
              ▶️
            </button>
          </div>
        </div>

        {/* 성공 메시지 팝업 */}
        {showSuccess && currentTarget < targets.length && (
          <div className="alert alert-success mt-2" style={{ 
            textAlign: 'center',
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              {successMessage}
            </p>
            
            {/* 상세 정보 */}
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              marginTop: '1rem',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
                {targets[currentTarget]?.item.detailInfo.title}
              </p>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.3rem' }}>📊 기준:</p>
                <p style={{ fontWeight: 600 }}>{targets[currentTarget]?.item.detailInfo.standard}</p>
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.3rem' }}>🔍 측정 결과:</p>
                <p style={{ fontWeight: 600 }}>{targets[currentTarget]?.item.detailInfo.result}</p>
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                border: '2px solid rgba(16, 185, 129, 0.5)'
              }}>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {targets[currentTarget]?.item.detailInfo.conclusion}
                </p>
              </div>
              
              {/* 사진 촬영 단계일 때 전송 메시지 추가 */}
              {targets[currentTarget]?.item.detailInfo.extra && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  textAlign: 'center'
                }}>
                  <p style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {targets[currentTarget]?.item.detailInfo.extra}
                  </p>
                </div>
              )}
            </div>
            
            <button 
              className="btn btn-primary mt-2"
              onClick={continueToNext}
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontSize: '1.1rem',
                padding: '1rem'
              }}
            >
              {currentTarget < targets.length - 1 ? '다음 탐사 진행 →' : '탐사 완료! →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Explanation 단계
  if (stage === 'explanation') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 4</span>
            <h2>🤖 행성 탐사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '6rem' }}>🎓</div>
          <h3 style={{ marginTop: '1rem' }}>탐사 순서의 비밀</h3>
        </div>

        <div className="alert alert-success" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            미션 완료!
          </p>
          <p>총 {moveCount}번 이동으로 모든 탐사를 완료했습니다!</p>
        </div>

        <div className="story-box" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '2px solid rgba(16, 185, 129, 0.5)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            🤖 왜 이 순서로 탐사할까?
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            {missionItems.map((item, i) => (
              <div key={i} style={{ 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                  {i + 1}. {item.icon} {item.name}
                </p>
                <p style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
                  {i === 0 && '로봇이 작동하려면 에너지가 필수! 먼저 확인해야 합니다.'}
                  {i === 1 && '극한 온도는 로봇을 고장낼 수 있어요. 안전 확인이 필요합니다.'}
                  {i === 2 && '물은 생명체의 기본 조건! 생명체 가능성을 확인합니다.'}
                  {i === 3 && '토양을 분석하면 행성의 자원을 알 수 있어요.'}
                  {i === 4 && '마지막으로 사진을 찍어 탐사 내용을 기록합니다.'}
                </p>
              </div>
            ))}
          </div>
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

  // Quiz 단계
  if (stage === 'quiz') {
    const options = [
      '탐사 로봇의 사진 촬영',
      '탐사 로봇의 에너지 상태',
      '행성 표면의 색깔',
      '로봇의 이동 속도'
    ];

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 4</span>
            <h2>🤖 행성 탐사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            로봇 탐사에서 가장 먼저 확인해야 하는 것은?
          </p>
          {options.map((opt, i) => {
            let className = 'quiz-option';
            if (quizAnswer === i.toString()) className += ' selected';
            if (quizSubmitted) {
              if (i === 1) className += ' correct';
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
                {quizSubmitted && i === 1 && ' ✓ 정답'}
                {quizSubmitted && quizAnswer === i.toString() && i !== 1 && ' ✗'}
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
          <div className={`alert ${quizAnswer === '1' ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '3rem' }}>{quizAnswer === '1' ? '🎉' : '😢'}</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {quizAnswer === '1' ? '정답입니다!' : '아쉽네요!'}
            </p>
            <p>
              {quizAnswer === '1' 
                ? '100점 획득! 로봇의 에너지 확인이 최우선입니다!' 
                : '에너지가 없으면 로봇이 작동할 수 없어요!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round4;
