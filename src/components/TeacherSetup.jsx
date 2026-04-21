import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { generateSessionCode, saveSession, getSession, deleteSession } from '../utils/storage';

const TEACHER_PASSWORD = 'teacher2026';
const ACTIVE_SESSION_KEY = 'hailmary_active_session';

function TeacherSetup() {
  const { setCurrentScreen, setSessionCode } = useGame();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // 인증 후 기존 세션 확인
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkExisting = async () => {
      setLoadingSession(true);
      try {
        const savedCode = localStorage.getItem(ACTIVE_SESSION_KEY);
        if (savedCode) {
          const session = await getSession(savedCode);
          if (session && !session.closed) {
            setExistingSession({ code: savedCode, session });
          } else {
            // 세션이 닫혔거나 없으면 키 제거
            localStorage.removeItem(ACTIVE_SESSION_KEY);
          }
        }
      } catch (e) {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      } finally {
        setLoadingSession(false);
      }
    };
    checkExisting();
  }, [isAuthenticated]);

  const handlePasswordCheck = () => {
    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('❌ 암호가 올바르지 않습니다!');
      setPassword('');
    }
  };

  // 기존 세션으로 재입장
  const resumeSession = () => {
    setSessionCode(existingSession.code);
    setCurrentScreen('teacher-dashboard');
  };

  // 기존 세션 삭제 후 새 세션 시작
  const startNewSession = async () => {
    if (existingSession) {
      if (!window.confirm('기존 진행 중인 세션이 있습니다.\n새 세션을 시작하면 기존 세션이 종료됩니다.\n계속하시겠습니까?')) return;
      // 기존 세션 닫기
      try {
        const session = await getSession(existingSession.code);
        if (session) {
          session.closed = true;
          session.gameEnded = true;
          await saveSession(existingSession.code, session);
        }
      } catch (e) {}
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
    createNewSession();
  };

  const createNewSession = async () => {
    const code = generateSessionCode();
    await saveSession(code, {
      currentRound: 0,
      startTime: Date.now(),
      closed: false,
      gameEnded: false,
    });
    localStorage.setItem(ACTIVE_SESSION_KEY, code);
    setSessionCode(code);
    setCurrentScreen('teacher-dashboard');
  };

  // ── 암호 입력 화면 ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <h2>👨‍🏫 교사 전용 페이지</h2>
          <p style={{ marginTop: '1rem' }}>교사 암호를 입력하세요</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="교사 암호 입력"
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordCheck()}
            style={{
              width: '100%', maxWidth: '300px', padding: '12px',
              margin: '1rem auto', display: 'block',
              background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px', color: 'white', fontSize: '1.2rem', textAlign: 'center',
            }}
          />
          <button className="btn btn-primary mt-2" onClick={handlePasswordCheck}>확인</button>
          <button className="btn btn-secondary mt-2" onClick={() => setCurrentScreen('home')}>돌아가기</button>
        </div>
      </div>
    );
  }

  // ── 세션 확인 로딩 중 ────────────────────────────────────
  if (loadingSession) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>기존 세션 확인 중...</p>
        </div>
      </div>
    );
  }

  // ── 기존 세션 있을 때: 재입장 or 새 세션 ───────────────────
  if (existingSession) {
    const s = existingSession.session;
    const round = s.currentRound || 0;
    const teamCount = (s.teams || []).length;
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h2>진행 중인 세션이 있습니다</h2>

          <div className="alert alert-warning mt-2" style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📌 세션 정보</p>
            <p>세션 코드: <strong style={{ color: '#a78bfa', fontSize: '1.2rem' }}>{existingSession.code}</strong></p>
            <p style={{ marginTop: '0.25rem' }}>현재 라운드: <strong>{round === 0 ? '대기 중' : `Round ${round}`}</strong></p>
            <p style={{ marginTop: '0.25rem' }}>참가 팀: <strong>{teamCount}팀</strong></p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, width: 'auto', padding: '1rem' }}
              onClick={resumeSession}
            >
              🔄 이어서 진행하기
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, width: 'auto', padding: '1rem' }}
              onClick={startNewSession}
            >
              ➕ 새 세션 시작
            </button>
          </div>
          <button className="btn btn-secondary mt-2" style={{ width: 'auto' }} onClick={() => setCurrentScreen('home')}>
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 새 세션 시작 화면 ─────────────────────────────────────
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🎮</div>
        <h2>수업 시작하기</h2>
        <p className="subtitle">세션을 시작하면 학생들이 입장할 수 있습니다</p>

        <div className="alert alert-info mt-2">
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📝 안내</p>
          <ul style={{ textAlign: 'left', lineHeight: '1.8', marginLeft: '1.2rem' }}>
            <li>세션 코드가 자동 생성됩니다</li>
            <li>학생들이 코드로 입장하여 팀을 만듭니다</li>
            <li>교사는 라운드 진행만 제어합니다</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1, width: 'auto' }} onClick={() => setCurrentScreen('home')}>
            ← 돌아가기
          </button>
          <button className="btn btn-primary" style={{ flex: 1, width: 'auto' }} onClick={createNewSession}>
            세션 시작하기 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherSetup;
