import { createContext, useState, useContext, useEffect } from 'react';
import { getSession } from '../utils/storage';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [sessionCode, setSessionCode] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [teams, setTeams] = useState([]);
  const [studentData, setStudentData] = useState(null);

  // localStorage에서 초기 데이터 로드
  useEffect(() => {
    const savedStudentData = localStorage.getItem('student_data');
    if (savedStudentData) {
      const data = JSON.parse(savedStudentData);

      // 저장된 세션이 유효한지 확인 (closed/삭제된 세션이면 무시)
      const validateAndRestore = async () => {
        try {
          const session = await getSession(data.sessionCode);
          if (session && !session.closed) {
            // 유효한 세션 → 복원
            setStudentData(data);
            setSessionCode(data.sessionCode);
            setCurrentScreen('student-game');
          } else {
            // 종료된 세션 → localStorage 정리
            localStorage.removeItem('student_data');
          }
        } catch (e) {
          localStorage.removeItem('student_data');
        }
      };
      validateAndRestore();
    }
  }, []);

  // studentData 변경 시 localStorage 저장
  useEffect(() => {
    if (studentData) {
      localStorage.setItem('student_data', JSON.stringify(studentData));
    }
  }, [studentData]);

  const value = {
    currentScreen,
    setCurrentScreen,
    sessionCode,
    setSessionCode,
    currentRound,
    setCurrentRound,
    teams,
    setTeams,
    studentData,
    setStudentData,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
