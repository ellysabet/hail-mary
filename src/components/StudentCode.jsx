import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSession, getTeams, saveTeams } from '../utils/storage';

function StudentCode() {
  const { setCurrentScreen, setSessionCode, setStudentData } = useGame();
  const [codeInput, setCodeInput] = useState('');
  const [studentName, setStudentName] = useState('');
  const [teams, setTeams] = useState([]);
  const [step, setStep] = useState('code'); // 'code' | 'name' | 'team'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const checkSessionCode = () => {
    const code = codeInput.toUpperCase().trim();
    if (!code) {
      alert('❌ 세션 코드를 입력해주세요!');
      return;
    }

    const session = getSession(code);
    if (!session) {
      alert('❌ 존재하지 않는 세션 코드입니다!');
      return;
    }

    setSessionCode(code);
    setStep('name');
  };

  const submitName = () => {
    if (!studentName.trim()) {
      alert('❌ 이름을 입력해주세요!');
      return;
    }
    
    // 팀 목록 로드
    const existingTeams = getTeams(codeInput.toUpperCase().trim());
    setTeams(existingTeams);
    setStep('team');
  };

  const createNewTeam = () => {
    if (!newTeamName.trim()) {
      alert('❌ 팀 이름을 입력해주세요!');
      return;
    }

    const code = codeInput.toUpperCase().trim();
    const existingTeams = getTeams(code);
    
    // 중복 체크
    if (existingTeams.find(t => t.name === newTeamName.trim())) {
      alert('❌ 이미 존재하는 팀 이름입니다!');
      return;
    }

    // 새 팀 생성
    const newTeam = {
      id: Date.now(),
      name: newTeamName.trim(),
      members: [studentName.trim()],
      totalScore: 0,
      rounds: {}
    };

    const updatedTeams = [...existingTeams, newTeam];
    saveTeams(code, updatedTeams);
    
    // 팀 선택
    selectTeam(newTeam);
  };

  const selectTeam = (team) => {
    const code = codeInput.toUpperCase().trim();
    
    // 팀원 추가
    const existingTeams = getTeams(code);
    const targetTeam = existingTeams.find(t => t.id === team.id);
    
    if (targetTeam && !targetTeam.members.includes(studentName.trim())) {
      targetTeam.members.push(studentName.trim());
      saveTeams(code, existingTeams);
    }

    // 학생 데이터 저장
    const data = {
      sessionCode: code,
      studentName: studentName.trim(),
      teamId: team.id,
      teamName: team.name,
      joinTime: Date.now()
    };

    setStudentData(data);
    setCurrentScreen('student-game');
  };

  // Step 1: 세션 코드 입력
  if (step === 'code') {
    return (
      <div className="container">
        <div className="card card-large text-center">
          <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🎮</div>
          
          <h2>학생 입장 코드</h2>
          <p className="subtitle">선생님이 알려주신 코드를 입력하세요</p>
          
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="세션 코드 입력"
            maxLength={6}
            onKeyPress={(e) => e.key === 'Enter' && checkSessionCode()}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '16px',
              margin: '1rem auto',
              fontSize: '2rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.3rem',
              textTransform: 'uppercase'
            }}
          />
          
          <button 
            className="btn btn-primary btn-large mt-2"
            onClick={checkSessionCode}
          >
            확인
          </button>
          
          <button 
            className="btn btn-secondary btn-large mt-1"
            onClick={() => setCurrentScreen('home')}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Step 2: 이름 입력
  if (step === 'name') {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>👋</div>
          <h2>환영합니다!</h2>
          <p className="subtitle">이름을 입력하세요</p>

          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="이름 입력"
            onKeyPress={(e) => e.key === 'Enter' && submitName()}
            style={{ fontSize: '1.2rem', marginTop: '1rem' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '2rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setStep('code')}
            >
              ← 뒤로
            </button>
            <button 
              className="btn btn-primary"
              onClick={submitName}
              disabled={!studentName.trim()}
            >
              다음 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 팀 생성/선택
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>팀 선택</h2>
          <p className="subtitle">{studentName}님, 팀을 선택하거나 새로 만드세요</p>
        </div>

        {/* 기존 팀 목록 */}
        {teams.length > 0 && !showCreateTeam && (
          <div>
            <h3>기존 팀 ({teams.length}팀)</h3>
            <p className="text-small" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
              친구들이 만든 팀에 참여하세요
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => selectTeam(team)}
                  className="btn btn-secondary"
                  style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>👥</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{team.name}</div>
                  <div className="text-small" style={{ opacity: 0.7 }}>
                    {team.members.length}명 참여 중
                  </div>
                  {team.members.length > 0 && (
                    <div className="text-small" style={{ 
                      fontSize: '0.8rem', 
                      opacity: 0.6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {team.members.join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 새 팀 만들기 */}
        <div className="mt-3">
          {!showCreateTeam ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateTeam(true)}
              style={{ width: '100%', padding: '1.2rem' }}
            >
              ➕ 새 팀 만들기
            </button>
          ) : (
            <div className="card" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '2px solid rgba(167, 139, 250, 0.5)' }}>
              <h4>✨ 새 팀 만들기</h4>
              <p className="text-small" style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                새로운 팀의 이름을 정해주세요
              </p>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="팀 이름 입력 (예: 1팀, 우주탐험대)"
                onKeyPress={(e) => e.key === 'Enter' && createNewTeam()}
                style={{ marginTop: '1rem' }}
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateTeam(false);
                    setNewTeamName('');
                  }}
                >
                  취소
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={createNewTeam}
                  disabled={!newTeamName.trim()}
                >
                  팀 생성하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 팀이 없을 때 안내 */}
        {teams.length === 0 && !showCreateTeam && (
          <div className="alert alert-info mt-2">
            <p style={{ fontWeight: 600 }}>아직 만들어진 팀이 없습니다</p>
            <p className="text-small mt-1">
              첫 번째 팀을 만들어보세요! 🚀
            </p>
          </div>
        )}

        {/* 뒤로 가기 */}
        <button 
          className="btn btn-secondary mt-2"
          onClick={() => {
            setStep('name');
            setShowCreateTeam(false);
            setNewTeamName('');
          }}
        >
          ← 이름 다시 입력
        </button>
      </div>
    </div>
  );
}

export default StudentCode;
