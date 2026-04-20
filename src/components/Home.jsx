import { useGame } from '../context/GameContext';

function Home() {
  const { setCurrentScreen } = useGame();
  
  return (
    <div className="container">
      <div className="card card-large text-center">
        <div className="logo-pulse">
          <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🚀</div>
        </div>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 700 }}>
          프로젝트 헤일메리
        </h1>
        
        <p className="subtitle">
          새로운 행성을 향한 우주산업 진로탐험
        </p>
        
        <button 
          className="btn btn-primary btn-large mt-2"
          onClick={() => setCurrentScreen('teacher-setup')}
        >
          👨‍🏫 교사 - 수업 시작하기
        </button>
        
        <button 
          className="btn btn-secondary btn-large mt-1"
          onClick={() => setCurrentScreen('student-code')}
        >
          👨‍🎓 학생 - 미션 참여하기
        </button>
        
        <p className="text-small mt-2">
          중학생 대상 우주산업 진로교육 프로그램<br />
          개발: Elly (Soojeong) | 2026
        </p>
      </div>
    </div>
  );
}

export default Home;
