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

  // ── 공통 헤더 컴포넌트 ─────────────────────────────────────
  const RoundHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <span className="round-badge">ROUND 5</span>
        <h2>🌍 지구 귀환</h2>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <p className="text-small">팀 점수</p>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // STAGE: story
  // ════════════════════════════════════════
  if (stage === 'story') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <style>{`
          @keyframes orbit { from{transform:rotate(0deg) translateX(40px) rotate(0deg)} to{transform:rotate(360deg) translateX(40px) rotate(-360deg)} }
          @keyframes escape { 0%{transform:rotate(0deg) translateX(40px);opacity:1} 50%{transform:rotate(180deg) translateX(60px);opacity:0.7} 100%{transform:rotate(360deg) translateX(100px);opacity:0} }
          @keyframes flyAway { 0%{transform:translateX(0) translateY(0) scale(1);opacity:1} 100%{transform:translateX(180px) translateY(-40px) scale(0.5);opacity:0} }
        `}</style>

        <div className="story-box" style={{ background: 'rgba(30,64,175,0.2)', border: '2px solid rgba(30,64,175,0.5)', marginBottom: '1.5rem' }}>
          <p>"타우 세티 e 행성 탐사 완료! 이제 이 귀중한 데이터를 가지고 지구로 돌아갈 시간입니다. 행성 중력을 벗어나 대기권에 정확히 진입해야 합니다!"</p>
        </div>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', textAlign: 'center', background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:'bold' }}>
          💡 우주 속도의 비밀
        </h3>

        {/* 제1우주속도 */}
        <div style={{ background:'rgba(59,130,246,0.2)', border:'2px solid rgba(59,130,246,0.5)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:'2.5rem' }}>🛰️</div>
            <div>
              <p style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'0.2rem' }}>제1우주속도 (7.9 km/s)</p>
              <p className="text-small">행성 주위를 원 궤도로 도는 최소 속도</p>
            </div>
          </div>
          <div style={{ position:'relative', height:'100px', background:'rgba(0,0,0,0.3)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', marginBottom:'0.75rem' }}>
            <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#3b82f6,#1e40af)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', position:'absolute' }}>🌍</div>
            <div style={{ position:'absolute', fontSize:'1.2rem', animation:'orbit 4s linear infinite' }}>🛰️</div>
            <div style={{ width:'80px', height:'80px', border:'2px dashed rgba(255,255,255,0.3)', borderRadius:'50%', position:'absolute' }}/>
          </div>
          <p className="text-small" style={{ opacity:0.85 }}><strong>예시:</strong> 국제우주정거장(ISS), 스타링크 위성</p>
        </div>

        {/* 제2우주속도 */}
        <div style={{ background:'rgba(251,191,36,0.2)', border:'2px solid rgba(251,191,36,0.5)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:'2.5rem' }}>🚀</div>
            <div>
              <p style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'0.2rem' }}>제2우주속도 (11.2 km/s)</p>
              <p className="text-small">지구의 중력을 완전히 벗어나는 탈출 속도</p>
            </div>
          </div>
          <div style={{ position:'relative', height:'100px', background:'rgba(0,0,0,0.3)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', marginBottom:'0.75rem' }}>
            <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', position:'absolute' }}>🌍</div>
            <div style={{ position:'absolute', fontSize:'1.2rem', animation:'escape 3s ease-out infinite' }}>🚀</div>
          </div>
          <p className="text-small" style={{ opacity:0.85 }}><strong>예시:</strong> 달 탐사 미션(아폴로, 아르테미스), 화성 탐사선</p>
        </div>

        {/* 제3우주속도 */}
        <div style={{ background:'rgba(168,85,247,0.2)', border:'2px solid rgba(168,85,247,0.5)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:'2.5rem' }}>🌌</div>
            <div>
              <p style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'0.2rem' }}>제3우주속도 (16.7 km/s)</p>
              <p className="text-small">태양의 중력까지 벗어나 태양계를 탈출하는 속도</p>
            </div>
          </div>
          <div style={{ position:'relative', height:'100px', background:'rgba(0,0,0,0.3)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', marginBottom:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', position:'absolute', left:'20%', boxShadow:'0 0 16px rgba(251,191,36,0.5)' }}>☀️</div>
            <div style={{ position:'absolute', fontSize:'1.2rem', left:'30%', animation:'flyAway 4s ease-in infinite' }}>🛸</div>
          </div>
          <p className="text-small" style={{ opacity:0.85 }}><strong>예시:</strong> 보이저 1호, 보이저 2호 (성간 우주 진입), 뉴호라이즌스</p>
        </div>

        <button className="btn btn-primary mt-2" onClick={goToNextStage}>
          다음: 직업 소개 →
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: job
  // ════════════════════════════════════════
  if (stage === 'job') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <h3>🔬 관련 직업</h3>
        <div className="job-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {jobs.map((job, idx) => (
            <div key={idx}
              className={job.isCore ? 'job-card job-card-primary' : 'job-card'}
              style={{ background: job.isCore ? 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(37,99,235,0.2))' : 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontSize: '3rem', textAlign: 'center' }}>{job.icon}</div>
              <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>{job.title}{job.isCore ? ' ⭐' : ''}</h4>
              <p className="text-small">{job.desc}</p>
            </div>
          ))}
        </div>
        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>👨‍🏫 교사 설명 시간</p>
          <p className="text-small">선생님의 직업 설명을 듣고 있어주세요!</p>
        </div>
        <div className="alert alert-warning mt-2" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>선생님이 완료 버튼을 누르면 자동으로 미션이 시작됩니다</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: mission
  // ════════════════════════════════════════
  if (stage === 'mission') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <h3>🎯 미션: 지구 귀환 궤도 계산</h3>

        {/* 단계 표시 */}
        <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0' }}>
          {missionPhases.map((phase, idx) => (
            <div key={idx} style={{
              flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: '10px',
              background: idx === missionPhase ? 'rgba(59,130,246,0.3)' : phaseResults.find(r => r.phase === idx) ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)',
              border: `2px solid ${idx === missionPhase ? '#3b82f6' : phaseResults.find(r => r.phase === idx) ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
            }}>
              <div style={{ fontSize: '1.8rem' }}>{phase.icon}</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.3rem' }}>{idx + 1}단계</p>
              <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>{phase.name}</p>
              {phaseResults.find(r => r.phase === idx) && <div style={{ fontSize: '1.2rem' }}>✅</div>}
            </div>
          ))}
        </div>

        {/* 현재 단계 */}
        <div className="story-box" style={{ background: 'rgba(30,64,175,0.2)', border: '2px solid rgba(30,64,175,0.5)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{currentPhase.icon} {currentPhase.name}</p>
          <p className="text-small">{currentPhase.description}</p>
          <p className="text-small mt-1" style={{ opacity: 0.8 }}>{currentPhase.info}</p>
        </div>

        <div className="alert alert-info mt-2">
          <p className="text-small" style={{ fontWeight: 600 }}>{currentPhase.angleHint}</p>
        </div>

        {/* 슬라이더 */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 속도 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>🚀 속도</span>
              <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '1.1rem' }}>{velocity.toFixed(1)} km/s</span>
            </div>
            <input type="range" min="5" max="20" step="0.1" value={velocity}
              onChange={(e) => { setVelocity(parseFloat(e.target.value)); setLaunchResult(null); }}
              style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
              <span>5 km/s</span><span>12.5 km/s</span><span>20 km/s</span>
            </div>
          </div>

          {/* 각도 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>📐 발사 각도</span>
              <span style={{ fontWeight: 700, color: '#a78bfa', fontSize: '1.1rem' }}>{angle > 0 ? '+' : ''}{angle.toFixed(1)}°</span>
            </div>
            <input type="range" min="-90" max="90" step="0.5" value={angle}
              onChange={(e) => { setAngle(parseFloat(e.target.value)); setLaunchResult(null); }}
              style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
              <span>-90° (아래)</span><span>0° (수평)</span><span>+90° (위)</span>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-2">
          <p className="text-small">{currentPhase.hint}</p>
        </div>

        {/* 발사 결과 */}
        {launchResult && (
          <div className={`alert ${launchResult.success ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '2rem' }}>{launchResult.success ? '✅' : '❌'}</div>
            <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>{launchResult.message}</p>
          </div>
        )}

        <button className="btn btn-primary mt-2" onClick={handlePhaseLaunch}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
          🚀 발사!
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: success
  // ════════════════════════════════════════
  if (stage === 'success') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '6rem' }}>🎉</div>
          <h3 style={{ marginTop: '0.5rem' }}>귀환 성공!</h3>
        </div>
        <div className="alert alert-success" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600 }}>✅ 2단계 미션을 모두 완료했습니다!</p>
          <p className="text-small mt-1">완벽한 궤도 계산으로 지구로 안전하게 귀환했습니다.</p>
        </div>
        <button className="btn btn-primary mt-2" onClick={goToNextStage}>
          다음: 귀환의 비밀 →
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: explanation
  // ════════════════════════════════════════
  if (stage === 'explanation') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '5rem' }}>🎓</div>
          <h3 style={{ marginTop: '0.5rem' }}>자유귀환궤도의 비밀</h3>
        </div>
        <div className="story-box" style={{ background: 'rgba(30,64,175,0.2)', border: '2px solid rgba(30,64,175,0.5)' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>🌕 달의 중력을 이용한 자유귀환궤도</p>
          <p className="text-small" style={{ lineHeight: 1.9 }}>
            여러분이 사용한 방법은 <strong>자유귀환궤도(스윙바이)</strong>입니다.<br/>
            달의 중력을 이용해 궤도를 바꾸면 연료를 거의 쓰지 않고도 지구로 귀환할 수 있어요.<br/>
            실제로 아폴로 13호가 달 착륙 실패 후 이 방법으로 지구에 무사히 돌아왔습니다!
          </p>
        </div>
        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>🔥 대기권 재진입의 핵심</p>
          <p className="text-small mt-1">
            진입 각도 <strong>-6° ~ -7°</strong> 범위가 황금 구간입니다.<br/>
            너무 가파르면 우주선이 타버리고, 너무 완만하면 대기권에서 튕겨나갑니다.
          </p>
        </div>
        <button className="btn btn-primary mt-2" onClick={goToNextStage}>
          다음: 영상 시청 →
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: explanation_video
  // ════════════════════════════════════════
  if (stage === 'explanation_video') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <h3>🎬 실제 귀환 영상</h3>
        <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
              src="https://www.youtube.com/embed/PnxBMRpMCbc?autoplay=1&mute=1"
              title="지구 귀환 영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className="alert alert-warning mt-2" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>선생님이 완료 버튼을 누르면 퀴즈가 시작됩니다</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: quiz
  // ════════════════════════════════════════
  if (stage === 'quiz') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            타우 세티 e에서 지구로 귀환하는 가장 효율적인 방법은?
          </p>
          {quizOptions.map((opt, i) => {
            let cls = 'quiz-option';
            if (quizAnswer === i) cls += ' selected';
            if (quizSubmitted) {
              if (i === correctAnswer) cls += ' correct';
              else if (quizAnswer === i) cls += ' wrong';
            }
            return (
              <button key={i} className={cls}
                onClick={() => !quizSubmitted && setQuizAnswer(i)}
                disabled={quizSubmitted}>
                {i + 1}. {opt}
                {quizSubmitted && i === correctAnswer && ' ✓ 정답'}
                {quizSubmitted && quizAnswer === i && i !== correctAnswer && ' ✗'}
              </button>
            );
          })}
        </div>
        {!quizSubmitted ? (
          <button className="btn btn-primary mt-2" onClick={handleQuizSubmit} disabled={quizAnswer === null}>
            답안 제출하기
          </button>
        ) : (
          <div className={`alert ${quizAnswer === correctAnswer ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '3rem' }}>{quizAnswer === correctAnswer ? '🎉' : '😢'}</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{quizAnswer === correctAnswer ? '정답입니다!' : '아쉽네요!'}</p>
            <p>{quizAnswer === correctAnswer ? '100점 획득! 다음 라운드를 기다려주세요.' : '다음 라운드에서 만회하세요!'}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
