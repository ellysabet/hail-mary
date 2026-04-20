import { useState, useEffect } from 'react';
import { updateTeamScore, getSession } from '../../utils/storage';

function Round1({ team, sessionCode }) {
  const [stage, setStage] = useState('story');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [requiredMatched, setRequiredMatched] = useState([]);
  const [showTime, setShowTime] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [jobExplained, setJobExplained] = useState(false);

  // Job 설명 완료 상태 체크 (2초마다)
  useEffect(() => {
    if (stage === 'job') {
      const interval = setInterval(() => {
        const session = getSession(sessionCode);
        if (session?.round1JobExplained) {
          setJobExplained(true);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [stage, sessionCode]);

  // Job 설명 완료되면 자동으로 Mission으로
  useEffect(() => {
    if (jobExplained && stage === 'job') {
      setStage('mission');
    }
  }, [jobExplained, stage]);

  // 카드 초기화
  useEffect(() => {
    if (stage === 'mission') {
      initializeCards();
    }
  }, [stage]);

  const initializeCards = () => {
    const cardPairs = [
      { icon: '💧', name: '물', required: true },
      { icon: '☀️', name: '햇빛', required: true },
      { icon: '🌡️', name: '온도', required: true },
      { icon: '🌊', name: '대기', required: true },
      { icon: '🧬', name: 'DNA', required: false },
      { icon: '🔬', name: '세포', required: false },
      { icon: '🪨', name: '토양', required: false },
      { icon: '🌱', name: '식물', required: false }
    ];

    let newCards = [];
    cardPairs.forEach((pair, idx) => {
      newCards.push({ ...pair, id: idx * 2, pairId: idx });
      newCards.push({ ...pair, id: idx * 2 + 1, pairId: idx });
    });

    newCards.sort(() => Math.random() - 0.5);
    
    setCards(newCards);
    setShowTime(Date.now());
    setFlipped([]);
    setMatched([]);
    setRequiredMatched([]);
  };

  const elapsed = showTime ? Date.now() - showTime : 0;
  const showing = elapsed < 3000;

  const handleCardClick = (cardId, icon, pairId, required) => {
    if (showing) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(icon)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setTimeout(() => checkMatch(newFlipped), 1000);
    }
  };

  const checkMatch = (flippedCards) => {
    const card1 = cards.find(c => c.id === flippedCards[0]);
    const card2 = cards.find(c => c.id === flippedCards[1]);

    if (card1.pairId === card2.pairId) {
      setMatched([...matched, card1.icon]);
      
      if (card1.required) {
        setRequiredMatched([...requiredMatched, card1.icon]);
      }
    }

    setFlipped([]);
  };

  const resetGame = () => {
    initializeCards();
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    
    if (quizAnswer === '1') {
      updateTeamScore(sessionCode, team.id, 100);
    }
  };

  if (stage === 'story') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 1</span>
            <h2>🪐 새로운 행성 발견</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🪐</div>
        </div>

        <div className="story-box" style={{ background: 'rgba(30, 58, 138, 0.2)', border: '2px solid rgba(30, 58, 138, 0.5)' }}>
          <p>"40광년 떨어진 타우 세티 e, 생명체가 있을까요? 행성 데이터를 분석하여 생명의 흔적을 찾아보세요!"</p>
        </div>

        <button className="btn btn-primary mt-2" onClick={() => setStage('job')}>
          다음: 직업 소개 →
        </button>
      </div>
    );
  }

  if (stage === 'job') {
    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 1</span>
            <h2>🪐 새로운 행성 발견</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🔬 관련 직업</h3>
        <div className="job-grid">
          <div className="job-card job-card-primary" style={{ 
            border: '3px solid #a78bfa',
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.4)'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🔬</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주생물학자 ⭐</h4>
            <p className="text-small">생명체 존재 가능성 분석</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🌍</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>행성과학자</h4>
            <p className="text-small">행성 환경 연구</p>
          </div>
          <div className="job-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>📊</div>
            <h4 style={{ fontWeight: 700, margin: '0.5rem 0' }}>우주과학자</h4>
            <p className="text-small">종합 데이터 분석</p>
          </div>
        </div>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>👨‍🏫 교사 설명 시간</p>
          <p className="text-small">선생님의 직업 설명을 듣고 있어주세요!</p>
        </div>

        {!jobExplained && (
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
        )}
      </div>
    );
  }

  if (stage === 'mission') {
    const allRequiredMatched = requiredMatched.length === 4;

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 1</span>
            <h2>🪐 새로운 행성 발견</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>🎯 미션: 생명체 흔적 카드 찾기</h3>
        <p>필수 카드 4쌍을 모두 찾으세요: 💧물, ☀️햇빛, 🌡️온도, 🌊대기</p>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600 }}>
            {showing ? '🔍 카드를 잘 기억하세요! (3초)' : `진행: ${matched.length}/8 쌍 (필수: ${requiredMatched.length}/4 ⭐)`}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 'clamp(0.4rem, 2vw, 0.8rem)',
          marginTop: '1.5rem',
          maxWidth: '600px',
          margin: '1.5rem auto 0'
        }}>
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || showing;
            const isMatched = matched.includes(card.icon);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id, card.icon, card.pairId, card.required)}
                style={{
                  aspectRatio: '3/4',
                  cursor: isMatched || showing ? 'default' : 'pointer',
                  position: 'relative',
                  perspective: '1000px',
                  minHeight: '80px'
                }}
              >
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0)'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}>
                    ❓
                  </div>
                  
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: isMatched 
                      ? (card.required 
                        ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)')
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isMatched 
                      ? (card.required ? '3px solid #34d399' : '3px solid #60a5fa')
                      : '3px solid rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{card.icon}</div>
                    {isMatched && (
                      <div style={{ marginTop: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                        {card.required ? '✓' : '○'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allRequiredMatched && (
          <div className="alert alert-success mt-2">
            <p style={{ fontWeight: 600 }}>✅ 미션 성공!</p>
            <p className="text-small">💡 퀴즈 힌트: 생명체가 살기 위해 가장 중요한 것은 <strong>"액체 상태의 물"</strong>입니다!</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {!allRequiredMatched && (
            <button className="btn btn-secondary" onClick={resetGame}>
              🔄 게임 다시 시작
            </button>
          )}
          {allRequiredMatched && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStage('quiz')}>
              퀴즈로 이동 →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const options = [
      '행성의 크기가 지구와 같을 것',
      '액체 상태의 물이 존재할 것',
      '행성의 색깔이 파란색일 것',
      '위성(달)이 있을 것'
    ];

    return (
      <div className="card card-medium round-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="round-badge">ROUND 1</span>
            <h2>🪐 새로운 행성 발견</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-small">팀 점수</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
          </div>
        </div>

        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            거주 가능한 행성의 조건으로 가장 중요한 것은?
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
                ? '100점 획득! 다음 라운드를 기다려주세요.' 
                : '다음 라운드에서 만회하세요!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round1;
