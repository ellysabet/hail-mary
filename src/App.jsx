import { GameProvider, useGame } from './context/GameContext';
import Home from './components/Home';
import TeacherSetup from './components/TeacherSetup';
import TeacherDashboard from './components/TeacherDashboard';
import StudentCode from './components/StudentCode';
import StudentGame from './components/StudentGame';
import './styles/global.css';

function AppContent() {
  const { currentScreen } = useGame();
  
  return (
    <div className="app">
      {currentScreen === 'home' && <Home />}
      {currentScreen === 'teacher-setup' && <TeacherSetup />}
      {currentScreen === 'teacher-dashboard' && <TeacherDashboard />}
      {currentScreen === 'student-code' && <StudentCode />}
      {currentScreen === 'student-game' && <StudentGame />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
