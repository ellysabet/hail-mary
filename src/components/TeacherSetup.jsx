import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateSessionCode, saveSession } from '../utils/storage';

function TeacherSetup() {
  const { setCurrentScreen, setSessionCode } = useGame();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordCheck = () => {
    if (password === 'teacher2026') {
      setIsAuthenticated(true);
    } else {
      alert('❌ 암호가 올바르지 않습니다!');
      setPassword('');
    }
  };

  const startSession = () => {
    const code = generateSessionCode();
    saveSession(code, {
      currentRound: 0,
      startTime: Date.now()
    });
    setSessionCode(code);
    setCurrentScreen('teacher-dashboard');
  };

  // 암호 입력 화면
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
              width: '100%',
              maxWidth: '300px',
              padding: '12px',
              margin: '1rem auto',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              display: 'block',
            }}
          />
          <button className="btn btn-primary mt-2" onClick={handlePasswordCheck}>확인</button>
          <button className="btn btn-secondary mt-2" onClick={() => setCurrentScreen('home')}>돌아가기</button>
        </div>
      </div>
    );
  }

  // 세션 시작 화면
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

        {/* ✅ 두 버튼 동일 비율: flex + flex:1 + width:auto */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, width: 'auto' }}
            onClick={() => setCurrentScreen('home')}
          >
            ← 돌아가기
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, width: 'auto' }}
            onClick={startSession}
          >
            세션 시작하기 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherSetup;
