import React, { useState, useEffect, useRef, Component } from 'react';
import { io } from 'socket.io-client';

// 🛡️ PHM v7.5 TUNNEL_STABLE
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono p-10 text-center">
        <h1 className="text-3xl font-black text-red-500 mb-6 uppercase italic tracking-tighter">! CONNECTION_INTERRUPTED !</h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-10 py-4 bg-white text-black font-black rounded-3xl border-b-8 border-slate-300 uppercase text-xs">RESTART_SESSION</button>
      </div>
    );
    return this.props.children;
  }
}

// 🌐 터널(localtunnel) 또는 로컬 접속에 따라 동적으로 주소 설정
const getSocketUrl = () => {
    const isTunnel = window.location.hostname.includes('loca.lt');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // 터널 접속이면 포트 번호 없이 베이스 URL만 사용, 로컬 접속이면 3001포트 명시
    if (isTunnel) return `${window.location.protocol}//${window.location.host}`;
    if (isLocalhost) return `http://localhost:3001`;
    return `http://${window.location.hostname}:3001`;
};

const socket = io(getSocketUrl(), { reconnection: true, timeout: 10000 });

const planets = [
  { id: 'aris', name: '아리스(ARIS)' },
  { id: 'cryos', name: '크라이오스(CRYOS)' },
  { id: 'gravis', name: '그라비스(GRAVIS)' },
  { id: 'arida', name: '아리다(ARIDA)' }
];

const roles = [
  { id: 'life-support', title: '생명유지 엔지니어', icon: '🧬' },
  { id: 'energy', title: '에너지 엔지니어', icon: '⚡' },
  { id: 'structural', title: '구조 설계 엔지니어', icon: '🏗️' },
  { id: 'agriculture', title: '우주 농업 전문가', icon: '🌱' },
  { id: 'comms', title: '우주 통신 전문가', icon: '📡' },
  { id: 'environment', title: '환경 분석가', icon: '🌍' },
  { id: 'mining', title: '자원 채굴 전문가', icon: '⛏️' },
  { id: 'medical', title: '의료 지원 전문가', icon: '🩺' }
];

const QUIZ_LIST = {
  1: {
    'life-support': { q: "CO2 농도 상승! 조치 장치는?", o: ["스크러버", "수소 혼합기", "질소 압축기", "오존 발생기"], h: "스크러버는 기체 정화기입니다." },
    'energy': { q: "에너지 역류 중! 차단할 선은?", o: ["메인 버스", "브릿지 회로", "접지 연결", "코드 해제"], h: "회로를 우회시키세요." },
    'structural': { q: "벽면에 구멍 발생! 접합제는?", o: ["나노 테이프", "열경화 알루미늄", "다이아몬드", "일반 테이프"], h: "열에 강해야 합니다." },
    'agriculture': { q: "식물 숨구멍 폐쇄! 습도는?", o: ["40%로 낮춤", "90%로 올림", "산소 제거", "비료 추가"], h: "습도를 낮추세요." },
    'comms': { q: "통신 노이즈 원인은?", o: ["전자기 간섭", "단순 구름", "지구 회전", "대원 소음"], h: "전자 노이즈가 원인입니다." },
    'environment': { q: "산성비 중화 코팅은?", o: ["강산성", "중성", "강알칼리", "물 세척"], h: "산성은 알칼리로 막습니다." },
    'mining': { q: "드릴 과열 냉각법은?", o: ["액체 질소", "바닷물", "얼음", "오일"], h: "액체 질소가 최고입니다." },
    'medical': { q: "저체온 대원 수액은?", o: ["혈관 확장제", "스테로이드", "포도당", "수면제"], h: "포도당이 에너지를 만듭니다." }
  }
};

