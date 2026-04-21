import { useState, useEffect } from 'react';
import { updateTeamScore, subscribeToSession, updateMemberScore } from '../../utils/storage';

function Round2({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ── 실시간 구독: JobExplained / MissionCompleted 감지 ──
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (!session) return;
      // 교사 강제 이동
      if (session.round2Stage && session.round2Stage !== stage) {
        setStage(session.round2Stage);
      }

      if (session.round2JobExplained && (stage === 'job' || stage === 'story')) {
        setStage('mission');
      }
      if (session.round2MissionCompleted && stage === 'mission') {
        setStage('explanation');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

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
            <span className="round-badge">ROUND 2</span>
            <h2>🚀 로켓 발사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🚀</div>
        </div>

        <div className="story-box" style={{ background: 'rgba(153, 27, 27, 0.2)', border: '2px solid rgba(153, 27, 27, 0.5)' }}>
          <p>"타우 세티 e로 가는 여정이 시작됩니다! 여러분의 팀이 설계한 로켓을 발사하여 우주로 날아가보세요!"</p>
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
            <span className="round-badge">ROUND 2</span>
            <h2>🚀 로켓 발사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🔬 관련 직업</h3>
        <div className="job-grid">
          <div className="job-card job-card-primary" style={{ 
            border: '3px solid #ef4444',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🛠️</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>로켓공학자 ⭐</h4>
            <p className="text-small">로켓 설계 및 제작</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>👨‍🚀</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주비행사</h4>
            <p className="text-small">우주 임무 수행</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🎮</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>발사관제사</h4>
            <p className="text-small">발사 과정 제어</p>
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

  // Mission 단계 (오프라인)
  if (stage === 'mission') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 2</span>
            <h2>🚀 로켓 발사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🎯 종이 로켓 설계 챌린지</h3>
        
        <div className="alert alert-info">
          <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
            📄 A4 용지 1장으로 최고의 로켓을 설계하세요!
          </p>
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📦 준비물:</p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>A4 용지 1장</strong> (팀당)</li>
              <li>그게 끝!</li>
            </ul>
          </div>
        </div>

        <div className="story-box mt-2" style={{ background: 'rgba(153, 27, 27, 0.2)', border: '2px solid rgba(153, 27, 27, 0.5)' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>🚀 설계 규칙:</p>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
            <li><strong>접기, 구기기, 찢기 모두 가능!</strong></li>
            <li>테이프, 풀 사용 금지</li>
            <li>손으로 던져서 발사</li>
            <li>3분 안에 완성!</li>
          </ul>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>💡 설계 포인트:</p>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>무게 중심: 앞쪽이 무거워야 안정적!</li>
              <li>공기저항: 날개 크기가 중요!</li>
              <li>형태: 뾰족할수록 빠르게!</li>
            </ul>
          </div>
        </div>

        <div className="alert alert-success mt-2">
          <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>🎯 2단계 미션</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>🚀</div>
              <p style={{ fontWeight: 600, textAlign: 'center' }}>Mission 1</p>
              <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>최장 거리 비행</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ fontWeight: 600, textAlign: 'center' }}>Mission 2</p>
              <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>정밀 착륙</p>
            </div>
          </div>
        </div>

        <div className="alert alert-warning mt-2" style={{ 
            background: 'rgba(251, 191, 36, 0.2)', 
            border: '2px solid rgba(251, 191, 36, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              두 미션을 모두 완료하고 선생님이 확인하면 퀴즈가 시작됩니다
            </p>
          </div>
      </div>
    );
  }

  // Explanation 단계 (NEW!)
  if (stage === 'explanation') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 2</span>
            <h2>🚀 로켓 발사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '6rem' }}>🎓</div>
          <h3 style={{ marginTop: '1rem' }}>미션 성공의 비밀</h3>
        </div>

        <div className="story-box" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.5)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            🎯 성공 포인트와 로켓공학의 연결
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✈️ Mission 1 (최장 거리)의 비밀
              </p>
              <p style={{ lineHeight: '1.8' }}>
                <strong>무게 중심</strong>이 앞쪽에 있어야 안정적으로 날아갑니다. 
                실제 로켓도 무거운 엔진과 연료 탱크를 아래쪽에 배치하여 
                비행 중 안정성을 확보합니다!
              </p>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                🎯 Mission 2 (정밀 착륙)의 비밀
              </p>
              <p style={{ lineHeight: '1.8' }}>
                <strong>공기역학적 설계</strong>가 핵심입니다. 
                날개의 크기와 각도, 뾰족한 형태가 공기 흐름을 제어합니다. 
                SpaceX 로켓이 정확하게 착륙하는 것도 같은 원리예요!
              </p>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                ⚖️ Trade-off (절충)
              </p>
              <p style={{ lineHeight: '1.8' }}>
                종이를 많이 접으면 <strong>무게는 늘어나지만 안정성</strong>이 높아지고, 
                얇게 만들면 <strong>가볍지만 불안정</strong>해집니다. 
                실제 로켓공학자도 이런 균형을 고민합니다!
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

  // Quiz 단계
  if (stage === 'quiz') {
    const options = [
      '로켓이 무거울수록 멀리 날아간다',
      '무게 중심이 앞쪽에 있으면 안정적이다',
      '공기역학적 설계가 비행에 중요하다',
      '종이를 많이 접을수록 항상 좋다'
    ];

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 2</span>
            <h2>🚀 로켓 발사</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            방금 배운 내용 중, 로켓이 정확하게 착륙하기 위해 가장 중요한 것은?
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
            <p>
              {quizAnswer === '2' 
                ? '100점 획득! Mission 2에서 경험했듯이 공기역학적 설계가 핵심이에요!' 
                : '다음 라운드에서 만회하세요!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round2;
