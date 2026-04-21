import { useState, useEffect } from 'react';
import { updateTeamScore, subscribeToSession, saveSession, updateMemberScore } from '../../utils/storage';

function Round6({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  
  // 포스터 제작 상태
  const [posterTitle, setPosterTitle] = useState('');
  const [posterIdea, setPosterIdea] = useState('');
  const [posterIcon, setPosterIcon] = useState('🌍');
  const [posterSlogan, setPosterSlogan] = useState('');
  const [posterSubmitted, setPosterSubmitted] = useState(false);
  
  // Canvas 그림판 상태
  const [canvasRef, setCanvasRef] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#10b981');
  const [brushSize, setBrushSize] = useState(3);
  const [drawnImage, setDrawnImage] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [toolMode, setToolMode] = useState('pen');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [startPos, setStartPos] = useState(null);
  
  // 퀴즈 상태
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ── 실시간 구독: JobExplained / QuizStarted 감지 ──
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (!session) return;
      // 교사 강제 이동
      if (session.round6Stage && session.round6Stage !== stage) {
        setStage(session.round6Stage);
      }

      if (session.round6JobExplained && (stage === 'job' || stage === 'story')) {
        setStage('mission');
      }
      if (session.round6QuizStarted && stage === 'posterDone') {
        setStage('quiz');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

  const availableIcons = ['🛰️', '♻️', '🌍', '🚀', '🗑️', '🌱', '⚡', '🌟'];
  const drawingColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#000000'];
  const backgroundColors = ['#ffffff', '#f0f9ff', '#fef3c7', '#fee2e2', '#f3e8ff', '#1e3a8a', '#064e3b'];

  // Canvas 초기화 함수
  const initCanvas = (canvas) => {
    if (canvas && !canvasRef) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setCanvasRef(canvas);
      setBackgroundColor('#ffffff');
    }
  };

  // Canvas 배경색 변경
  const changeBackgroundColor = (color) => {
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    
    // 현재 그림을 임시 캔버스에 저장
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.width;
    tempCanvas.height = canvasRef.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvasRef, 0, 0);
    
    // 새 배경색으로 채우기
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    
    // 저장한 그림 다시 그리기
    ctx.drawImage(tempCanvas, 0, 0);
    
    setBackgroundColor(color);
  };

  // Canvas 그림판 함수들
  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!canvasRef) return;
    e.preventDefault();
    
    const coords = getCoordinates(e, canvasRef);
    setStartPos(coords);
    setIsDrawing(true);
    
    if (toolMode === 'pen') {
      const ctx = canvasRef.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef || toolMode !== 'pen') return;
    e.preventDefault();
    
    const coords = getCoordinates(e, canvasRef);
    const ctx = canvasRef.getContext('2d');
    
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing || !canvasRef) return;
    e.preventDefault();
    
    const coords = getCoordinates(e, canvasRef);
    const ctx = canvasRef.getContext('2d');
    
    if (toolMode === 'rect' && startPos) {
      ctx.fillStyle = drawingColor;
      ctx.fillRect(
        Math.min(startPos.x, coords.x),
        Math.min(startPos.y, coords.y),
        Math.abs(coords.x - startPos.x),
        Math.abs(coords.y - startPos.y)
      );
    } else if (toolMode === 'circle' && startPos) {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2)
      );
      ctx.fillStyle = drawingColor;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    setIsDrawing(false);
    setStartPos(null);
  };

  const clearCanvas = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
  };

  const saveDrawing = () => {
    if (!canvasRef) return;
    const imageData = canvasRef.toDataURL('image/png');
    setDrawnImage(imageData);
    setShowCanvas(false);
    setPosterIcon('');
  };

  const deleteDrawing = () => {
    setDrawnImage(null);
    setPosterIcon('🌍');
  };

  // 이미지 업로드 함수
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다!');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        
        // 이미지를 Canvas 크기에 맞게 조정
        const scale = Math.min(
          canvasRef.width / img.width,
          canvasRef.height / img.height
        );
        const x = (canvasRef.width - img.width * scale) / 2;
        const y = (canvasRef.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const discussionTopics = [
    {
      icon: '🛰️',
      title: '우주 쓰레기 제거',
      question: '작동을 멈춘 위성과 우주 쓰레기를 어떻게 제거할 수 있을까요?',
      hints: ['그물이나 작살 사용', '로봇 팔로 포획', '레이저로 궤도 변경']
    },
    {
      icon: '♻️',
      title: '우주 재활용',
      question: '우주에서도 재활용이 가능할까요? 어떻게 할 수 있을까요?',
      hints: ['고장난 위성 부품 재사용', '우주정거장에서 수리', '귀중한 금속 회수']
    },
    {
      icon: '📜',
      title: '예방 정책',
      question: '우주 쓰레기를 만들지 않으려면 어떤 규칙이 필요할까요?',
      hints: ['사용 후 대기권 재진입', '위성 수명 연장', '국제 우주 환경 협약']
    },
    {
      icon: '🌍',
      title: '깨끗한 우주',
      question: '미래 세대를 위해 우주를 깨끗하게 유지하는 방법은?',
      hints: ['지속가능한 설계', '우주 청소 로봇', '우주 환경 모니터링']
    }
  ];

  const submitPoster = async () => {
    if (!posterTitle.trim() || !posterIdea.trim() || !posterSlogan.trim()) {
      alert('모든 항목을 입력해주세요!');
      return;
    }

    if (!drawnImage && !posterIcon) {
      alert('그림을 그리거나 이모티콘을 선택해주세요!');
      return;
    }

    const { getSession } = await import('../../utils/storage');
    const session = await getSession(sessionCode);
    if (!session.round6Posters) {
      session.round6Posters = [];
    }
    
    const posterData = {
      teamId: team.id,
      teamName: team.name,
      title: posterTitle,
      idea: posterIdea,
      icon: posterIcon,
      image: drawnImage,
      slogan: posterSlogan,
      timestamp: Date.now()
    };
    
    session.round6Posters = session.round6Posters.filter(p => p.teamId !== team.id);
    session.round6Posters.push(posterData);
    
    await saveSession(sessionCode, session);
    setPosterSubmitted(true);
    setStage('posterDone');
    await updateTeamScore(sessionCode, team.id, 100);
    // 팀원 전체에게 개인 점수 100점 지급
    if (team.members && team.members.length > 0) {
      for (const member of team.members) {
        await updateMemberScore(sessionCode, team.id, member, 100);
      }
    }
  };

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    if (quizAnswer === '2') {
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
            <span className="round-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              ROUND 6
            </span>
            <h2>🌍 지속가능한 우주</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🌍♻️</div>
        </div>

        <div className="story-box" style={{ 
          background: 'rgba(16, 185, 129, 0.2)', 
          border: '2px solid rgba(16, 185, 129, 0.5)',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            "우주 탐사가 본격화되면서 우주에는 수많은 쓰레기가 쌓이고 있습니다. 
            작동을 멈춘 위성, 임무를 마친 탐사선, 고장난 로봇들... 
            우리는 우주도 지속가능하게 만들어야 합니다!"
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 우주 쓰레기 현황
          </h3>
          <div style={{ fontSize: '1rem', lineHeight: '2' }}>
            <p>• 작동 중인 위성: 약 <strong>5,000개</strong></p>
            <p>• 버려진 위성: 약 <strong>3,000개</strong></p>
            <p>• 우주 쓰레기 파편: <strong>100만 개 이상</strong></p>
            <p>• 충돌 위험도: <strong style={{ color: '#ef4444' }}>매년 증가 중 ⚠️</strong></p>
          </div>
        </div>

        <div style={{
          background: 'rgba(251, 191, 36, 0.2)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>⚠️ 케슬러 신드롬이란?</h4>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            우주 쓰레기끼리 충돌하면 더 많은 파편이 생기고, 
            그 파편들이 다시 충돌하는 <strong>연쇄 반응</strong>이 일어날 수 있습니다. 
            이렇게 되면 우주를 아예 사용할 수 없게 될 수도 있습니다!
          </p>
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
            <span className="round-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              ROUND 6
            </span>
            <h2>🌍 지속가능한 우주</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
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
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🌱</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주 환경 전문가 ⭐</h4>
            <p className="text-small">우주 쓰레기 추적 및 지속가능 정책 수립</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>♻️</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주 쓰레기 제거 엔지니어</h4>
            <p className="text-small">청소 기술 개발 및 실행</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>📜</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주 법률 전문가</h4>
            <p className="text-small">국제 우주 환경 규정 제정</p>
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

  // Mission 단계 - 팀 토론 & 포스터 제작
  if (stage === 'mission') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              ROUND 6
            </span>
            <h2>🌍 지속가능한 우주</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        {!posterSubmitted ? (
          <>
            <h3 style={{ marginBottom: '1rem' }}>💡 미션: 우리 팀의 해결 아이디어 포스터 만들기</h3>
            
            {/* 토론 주제 선택 */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🗣️ 팀원들과 토론해보세요 (5-7분)</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {discussionTopics.map((topic, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {topic.icon} {topic.title}
                    </p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{topic.question}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      힌트: {topic.hints.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 포스터 제작 폼 */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                📝 우리 팀의 홍보 포스터
              </h4>

              {/* 제목 입력 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ✏️ 포스터 제목 (캐치프레이즈)
                </label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="예: 우주도 재활용!"
                  maxLength={30}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white'
                  }}
                />
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
                  {posterTitle.length}/30자
                </p>
              </div>

              {/* 아이디어 입력 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  💡 우리 팀의 해결 아이디어
                </label>
                <textarea
                  value={posterIdea}
                  onChange={(e) => setPosterIdea(e.target.value)}
                  placeholder="예: 고장난 위성의 부품을 수거해서 새 위성을 만들 때 재사용합니다."
                  maxLength={150}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
                  {posterIdea.length}/150자
                </p>
              </div>

              {/* Canvas 그림판 또는 이모티콘 선택 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🎨 포스터 이미지 만들기
                </label>
                
                {/* Canvas 그림판 열기 버튼 */}
                {!drawnImage && (
                  <button
                    onClick={() => setShowCanvas(true)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      marginBottom: '1rem'
                    }}
                  >
                    ✏️ 그림 그리기
                  </button>
                )}

                {/* Canvas 그림판 모달 */}
                {showCanvas && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.95)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    overflowY: 'auto'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      maxWidth: '700px',
                      width: '100%',
                      maxHeight: '90vh',
                      overflowY: 'auto'
                    }}>
                      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        🎨 그림 그리기
                      </h3>
                      
                      {/* 도구 선택 */}
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>도구:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setToolMode('pen')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: toolMode === 'pen' ? '#10b981' : 'rgba(255,255,255,0.1)',
                              border: toolMode === 'pen' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.3)',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            ✏️ 펜
                          </button>
                          <button
                            onClick={() => setToolMode('rect')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: toolMode === 'rect' ? '#10b981' : 'rgba(255,255,255,0.1)',
                              border: toolMode === 'rect' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.3)',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            ▢ 사각형
                          </button>
                          <button
                            onClick={() => setToolMode('circle')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: toolMode === 'circle' ? '#10b981' : 'rgba(255,255,255,0.1)',
                              border: toolMode === 'circle' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.3)',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            ⬤ 원
                          </button>
                        </div>
                      </div>

                      {/* 색상 선택 */}
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>그리기 색상:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {drawingColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setDrawingColor(color)}
                              style={{
                                width: '40px',
                                height: '40px',
                                background: color,
                                border: drawingColor === color ? '4px solid white' : '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 배경색 선택 */}
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>배경색:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {backgroundColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => changeBackgroundColor(color)}
                              style={{
                                width: '40px',
                                height: '40px',
                                background: color,
                                border: backgroundColor === color ? '4px solid white' : '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 브러시 크기 (펜 모드일 때만) */}
                      {toolMode === 'pen' && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            브러시 크기: {brushSize}px
                          </p>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      {/* 이미지 업로드 */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                          display: 'block',
                          padding: '0.8rem',
                          background: 'rgba(147, 51, 234, 0.3)',
                          border: '2px dashed rgba(147, 51, 234, 0.5)',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}>
                          📤 이미지 업로드 (Canvas 위에 붙여넣기)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {/* Canvas */}
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <canvas
                          ref={initCanvas}
                          width={500}
                          height={400}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          style={{
                            borderRadius: '8px',
                            cursor: toolMode === 'pen' ? 'crosshair' : 'pointer',
                            width: '100%',
                            maxWidth: '500px',
                            height: 'auto',
                            touchAction: 'none',
                            border: '3px solid rgba(255,255,255,0.5)',
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      </div>

                      {/* 버튼들 */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={clearCanvas}
                          style={{
                            padding: '0.8rem',
                            background: 'rgba(239, 68, 68, 0.3)',
                            border: '2px solid #ef4444',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          🗑️ 지우기
                        </button>
                        <button
                          onClick={() => {
                            setShowCanvas(false);
                            setCanvasRef(null);
                          }}
                          style={{
                            padding: '0.8rem',
                            background: 'rgba(100,100,100,0.3)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          취소
                        </button>
                        <button
                          onClick={saveDrawing}
                          style={{
                            padding: '0.8rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          ✅ 완료
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 그린 이미지 또는 이모티콘 선택 */}
                {drawnImage ? (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      ✅ 그린 그림
                    </p>
                    <img 
                      src={drawnImage} 
                      alt="Drawn poster" 
                      style={{ 
                        maxWidth: '200px', 
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }} 
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setShowCanvas(true);
                          setCanvasRef(null);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          background: 'rgba(59, 130, 246, 0.3)',
                          color: 'white',
                          border: '1px solid #3b82f6',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ 다시 그리기
                      </button>
                      <button
                        onClick={deleteDrawing}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          background: 'rgba(239, 68, 68, 0.3)',
                          color: 'white',
                          border: '1px solid #ef4444',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                      또는 이모티콘 선택:
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {availableIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => {
                            setPosterIcon(icon);
                            setDrawnImage(null);
                          }}
                          style={{
                            fontSize: '2rem',
                            padding: '0.5rem',
                            background: posterIcon === icon 
                              ? 'rgba(59, 130, 246, 0.5)' 
                              : 'rgba(255,255,255,0.1)',
                            border: posterIcon === icon 
                              ? '3px solid #3b82f6' 
                              : '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 슬로건 입력 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🎯 한 줄 슬로건
                </label>
                <input
                  type="text"
                  value={posterSlogan}
                  onChange={(e) => setPosterSlogan(e.target.value)}
                  placeholder="예: 지구도, 우주도 함께!"
                  maxLength={40}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white'
                  }}
                />
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
                  {posterSlogan.length}/40자
                </p>
              </div>

              {/* 미리보기 */}
              {(posterTitle || posterIdea || posterSlogan || drawnImage || posterIcon) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
                  border: '3px solid #10b981',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginTop: '1.5rem'
                }}>
                  <h5 style={{ fontSize: '1rem', marginBottom: '1rem', textAlign: 'center', opacity: 0.9 }}>
                    📋 미리보기
                  </h5>
                  <div style={{ textAlign: 'center' }}>
                    {drawnImage ? (
                      <img 
                        src={drawnImage} 
                        alt="Drawn poster" 
                        style={{ 
                          maxWidth: '250px', 
                          borderRadius: '8px',
                          marginBottom: '1rem',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{posterIcon}</div>
                    )}
                    {posterTitle && (
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                        {posterTitle}
                      </h3>
                    )}
                    {posterIdea && (
                      <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {posterIdea}
                      </p>
                    )}
                    {posterSlogan && (
                      <p style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        fontStyle: 'italic',
                        opacity: 0.9
                      }}>
                        "{posterSlogan}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary"
              onClick={submitPoster}
              disabled={!posterTitle.trim() || !posterIdea.trim() || !posterSlogan.trim() || (!drawnImage && !posterIcon)}
              style={{
                width: '100%',
                opacity: (!posterTitle.trim() || !posterIdea.trim() || !posterSlogan.trim() || (!drawnImage && !posterIcon)) ? 0.5 : 1
              }}
            >
              ✅ 포스터 제출하기
            </button>
          </>
        ) : (
          <div>
            <div className="alert alert-success" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                포스터 제출 완료!
              </p>
              <p style={{ fontSize: '1rem' }}>
                100점 획득! 다른 팀의 발표를 들어보세요.
              </p>
            </div>

            {/* 제출된 포스터 표시 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '3px solid #10b981',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              {drawnImage ? (
                <img 
                  src={drawnImage} 
                  alt="Team poster" 
                  style={{ 
                    maxWidth: '300px', 
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }} 
                />
              ) : (
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{posterIcon}</div>
              )}
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                {posterTitle}
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                {posterIdea}
              </p>
              <p style={{ 
                fontSize: '1.2rem', 
                fontWeight: 600, 
                fontStyle: 'italic',
                opacity: 0.9
              }}>
                "{posterSlogan}"
              </p>
            </div>

            <div className="alert alert-info mt-2" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p style={{ fontWeight: 600 }}>선생님이 포스터 감상을 완료하면<br/>퀴즈가 자동으로 시작됩니다</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // posterDone 단계 - 포스터 제출 완료 후 선생님 퀴즈 시작 대기
  if (stage === 'posterDone') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <span className="round-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>ROUND 6</span>
            <h2>🌍 지속가능한 우주</h2>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div className="alert alert-success" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
          <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>포스터 제출 완료!</p>
          <p style={{ fontSize: '1rem' }}>100점 획득! 선생님과 함께 다른 팀의 포스터를 감상해보세요.</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))',
          border: '2px solid rgba(16,185,129,0.4)',
          borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🖼️</div>
          <p style={{ fontWeight: 600, opacity: 0.9 }}>교사 화면에서 각 팀의 포스터를 클릭하면 크게 볼 수 있어요</p>
        </div>

        <div className="alert alert-warning" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>선생님이 포스터 감상을 완료하면<br/>퀴즈가 자동으로 시작됩니다</p>
        </div>
      </div>
    );
  }

  // Quiz 단계
  if (stage === 'quiz') {
    const options = [
      '사용 후 대기권에서 태우기 (디오빗)',
      '그물이나 작살로 포획하기',
      '우주 쓰레기를 달에 버리기',
      '위성 수명 연장 기술 개발'
    ];

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              ROUND 6
            </span>
            <h2>🌍 지속가능한 우주</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            우주 쓰레기를 줄이기 위한 실제 기술/정책이 <strong>아닌 것</strong>은?
          </p>
          {options.map((opt, i) => {
            let className = 'quiz-option';
            if (quizAnswer === i.toString()) className += ' selected';
            if (quizSubmitted) {
              if (i === 2) className += ' correct';
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
                {quizSubmitted && i === 2 && ' ✓ 정답'}
                {quizSubmitted && quizAnswer === i.toString() && i !== 2 && ' ✗'}
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
          <div className={`alert ${quizAnswer === '2' ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '3rem' }}>{quizAnswer === '2' ? '🎉' : '😢'}</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {quizAnswer === '2' ? '정답입니다!' : '아쉽네요!'}
            </p>
            <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              {quizAnswer === '2' 
                ? '100점 획득! 🎊 모든 라운드를 완료했습니다!' 
                : '우주 쓰레기를 달에 버리면 달 환경도 오염됩니다. 실제로는 대기권 재진입, 포획, 수명 연장 등의 방법을 사용합니다.'}
            </p>
            {quizAnswer === '2' && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🌟 최종 메시지
                </p>
                <p style={{ lineHeight: '1.6' }}>
                  우주는 인류 모두의 미래입니다. 
                  지속가능한 우주 개발을 통해 
                  다음 세대에게 깨끗한 우주를 물려줍시다!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round6;
