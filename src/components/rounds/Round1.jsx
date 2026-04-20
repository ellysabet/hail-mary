import { useState, useEffect, useRef } from 'react';
import { updateTeamScore, getSession, subscribeToSession } from '../../utils/storage';
import { updateMemberScore } from '../../utils/storage';

// 찾아야 할 카드 (필수 4종)
const REQUIRED_CARDS = [
  { icon: '💧', name: '물' },
  { icon: '☀️', name: '햇빛' },
  { icon: '🌡️', name: '온도' },
  { icon: '🌊', name: '대기' },
];

// 전체 카드 페어 정의
const CARD_PAIRS = [
  { icon: '💧', name: '물',  required: true },
  { icon: '☀️', name: '햇빛', required: true },
  { icon: '🌡️', name: '온도', required: true },
  { icon: '🌊', name: '대기', required: true },
  { icon: '🧬', name: 'DNA',  required: false },
  { icon: '🔬', name: '세포', required: false },
  { icon: '🪨', name: '토양', required: false },
  { icon: '🌱', name: '식물', required: false },
];

function Round1({ team, sessionCode }) {
  const [stage, setStage] = useState('story'); // story → job → missionIntro → mission → quiz
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);       // icon 배열
  const [requiredMatched, setRequiredMatched] = useState([]); // icon 배열
  const [previewPhase, setPreviewPhase] = useState(false);   // 3초 앞면 보이기
  const [previewCountdown, setPreviewCountdown] = useState(3);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const isCheckingRef = useRef(false);

  // ── 실시간 구독: 어느 stage에 있어도 JobExplained 감지 ──────
  useEffect(() => {
    if (!sessionCode) return;
    const unsubscribe = subscribeToSession(sessionCode, (session) => {
      if (session?.round1JobExplained && (stage === 'job' || stage === 'story')) {
        setStage('missionIntro');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, stage]);

  // ── 카드 초기화 ──────────────────────────────────────────────
  const initializeCards = () => {
    const newCards = [];
    CARD_PAIRS.forEach((pair, idx) => {
      newCards.push({ ...pair, id: idx * 2,     pairId: idx });
      newCards.push({ ...pair, id: idx * 2 + 1, pairId: idx });
    });
    newCards.sort(() => Math.random() - 0.5);
    setCards(newCards);
    setFlipped([]);
    setMatched([]);
    setRequiredMatched([]);
    isCheckingRef.current = false;
  };

  // ── 미션 시작 버튼 → 카드 섞기 → 3초 미리보기 ──────────────
  const startMission = () => {
    initializeCards();
    setPreviewPhase(true);
    setPreviewCountdown(3);

    // 3초 카운트다운
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setPreviewCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setPreviewPhase(false);
        setStage('mission');
      }
    }, 1000);
  };

  // missionIntro에서 startMission 호출 시 카드를 미리 준비
  useEffect(() => {
    if (stage === 'missionIntro') {
      // 카드 미리 생성 (화면에는 미표시)
      const newCards = [];
      CARD_PAIRS.forEach((pair, idx) => {
        newCards.push({ ...pair, id: idx * 2,     pairId: idx });
        newCards.push({ ...pair, id: idx * 2 + 1, pairId: idx });
      });
      newCards.sort(() => Math.random() - 0.5);
      setCards(newCards);
    }
  }, [stage]);

  // ── 카드 클릭 ──────────────────────────────────────────────
  const handleCardClick = (cardId) => {
    if (previewPhase) return;
    if (isCheckingRef.current) return;
    if (flipped.includes(cardId)) return;

    const card = cards.find(c => c.id === cardId);
    if (matched.includes(card.icon)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      isCheckingRef.current = true;
      setTimeout(() => checkMatch(newFlipped), 900);
    }
  };

  const checkMatch = (flippedIds) => {
    const [c1, c2] = flippedIds.map(id => cards.find(c => c.id === id));
    if (c1.pairId === c2.pairId) {
      setMatched(prev => [...prev, c1.icon]);
      if (c1.required) setRequiredMatched(prev => [...prev, c1.icon]);
    }
    setFlipped([]);
    isCheckingRef.current = false;
  };

  // ── 퀴즈 제출 ──────────────────────────────────────────────
  const submitQuiz = async () => {
    setQuizSubmitted(true);
    if (quizAnswer === '1') {
      await updateTeamScore(sessionCode, team.id, 100);
      if (team.currentStudentName) {
        await updateMemberScore(sessionCode, team.id, team.currentStudentName, 100);
      }
    }
  };

  const ScoreBox = () => (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <p className="text-small">팀 점수</p>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{team.totalScore || 0}</div>
    </div>
  );

  const RoundHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <span className="round-badge">ROUND 1</span>
        <h2>🪐 새로운 행성 발견</h2>
      </div>
      <ScoreBox />
    </div>
  );

  // ════════════════════════════════════════
  // STAGE: story
  // ════════════════════════════════════════
  if (stage === 'story') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '7rem' }}>🪐</div>
        </div>
        <div className="story-box" style={{ background: 'rgba(30,58,138,0.2)', border: '2px solid rgba(30,58,138,0.5)' }}>
          <p>"40광년 떨어진 타우 세티 e, 생명체가 있을까요? 행성 데이터를 분석하여 생명의 흔적을 찾아보세요!"</p>
        </div>
        <button className="btn btn-primary mt-2" onClick={() => setStage('job')}>
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
        <div className="job-grid">
          <div className="job-card job-card-primary">
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
        <div className="alert alert-warning mt-2" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>선생님이 완료 버튼을 누르면 자동으로 미션이 시작됩니다</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: missionIntro  ← 새로 추가
  // ════════════════════════════════════════
  if (stage === 'missionIntro') {
    return (
      <div className="card card-medium round-transition">
        <RoundHeader />

        {/* 미션 설명 */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3>미션: 생명체 흔적 카드 찾기</h3>
        </div>

        <div className="story-box" style={{ lineHeight: 2 }}>
          <p>🃏 카드를 뒤집어 같은 카드 2장을 맞추는 게임입니다</p>
          <p>⭐ <strong>아래 4가지 필수 카드</strong>를 모두 찾아야 미션 성공!</p>
          <p>💡 시작하면 카드를 3초 동안 미리 볼 수 있어요</p>
        </div>

        {/* 찾아야 할 카드 크게 표시 */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>🔍 찾아야 할 카드</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
            {REQUIRED_CARDS.map(card => (
              <div key={card.icon} style={{
                background: 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(139,92,246,0.2))',
                border: '2px solid #a78bfa',
                borderRadius: '12px',
                padding: '1rem 0.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
                <div style={{ fontWeight: 700, marginTop: '0.4rem', fontSize: '0.95rem' }}>{card.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 미리보기 중 카운트다운 표시 */}
        {previewPhase ? (
          <div className="alert alert-warning mt-2" style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700 }}>
            <div style={{ fontSize: '3rem' }}>{previewCountdown}</div>
            카드를 기억하세요!
          </div>
        ) : (
          <button className="btn btn-primary mt-2" style={{ fontSize: '1.1rem', padding: '1rem' }} onClick={startMission}>
            🚀 미션 시작하기
          </button>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: mission
  // ════════════════════════════════════════
  if (stage === 'mission') {
    const allRequiredMatched = requiredMatched.length === 4;

    return (
      <div className="card card-medium round-transition">
        <RoundHeader />

        {/* 찾아야 할 카드 상태 표시 (중간 크기) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {REQUIRED_CARDS.map(card => {
            const done = requiredMatched.includes(card.icon);
            return (
              <div key={card.icon} style={{
                background: done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done ? '#34d399' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '10px',
                padding: '0.6rem 0.25rem',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: '1.8rem' }}>{card.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem', opacity: done ? 1 : 0.6 }}>
                  {done ? '✅' : card.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* 진행 상황 */}
        <div className="alert alert-info" style={{ padding: '0.6rem 1rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            매칭: {matched.length}/8쌍 &nbsp;|&nbsp; 필수: {requiredMatched.length}/4 ⭐
          </p>
        </div>

        {/* 카드 그리드 - 4×4, 정사각형에 가깝게 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 'clamp(0.35rem,1.5vw,0.6rem)',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.icon);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  aspectRatio: '1 / 1',   // 정사각형
                  cursor: isMatched ? 'default' : 'pointer',
                  position: 'relative',
                  perspective: '800px',
                }}
              >
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  transition: 'transform 0.5s',
                  transformStyle: 'preserve-3d',
                  transform: (isFlipped || isMatched) ? 'rotateY(180deg)' : 'rotateY(0)',
                }}>
                  {/* 앞면(뒤집기 전) */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    borderRadius: 'clamp(8px,2vw,12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'clamp(1.4rem,4vw,2rem)',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}>❓</div>

                  {/* 뒷면(카드 내용) */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: isMatched
                      ? (card.required ? 'linear-gradient(135deg,#34d399,#059669)' : 'linear-gradient(135deg,#60a5fa,#3b82f6)')
                      : 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
                    borderRadius: 'clamp(8px,2vw,12px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: isMatched
                      ? (card.required ? '2px solid #34d399' : '2px solid #60a5fa')
                      : '2px solid rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)' }}>{card.icon}</div>
                    <div style={{ fontSize: 'clamp(0.6rem,1.5vw,0.8rem)', fontWeight: 700, marginTop: '0.2rem', color: isMatched ? 'white' : '#1e1b4b' }}>
                      {isMatched ? (card.required ? '✓' : '○') : card.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allRequiredMatched && (
          <div className="alert alert-success mt-2">
            <p style={{ fontWeight: 600 }}>✅ 미션 성공! 필수 카드 4종을 모두 찾았습니다!</p>
            <p className="text-small">💡 퀴즈 힌트: 생명체가 살기 위해 가장 중요한 것은 <strong>"액체 상태의 물"</strong>입니다!</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {!allRequiredMatched && (
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => {
              initializeCards();
              setPreviewPhase(true);
              setPreviewCountdown(3);
              let c = 3;
              const iv = setInterval(() => {
                c -= 1; setPreviewCountdown(c);
                if (c <= 0) { clearInterval(iv); setPreviewPhase(false); }
              }, 1000);
            }}>🔄 다시 시작</button>
          )}
          {allRequiredMatched && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStage('quiz')}>
              퀴즈로 이동 →
            </button>
          )}
        </div>

        {/* 3초 미리보기 오버레이 (재시작 시) */}
        {previewPhase && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', color: 'white',
          }}>
            <div style={{ fontSize: '5rem', fontWeight: 900 }}>{previewCountdown}</div>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>카드를 기억하세요!</p>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════
  // STAGE: quiz
  // ════════════════════════════════════════
  if (stage === 'quiz') {
    const options = [
      '행성의 크기가 지구와 같을 것',
      '액체 상태의 물이 존재할 것',
      '행성의 색깔이 파란색일 것',
      '위성(달)이 있을 것',
    ];

    return (
      <div className="card card-medium round-transition">
        <RoundHeader />
        <h3>❓ 퀴즈</h3>
        <div className="alert alert-info">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            거주 가능한 행성의 조건으로 가장 중요한 것은?
          </p>
          {options.map((opt, i) => {
            let cls = 'quiz-option';
            if (quizAnswer === i.toString()) cls += ' selected';
            if (quizSubmitted) {
              if (i === 1) cls += ' correct';
              else if (quizAnswer === i.toString()) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => !quizSubmitted && setQuizAnswer(i.toString())} disabled={quizSubmitted}>
                {i + 1}. {opt}
                {quizSubmitted && i === 1 && ' ✓ 정답'}
                {quizSubmitted && quizAnswer === i.toString() && i !== 1 && ' ✗'}
              </button>
            );
          })}
        </div>
        {!quizSubmitted ? (
          <button className="btn btn-primary mt-2" onClick={submitQuiz} disabled={!quizAnswer}>답안 제출하기</button>
        ) : (
          <div className={`alert ${quizAnswer === '1' ? 'alert-success' : 'alert-error'} mt-2 text-center`}>
            <div style={{ fontSize: '3rem' }}>{quizAnswer === '1' ? '🎉' : '😢'}</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{quizAnswer === '1' ? '정답입니다!' : '아쉽네요!'}</p>
            <p>{quizAnswer === '1' ? '100점 획득! 다음 라운드를 기다려주세요.' : '다음 라운드에서 만회하세요!'}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Round1;