function SimulationApp() {
  const [currentScreen, setCurrentScreen] = useState('planet-selection');
  const [planetRoles, setPlanetRoles] = useState({});
  const [gameState, setGameState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [quizModal, setQuizModal] = useState(null); 
  const [quizResult, setQuizResult] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pid = localStorage.getItem('phm_pid');
    if (pid) { socket.emit('joinPlanet', pid); setCurrentScreen('role-selection'); }
    socket.on('rolesUpdated', (data) => setPlanetRoles(data || {}));
    socket.on('gameStateUpdated', (state) => { if (state) { setGameState(state); if (pid && state.planetId === pid) setCurrentScreen('simulation'); } });
    socket.on('screenTransition', (screen) => { if (screen) setCurrentScreen(screen); });
    socket.on('leaderboardUpdated', (data) => setLeaderboard(data || []));
    socket.on('quizFeedback', (res) => { setQuizResult(res); setIsSubmitting(false); setTimeout(() => { setQuizModal(null); setTimeout(() => setQuizResult(null), 100); }, 2000); });
    socket.on('adminLoginResponse', (res) => { if (res?.success) setIsAdminLoggedIn(true); });
    socket.on('SYSTEM_WIPE_COMMAND', () => { localStorage.clear(); window.location.reload(); });
    return () => { socket.off(); };
  }, []);

  const handlePlanetSelect = (p) => { localStorage.setItem('phm_pid', p.id); socket.emit('joinPlanet', p.id); setCurrentScreen('role-selection'); };
  const handleRoleSelect = (rid) => { 
    const pid = localStorage.getItem('phm_pid');
    if (pid && rid) { localStorage.setItem('phm_rid', rid); socket.emit('selectRole', { planetId: pid, roleId: rid }); }
  };
  const handleStartMission = () => { const pid = localStorage.getItem('phm_pid'); if (pid) socket.emit('startMission', pid); };
  const submitAnswer = (idx) => {
    if (quizResult || isSubmitting) return;
    setIsSubmitting(true);
    const pid = localStorage.getItem('phm_pid');
    const rid = localStorage.getItem('phm_rid');
    const role = roles.find(r => r.id === rid);
    socket.emit('submitQuizAnswer', { planetId: pid, roleId: rid, roleName: role?.title || 'Expert', answerIndex: idx });
  };

  const adminAction = (payload) => socket.emit('adminAction', { ...payload, adminPassword });
  const joinedCount = Object.keys(planetRoles || {}).length;

  if (currentScreen === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-10 font-mono">
        {!isAdminLoggedIn ? (
          <div className="flex flex-col items-center gap-6 mt-20">
             <h2 className="text-blue-500 uppercase font-black text-xl italic underline">HQ Command</h2>
             <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="bg-slate-900 border-2 border-slate-700 p-4 rounded-xl text-center w-64" placeholder="PASS" />
             <button onClick={() => socket.emit('getAdminData', adminPassword)} className="bg-blue-600 px-10 py-4 rounded-xl font-black">LOGIN</button>
             <button onClick={() => setCurrentScreen('planet-selection')} className="text-slate-600 mt-4 underline italic">Logout</button>
          </div>
        ) : (
          <div className="space-y-10">
             <header className="flex justify-between border-b border-slate-800 pb-8 items-center"><h1 className="text-3xl font-black italic uppercase">지휘소</h1><button onClick={() => adminAction({ action: 'HARD_SYSTEM_RESET' })} className="bg-red-900 px-6 py-2 rounded-xl text-[10px] uppercase font-black">RESET ALL</button></header>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaderboard.map(team => (
                  <div key={team.planetId} className="bg-slate-900 p-8 rounded-[4rem] border-2 border-slate-800 space-y-6">
                     <span className="text-3xl font-black italic text-cyan-400 uppercase">{team.planetId}</span>
                     <div className="grid grid-cols-3 gap-2">{['oxygen', 'water', 'energy'].map(res => (<div key={res} className="bg-slate-950 p-3 rounded-2xl text-center"><span className="block text-[8px] uppercase text-slate-600 mb-1">{res}</span><span className="text-xs font-black">{team.resources?.[res] || 0}%</span></div>))}</div>
                     <div className="space-y-3"><button onClick={() => adminAction({ action: 'NEXT_ROUND', planetId: team.planetId })} className="w-full bg-blue-600 py-3 rounded-2xl font-black uppercase text-[10px]">NEXT PHASE</button><button onClick={() => adminAction({ action: 'SURPRISE_EVENT', planetId: team.planetId })} className="w-full bg-orange-950 text-orange-500 py-2 rounded-2xl font-black uppercase text-[9px]">⚠️ Surprise</button></div>
                  </div>))}
             </div>
          </div>
        )}
      </div>
    );
  }

  const myRid = localStorage.getItem('phm_rid');
  const isMissionCompleted = gameState?.completedRoles?.includes(myRid);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      {quizModal && (
        <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6">
           {!quizResult ? (
             <div className="bg-[#0f172a] border-8 border-blue-900/40 p-12 rounded-[5rem] max-w-4xl w-full text-center">
                <h3 className="text-3xl font-black italic mb-14">Q: {quizModal?.q}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{(quizModal?.o || []).map((opt, i) => (<button key={i} onClick={() => submitAnswer(i)} disabled={isSubmitting} className={`p-8 rounded-[3rem] font-black text-xl italic border-b-8 transition-all uppercase text-left pl-10 ${isSubmitting ? 'bg-slate-950 opacity-40' : 'bg-[#1e293b] border-slate-950 hover:bg-white hover:text-black active:translate-y-2'}`}>{isSubmitting ? '...' : opt}</button>))}</div>
                {!isSubmitting && <button onClick={() => setQuizModal(null)} className="mt-12 text-slate-600 text-[10px] font-black uppercase underline">CLOSE</button>}
             </div>
           ) : (
             <div className={`flex flex-col items-center justify-center p-20 rounded-[6rem] border-8 ${quizResult?.success ? 'border-cyan-500 bg-cyan-500/10' : 'border-red-500 bg-red-500/10'}`}><span className="text-[10rem] font-black italic block mb-6">{quizResult?.success ? 'PASSED' : 'FAILED'}</span><h2 className="text-4xl font-black italic uppercase text-center">{quizResult?.message}</h2></div>
           )}
        </div>
      )}

      <header className="flex justify-between items-center border-b-4 border-slate-900 pb-10 mb-10">
         <div onClick={() => { if(window.confirm('RESET?')) { localStorage.clear(); window.location.reload(); } }} className="cursor-pointer group flex items-end gap-3"><h1 className="text-4xl md:text-5xl font-black uppercase italic group-hover:text-red-500">PROJECT_HAIL MARY</h1><p className="text-slate-800 text-[9px] uppercase tracking-widest mb-2 font-mono">v7.5_TNL</p></div>
      </header>

      {currentScreen === 'planet-selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{planets.map(p => (<div key={p.id} onClick={() => handlePlanetSelect(p)} className="bg-slate-900 border-2 border-slate-800 border-b-8 rounded-[4rem] p-12 cursor-pointer hover:border-blue-600 flex flex-col shadow-2xl active:scale-[0.98]"><h2 className="text-6xl font-black uppercase italic">{p.name}</h2><p className="text-slate-600 mt-4 uppercase italic font-black text-sm">SELECT PLANET ➔</p></div>))}</div>
      )}

      {currentScreen === 'role-selection' && (
        <div className="space-y-12">
           <div className="bg-slate-900 p-12 rounded-[5rem] flex justify-between items-center shadow-2xl border-2 border-slate-800"><h3 className="text-4xl font-black italic uppercase">CURRENT CREW</h3><span className={`text-7xl font-black ${joinedCount >= 4 ? 'text-cyan-400' : 'text-red-500 italic animate-pulse'}`}>{joinedCount}/4</span></div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{roles.map(role => {
                 const taken = planetRoles?.[role.id];
                 const isMe = socket.id && taken === socket.id;
                 const isTaken = taken && !isMe;
                 return (<div key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-8 rounded-[3.5rem] border-4 cursor-pointer flex flex-col h-64 ${isMe ? 'bg-blue-600 border-white rotate-[-1deg] scale-105 z-10' : isTaken ? 'bg-slate-950 border-slate-900 opacity-20 pointer-events-none' : 'bg-slate-900 border-slate-800 hover:border-blue-500'}`}><span className={'text-6xl mb-4'}>{role.icon}</span><h4 className="font-black uppercase italic text-sm">{role.title}</h4><span className="text-[9px] font-black uppercase mt-auto">{isMe ? '✓ LOADED' : isTaken ? 'ASSIGNED' : 'READY'}</span></div>)
              })}</div>
           <button onClick={handleStartMission} disabled={joinedCount < 4} className={`w-full py-12 font-black text-4xl rounded-[5rem] uppercase italic transition-all border-b-12 ${joinedCount >= 4 ? 'bg-blue-600 border-blue-900' : 'bg-slate-900 border-slate-800 opacity-40'}`}>{joinedCount >= 4 ? 'DROP_IN ➔' : `WAITING (${joinedCount}/4)`}</button>
        </div>
      )}

      {currentScreen === 'simulation' && gameState && (
         <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900 p-12 rounded-[5rem] border-2 border-slate-800 shadow-3xl space-y-10"><h3 className="text-blue-500 text-[10px] font-black uppercase italic tracking-widest border-b border-slate-800 pb-4">Condition</h3>{['oxygen', 'water', 'energy'].map(res => (<div key={res}><div className="flex justify-between text-[9px] uppercase font-black mb-3 italic tracking-widest"><span>{res}</span><span>{gameState?.resources?.[res] || 0}%</span></div><div className="h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden"><div className={`h-full transition-all duration-1000 ${res === 'oxygen' ? 'bg-cyan-500' : res === 'water' ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${gameState?.resources?.[res] || 0}%` }}></div></div></div>))}</div>
            <div className="lg:col-span-2 bg-[#1e293b] p-14 rounded-[5rem] border-2 border-slate-800 shadow-4xl flex flex-col border-b-[2rem] border-b-slate-900">
               <h3 className="text-cyan-400 font-black uppercase italic text-4xl mb-10 border-b border-slate-800 pb-4">MISSION {gameState?.round || 1}</h3>
               <div className="space-y-10 flex-1"><div className="bg-[#020617] p-10 rounded-[3rem] border-l-8 border-cyan-500 font-black italic text-3xl">" {gameState?.story?.s || "Focus on mission."} "</div>
                  {!isMissionCompleted ? (<div className="bg-blue-600 p-12 rounded-[5rem] shadow-4xl cursor-pointer border-b-[1.5rem] border-blue-950" onClick={() => { const q = QUIZ_LIST[gameState?.round || 1]?.[myRid]; if (q) setQuizModal(q); else alert('WAITING_DATA'); }}><h4 className="text-4xl font-black italic leading-tight mb-8">대원님, 긴급 조치 리포트를 제출하십시오.</h4><div className="bg-blue-900/40 py-5 rounded-full text-center text-white font-black text-2xl uppercase italic border-4 border-white/20">REPORT ➔</div></div>) : (<div className="bg-slate-900/60 p-12 rounded-[5rem] border-2 border-slate-700 opacity-90 border-dashed text-center"><h4 className="text-4xl font-black text-cyan-400 italic mb-4">TRANSMITTED</h4><p className="text-slate-500 font-black italic">Wait for next order.</p></div>)}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><SimulationApp /></ErrorBoundary>; }
