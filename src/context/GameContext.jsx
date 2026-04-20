import { createContext, useState, useContext, useEffect } from 'react';

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
      setStudentData(data);
      setSessionCode(data.sessionCode);
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
    setStudentData
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
