import React, { useState, useEffect } from 'react';
import { updateTeamScore, subscribeToSession, updateMemberScore } from '../../utils/storage';

export default function Round5({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  const [missionPhase, setMissionPhase] = useState(0);
  const [velocity, setVelocity] = useState(10.0);
  const [angle, setAngle] = useState(0);
  const [phaseResults, setPhaseResults] = useState([]);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [launchResult, setLaunchResult] = useState(null); // 발사 결과 상태

  // ── 실시간 구독: JobExplained / VideoWatched 감지 ──
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (!session) return;
      // 교사 강제 이동
      if (session.round5Stage && session.round5Stage !== stage) {
        setStage(session.round5Stage);
      }

      if (session.round5JobExplained && (stage === 'job' || stage === 'story')) {
        setStage('mission');
      }
      if (session.round5VideoWatched && stage === 'explanation_video') {
        setStage('quiz');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

  const jobs = [
    { 
      icon: '🎯', 
      title: '궤도 역학 전문가', 
      desc: '재진입 궤도 설계 및 계산', 
      isCore: true 
    },
    { 
      icon: '🛡️', 
      title: '열차폐 시스템 엔지니어', 
      desc: '고온 환경 보호 설계' 
    },
    { 
      icon: '📡', 
      title: '비행 제어 엔지니어', 
      desc: '실시간 궤적 모니터링' 
    }
  ];

  // 귀환 미션 단계 (2단계)
  const missionPhases = [
    {
      id: 0,
      name: '타우 세티 e 행성 중력 탈출',
      icon: '🪐',
      description: '행성의 중력을 벗어나 귀환 궤도에 진입하기',
      targetVelocity: 12.5,
      velocityRange: [12.0, 13.0],
      targetAngle: 45,
      angleRange: [42, 48],
      info: '타우 세티 e는 지구보다 중력이 1.6배 강합니다. 지구의 제2우주속도(11.2 km/s)보다 더 높은 속도가 필요합니다.',
      angleHint: '발사 각도는 수평(0°)보다 위쪽을 향해야 합니다. 너무 낮으면 행성에 충돌하고, 너무 높으면 우주로 날아갑니다.',
      hint: '💡 힌트: 속도가 너무 낮으면 행성으로 다시 떨어지고, 각도가 너무 낮으면 궤도에 진입하지 못합니다!'
    },
    {
      id: 1,
      name: '지구 대기권 진입',
      icon: '🌍',
      description: '정확한 각도로 지구 대기권 재진입',
      targetVelocity: 11.0,
      velocityRange: [10.5, 11.3],
      targetAngle: -6.5,
      angleRange: [-7.0, -6.0],
      info: '대기권 재진입은 매우 정밀해야 합니다. 각도가 너무 가파르면 우주선이 타버리고, 너무 완만하면 대기권에서 튕겨나갑니다. 속도는 지구의 제2우주속도 근처여야 합니다.',
      angleHint: '재진입 각도는 음수(아래쪽)여야 합니다. 1단계와 달리 행성 표면을 향해 내려가야 하므로 -6° ~ -7° 사이를 시도해보세요!',
      hint: '💡 힌트: 이전 단계에서는 위쪽(+)으로 발사했다면, 이번에는 아래쪽(-)으로 진입해야 합니다!'
    }
  ];

  const quizOptions = [
    '가능한 한 빨리 직선으로 돌아온다',
    '달의 중력을 이용한 자유귀환궤도(스윙바이 방식)를 사용한다',
    '화성을 경유해서 돌아온다',
    '국제우주정거장에서 연료를 보급받는다'
  ];

  const correctAnswer = 1;

  const handlePhaseLaunch = () => {
    const phase = missionPhases[missionPhase];
    const velocityOk = velocity >= phase.velocityRange[0] && velocity <= phase.velocityRange[1];
    const angleOk = angle >= phase.angleRange[0] && angle <= phase.angleRange[1];
    
    // 발사 결과 저장
    if (velocityOk && angleOk) {
      setLaunchResult({
        success: true,
        message: '성공! 완벽한 궤도입니다!'
      });
      
      // 1초 후 다음 단계로 이동
      setTimeout(() => {
        const newResults = [...phaseResults, { phase: missionPhase, success: true }];
        setPhaseResults(newResults);
        
        if (missionPhase < missionPhases.length - 1) {
          setMissionPhase(missionPhase + 1);
          setVelocity(9.0);
          setAngle(-3.0);
          setLaunchResult(null);
        } else {
          setStage('success');
        }
      }, 2000);
    } else {
      // 실패 원인 분석
      let failureReason = '';
      
      if (!velocityOk && !angleOk) {
        if (velocity < phase.velocityRange[0]) {
          failureReason = '속도가 너무 낮아 중력에 끌려 떨어집니다! 각도도 조정이 필요합니다.';
        } else if (velocity > phase.velocityRange[1]) {
          failureReason = '속도가 너무 빨라 궤도를 벗어났습니다! 각도도 조정이 필요합니다.';
        }
      } else if (!velocityOk) {
        if (velocity < phase.velocityRange[0]) {
          failureReason = missionPhase === 0 
            ? '속도가 부족합니다! 행성 중력을 벗어나지 못하고 다시 떨어집니다. 😱'
            : '속도가 부족합니다! 지구 중력에 끌려 대기권에서 소멸됩니다. 🔥';
        } else {
          failureReason = missionPhase === 0
            ? '속도가 너무 빠릅니다! 목표 궤도를 지나쳐 우주로 멀어집니다. 🚀💨'
            : '속도가 너무 빠릅니다! 지구를 스쳐 지나가 버립니다. 🌍💨';
        }
      } else if (!angleOk) {
        if (angle < phase.angleRange[0]) {
          failureReason = missionPhase === 0
            ? '각도가 너무 낮습니다! 수평으로 날아가다 행성에 충돌합니다. 💥'
            : '진입 각도가 너무 가파릅니다! 대기와의 마찰로 우주선이 타버립니다. 🔥🔥🔥';
        } else {
          failureReason = missionPhase === 0
            ? '각도가 너무 높습니다! 우주로 날아가 버립니다. 🌌'
            : '진입 각도가 너무 완만합니다! 대기권에서 튕겨나가 우주로 되돌아갑니다. 🪃';
        }
      }
      
      setLaunchResult({
        success: false,
        message: failureReason
      });
    }
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    if (quizAnswer === correctAnswer) {
      await updateTeamScore(sessionCode, team.id, 100);
      if (team.currentStudentName) {
        await updateMemberScore(sessionCode, team.id, team.currentStudentName, 100);
      }
    }
  };

  const goToNextStage = () => {
    if (stage === 'story') setStage('job');
    else if (stage === 'job') setStage('mission');
    else if (stage === 'mission') setStage('success');
    else if (stage === 'success') setStage('explanation');
    else if (stage === 'explanation') setStage('explanation_video');
    // explanation_video에서 quiz로는 선생님 버튼으로만 이동 (useEffect에서 처리)
  };

  const currentPhase = missionPhases[missionPhase];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
      padding: '2rem',
      color: 'white'
    }}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
          }
          @keyframes escape {
            0% { transform: rotate(0deg) translateX(40px); opacity: 1; }
            50% { transform: rotate(180deg) translateX(60px); opacity: 0.7; }
            100% { transform: rotate(360deg) translateX(100px); opacity: 0; }
          }
          @keyframes flyAway {
            0% { transform: translateX(0) translateY(0) scale(1); opacity: 1; }
            100% { transform: translateX(200px) translateY(-50px) scale(0.5); opacity: 0; }
          }
        `}
      </style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🌍 Round 5: 지구 귀환
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            타우 세티 e 행성에서 지구로 안전 귀환
          </p>
        </div>

        {/* Story */}
        {stage === 'story' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '16px', 
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>
              🪐→🚀→🌍
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              "타우 세티 e 행성 탐사 완료! 놀라운 발견을 했습니다. 
              이제 이 귀중한 데이터를 가지고 지구로 돌아갈 시간입니다. 
              하지만 귀환은 출발보다 훨씬 더 복잡합니다. 
              먼저 이 행성의 강한 중력을 벗어나야 하고, 우주를 가로질러, 
              마지막으로 지구 대기권에 정확히 진입해야 합니다."
            </p>

            {/* 발사 각도 개념 설명 */}
            <div style={{
              background: 'rgba(168, 85, 247, 0.2)',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📐 발사 각도란?
              </h4>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                발사 각도는 수평선을 기준으로 로켓이 향하는 방향입니다.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                  • <strong>0°</strong> = 수평 (지평선과 평행)<br/>
                  • <strong>양수(+)</strong> = 위쪽을 향함 (예: +45°)<br/>
                  • <strong>음수(-)</strong> = 아래쪽을 향함 (예: -6.5°)<br/>
                  • <strong>90°</strong> = 수직 위로<br/>
                  • <strong>-90°</strong> = 수직 아래로
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9 }}>
                💡 <strong>꿀팁:</strong> 행성을 탈출할 때는 위쪽(+)으로 발사하고, 
                대기권에 진입할 때는 아래쪽(-)으로 진입해야 합니다!
              </p>
            </div>
            
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              💡 우주 속도의 비밀
            </h3>

            {/* 제1우주속도 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>🛰️</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                      제1우주속도 (7.9 km/s)
                    </p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
                      행성 주위를 원 궤도로 도는 최소 속도
                    </p>
                  </div>
                </div>
                
                {/* 궤도 애니메이션 */}
                <div style={{ 
                  position: 'relative', 
                  height: '120px', 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    borderRadius: '50%',
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🌍
                  </div>
                  <div style={{
                    position: 'absolute',
                    fontSize: '1.2rem',
                    animation: 'orbit 4s linear infinite'
                  }}>
                    🛰️
                  </div>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    border: '2px dashed rgba(255,255,255,0.4)',
                    borderRadius: '50%',
                    position: 'absolute'
                  }} />
                </div>
                
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.85 }}>
                  <strong>예시:</strong> 국제우주정거장(ISS), 스타링크 위성
                </p>
              </div>
            </div>

            {/* 제2우주속도 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(251, 191, 36, 0.2)',
                border: '2px solid rgba(251, 191, 36, 0.5)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>🚀</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                      제2우주속도 (11.2 km/s)
                    </p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
                      지구의 중력을 완전히 벗어나는 탈출 속도
                    </p>
                  </div>
                </div>
                
                {/* 탈출 애니메이션 */}
                <div style={{ 
                  position: 'relative', 
                  height: '120px', 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '50%',
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🌍
                  </div>
                  <div style={{
                    position: 'absolute',
                    fontSize: '1.2rem',
                    animation: 'escape 3s ease-out infinite'
                  }}>
                    🚀
                  </div>
                </div>
                
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.85 }}>
                  <strong>예시:</strong> 달 탐사 미션(아폴로, 아르테미스), 화성 탐사선
                </p>
              </div>
            </div>

            {/* 제3우주속도 */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.2)',
                border: '2px solid rgba(168, 85, 247, 0.5)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>🌌</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                      제3우주속도 (16.7 km/s)
                    </p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
                      태양의 중력까지 벗어나 태양계를 탈출하는 속도
                    </p>
                  </div>
                </div>
                
                {/* 태양계 탈출 애니메이션 */}
                <div style={{ 
                  position: 'relative', 
                  height: '120px', 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: '20%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                  }}>
                    ☀️
                  </div>
                  <div style={{
                    position: 'absolute',
                    fontSize: '1.2rem',
                    left: '30%',
                    animation: 'flyAway 4s ease-in infinite'
                  }}>
                    🛸
                  </div>
                </div>
                
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.85 }}>
                  <strong>예시:</strong> 보이저 1호, 보이저 2호 (성간 우주 진입), 뉴호라이즌스
                </p>
              </div>
            </div>

            <button 
              onClick={goToNextStage}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              다음: 직업 소개 →
            </button>
          </div>
        )}

        {/* Job */}
        {stage === 'job' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              👨‍🚀 관련 직업
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {jobs.map((job, idx) => (
                <div
                  key={idx}
                  style={{
                    background: job.isCore 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%)'
                      : 'rgba(255,255,255,0.1)',
                    border: job.isCore ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: `fadeInUp ${0.6 + idx * 0.1}s ease-out`
                  }}
                >
                  <div style={{ fontSize: '3rem' }}>{job.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                      {job.title}
                      {job.isCore && <span style={{ 
                        marginLeft: '0.5rem', 
                        fontSize: '0.8rem',
                        background: '#3b82f6',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                      }}>핵심</span>}
                    </p>
                    <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>{job.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontWeight: 600 }}>👨‍🏫 교사 설명 시간</p>
              <p className="text-small">선생님의 직업 설명을 듣고 있어주세요!</p>
            </div>
            <div className="alert alert-warning mt-2" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⏳</div>
              <p style={{ fontWeight: 600 }}>선생님이 완료 버튼을 누르면 자동으로 미션이 시작됩니다</p>
            </div>
          </div>
        )}

        {/* Mission */}
        {stage === 'mission' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            {/* 미션 진행도 표시 */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem',
              justifyContent: 'center'
            }}>
              {missionPhases.map((phase, idx) => (
                <div key={idx} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '1rem',
                  background: idx === missionPhase 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : phaseResults.find(r => r.phase === idx)
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  border: idx === missionPhase ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{phase.icon}</div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {idx === 0 ? '1단계' : '2단계'}
                  </p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>{phase.name}</p>
                  {phaseResults.find(r => r.phase === idx) && (
                    <div style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>✓</div>
                  )}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
              {currentPhase.icon} {currentPhase.name}
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              opacity: 0.9
            }}>
              {currentPhase.description}
            </p>

            {/* 정보 박스 */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                ℹ️ <strong>상황:</strong><br/>
                {currentPhase.info}
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem', opacity: 0.9 }}>
                📐 <strong>각도 가이드:</strong><br/>
                {currentPhase.angleHint}
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.9 }}>
                {currentPhase.hint}
              </p>
            </div>

            {/* 속도 조절 */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>🚀 속도 (km/s)</span>
                <span style={{ fontWeight: 700, color: '#60a5fa' }}>
                  {velocity.toFixed(1)} km/s
                </span>
              </div>
              <input
                type="range"
                min={currentPhase.velocityRange[0] - 2}
                max={currentPhase.velocityRange[1] + 2}
                step="0.1"
                value={velocity}
                onChange={(e) => setVelocity(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                opacity: 0.7
              }}>
                <span>최소</span>
                <span>권장 범위 내에서 조절하세요</span>
                <span>최대</span>
              </div>
            </div>

            {/* 각도 조절 */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>📐 진입 각도</span>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>
                  {angle.toFixed(1)}°
                </span>
              </div>
              <input
                type="range"
                min={currentPhase.angleRange[0] - 5}
                max={currentPhase.angleRange[1] + 5}
                step="0.1"
                value={angle}
                onChange={(e) => setAngle(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, #a78bfa, #8b5cf6)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                opacity: 0.7
              }}>
                <span>최소</span>
                <span>안전 범위 내에서 조절하세요</span>
                <span>최대</span>
              </div>
            </div>

            {/* 발사 버튼 */}
            <button
              onClick={handlePhaseLaunch}
              disabled={launchResult !== null}
              style={{
                width: '100%',
                padding: '1.5rem',
                fontSize: '1.3rem',
                background: launchResult !== null
                  ? 'rgba(100,100,100,0.5)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: launchResult !== null ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                transition: 'all 0.3s',
                marginBottom: launchResult ? '1rem' : '0'
              }}
            >
              🚀 현재 설정으로 발사!
            </button>

            {/* 발사 결과 메시지 */}
            {launchResult && (
              <div style={{
                padding: '1.5rem',
                background: launchResult.success 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '12px',
                animation: 'fadeInUp 0.5s ease-out',
                border: `3px solid ${launchResult.success ? '#10b981' : '#ef4444'}`
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  textAlign: 'center', 
                  marginBottom: '1rem' 
                }}>
                  {launchResult.success ? '🎉' : '❌'}
                </div>
                <p style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  textAlign: 'center',
                  marginBottom: '0.5rem'
                }}>
                  {launchResult.success ? '발사 성공!' : '발사 실패!'}
                </p>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  {launchResult.message}
                </p>
                
                {!launchResult.success && (
                  <button
                    onClick={() => setLaunchResult(null)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.8rem',
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    다시 시도하기 🔄
                  </button>
                )}
                
                {launchResult.success && (
                  <p style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>
                    잠시 후 다음 단계로 이동합니다...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Success - 무사 귀환 */}
        {stage === 'success' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>
              무사 귀환 성공!
            </h2>
            <p style={{ fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              축하합니다! 타우 세티 e 행성에서 지구까지<br/>
              안전하게 귀환하는 데 성공했습니다!
            </p>

            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
                ✅ 미션 요약
              </p>
              <div style={{ fontSize: '1rem', lineHeight: '2' }}>
                <p>✓ 1단계: 타우 세티 e 행성 중력 탈출 성공</p>
                <p>✓ 2단계: 지구 대기권 정밀 진입 성공</p>
                <p>✓ 우주비행사와 귀중한 탐사 데이터 모두 안전 확보</p>
              </div>
            </div>

            <button 
              onClick={goToNextStage}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              다음: 실제 사례 보기 →
            </button>
          </div>
        )}

        {/* Explanation - 아르테미스 사례 */}
        {stage === 'explanation' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              🌙 실제 사례: 아르테미스 귀환
            </h2>

            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem' }}>
                🛰️ 아르테미스 I (2022년 11월)
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                NASA의 아르테미스 I 미션은 무인 우주선 오리온을 달 궤도까지 보냈다가 
                지구로 귀환시킨 역사적인 시험 비행이었습니다.
              </p>
              
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>주요 성과:</p>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                  • 비행 거리: 약 220만 km<br/>
                  • 달 궤도 비행 시간: 6일<br/>
                  • 총 미션 기간: 25.5일<br/>
                  • 재진입 속도: 약 40,000 km/h (11.1 km/s)<br/>
                  • 최고 온도: 약 2,760°C
                </p>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🔥 열차폐막 문제</p>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  재진입 중 열차폐막이 예상보다 빨리 탄화되어 일부가 떨어져 나가는 문제가 발생했습니다. 
                  NASA는 이 문제를 분석하여 아르테미스 II의 재진입 궤도를 수정했습니다.
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem' }}>
                🚀 아르테미스 II (2026년 4월 - 유인 미션)
              </p>
              <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                4명의 우주비행사를 태운 첫 유인 달 궤도 비행 미션입니다.
              </p>
              
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>개선된 귀환 전략:</p>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                  • 더 가파른 재진입 각도: -6.5°<br/>
                  • 극한 온도 노출 시간: 20분 → 13.5분<br/>
                  • 열차폐막 탄화 속도 감소<br/>
                  • 우주비행사 안전성 대폭 향상
                </p>
              </div>
            </div>

            <button 
              onClick={goToNextStage}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📹 영상 시청하러 가기 →
            </button>
          </div>
        )}

        {/* Explanation Video - 영상 시청 안내 */}
        {stage === 'explanation_video' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              border: '2px solid rgba(251, 191, 36, 0.5)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                📹
              </div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                아르테미스 I 귀환 영상 시청
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                선생님과 함께 아르테미스 우주선의<br/>
                실제 지구 귀환 영상을 시청합니다.
              </p>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1.5rem'
              }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.9 }}>
                  👨‍🏫 영상 시청 후, 선생님께서<br/>
                  다음 퀴즈 단계로 진행하실 예정입니다.
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                ⏳ 선생님의 안내를 기다려주세요
              </p>
            </div>
          </div>
        )}

        {/* Quiz */}
        {stage === 'quiz' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              ❓ 퀴즈
            </h2>

            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: '1.6' }}>
                아르테미스 II가 달 탐사 후 안전하게 지구로 돌아오는 방법은?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {quizOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !quizSubmitted && setQuizAnswer(idx)}
                    disabled={quizSubmitted}
                    style={{
                      padding: '1rem',
                      fontSize: '1rem',
                      background: quizSubmitted
                        ? idx === correctAnswer
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : quizAnswer === idx
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'rgba(255,255,255,0.1)'
                        : quizAnswer === idx
                          ? 'rgba(59, 130, 246, 0.5)'
                          : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: quizAnswer === idx && !quizSubmitted
                        ? '2px solid #3b82f6'
                        : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      cursor: quizSubmitted ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      fontWeight: quizAnswer === idx ? 600 : 400,
                      opacity: quizSubmitted && idx !== correctAnswer && idx !== quizAnswer ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {idx + 1}. {option}
                    {quizSubmitted && idx === correctAnswer && ' ✓ 정답'}
                    {quizSubmitted && idx === quizAnswer && idx !== correctAnswer && ' ✗'}
                  </button>
                ))}
              </div>
            </div>

            {!quizSubmitted && quizAnswer !== null && (
              <button 
                onClick={handleQuizSubmit}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                답안 제출하기
              </button>
            )}

            {quizSubmitted && (
              <div style={{
                background: quizAnswer === correctAnswer
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {quizAnswer === correctAnswer ? '🎉' : '😢'}
                </div>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {quizAnswer === correctAnswer ? '정답입니다!' : '아쉽네요!'}
                </p>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  {quizAnswer === correctAnswer 
                    ? '200점 획득! Round 5 완료!'
                    : '정답은 "달의 중력을 이용한 자유귀환궤도(스윙바이 방식)를 사용한다" 입니다!'}
                </p>
                
                {quizAnswer === correctAnswer && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    textAlign: 'left'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      💡 설명:
                    </p>
                    <p style={{ lineHeight: '1.6' }}>
                      아르테미스는 <strong>자유귀환궤도(스윙바이 방식, Free Return Trajectory)</strong>를 사용합니다. 
                      이는 달의 중력을 이용해 자동으로 지구로 돌아오는 8자 모양의 궤도입니다.
                      <br/><br/>
                      만약 우주선에 문제가 생겨도, 별도의 추진력 없이 달의 중력이 
                      우주선을 자연스럽게 지구로 되돌려 보내주는 안전한 방식입니다.
                      <br/><br/>
                      아폴로 13호도 이 궤도 덕분에 사고 상황에서 무사히 귀환할 수 있었습니다! 🌙→🌍
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
