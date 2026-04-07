import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// 배포 환경에서는 빌드된 파일(dist)을 서비스합니다.
app.use(express.static(path.join(__dirname, 'dist')));

const server = http.createServer(app);

// Render 환경에 맞게 Socket.io 설정
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ['websocket', 'polling']
});

let planetStates = {};
let gameStates = {};

const ROLE_QUIZZES = {
  1: {
    'life-support': { q: "CO2 농도 상승! 조치 장치는?", o: ["스크러버", "수소 혼합기", "질소 압축기", "오존 발생기"], a: 0, h: "스크러버는 정화 장치입니다." },
    'energy': { q: "에너지 역류! 차단할 선은?", o: ["메인 버스", "브릿지 회로", "접지 연결", "코드 해제"], a: 1, h: "회로를 우회시키세요." },
    'structural': { q: "벽면에 구멍 발생! 접합제는?", o: ["나노 테이프", "열경화 알루미늄", "다이아몬드", "일반 테이프"], a: 1, h: "냉열에 강해야 합니다." },
    'agriculture': { q: "식물 숨구멍 폐쇄! 습도는?", o: ["40%로 낮춤", "90%로 올림", "산소 제거", "비료 추가"], a: 0, h: "습도를 낮추세요." },
    'comms': { q: "통신 노이즈 원인은?", o: ["전자기 간섭", "단순 구름", "지구 회전", "대원 소음"], a: 0, h: "전자 간섭이 원인입니다." },
    'environment': { q: "산성비 중화 코팅은?", o: ["강산성", "중성", "강알칼리", "물 세척"], a: 2, h: "산성은 알칼리로 막습니다." },
    'mining': { q: "드릴 과열 냉각법은?", o: ["액체 질소", "바닷물", "얼음", "오일"], a: 0, h: "액체 질소가 최고입니다." },
    'medical': { q: "저체온 대원 수액은?", o: ["혈관 확장제", "스테로이드", "포도당", "수면제"], a: 2, h: "포도당이 에너지를 만듭니다." }
  }
};

const broadcastLeaderboard = () => {
  const data = Object.keys(gameStates).map(pid => ({
    planetId: pid,
    round: gameStates[pid].round,
    resources: gameStates[pid].resources,
    experts: Object.keys(planetStates[pid] || {}).length
  }));
  io.emit('leaderboardUpdated', data);
};

io.on('connection', (socket) => {
  socket.on('joinPlanet', (pid) => {
    socket.join(pid);
    if (!planetStates[pid]) planetStates[pid] = {};
    socket.emit('rolesUpdated', planetStates[pid]);
    if (gameStates[pid]) socket.emit('gameStateUpdated', gameStates[pid]);
    broadcastLeaderboard();
  });

  socket.on('selectRole', ({ planetId, roleId }) => {
    if (!planetStates[planetId]) planetStates[planetId] = {};
    const roles = planetStates[planetId];
    let prev = null; for (const r in roles) { if (roles[r] === socket.id) { prev = r; break; } }
    if (prev === roleId) delete roles[roleId];
    else { if (roles[roleId]) return; if (prev) delete roles[prev]; roles[roleId] = socket.id; }
    io.to(planetId).emit('rolesUpdated', roles);
    broadcastLeaderboard();
  });

  socket.on('submitQuizAnswer', ({ planetId, roleId, roleName, answerIndex }) => {
    if (!gameStates[planetId]) gameStates[planetId] = { planetId, round: 1, resources: { oxygen: 60, water: 60, energy: 60 }, completedRoles: [] };
    const gs = gameStates[planetId];
    const quiz = ROLE_QUIZZES[gs.round]?.[roleId];
    if (quiz && answerIndex === quiz.a) {
      gs.resources.oxygen = Math.min(100, gs.resources.oxygen + 5);
      gs.resources.water = Math.min(100, gs.resources.water + 5);
      gs.resources.energy = Math.min(100, gs.resources.energy + 5);
      gs.completedRoles.push(roleId);
      socket.emit('quizFeedback', { success: true, message: "🌟 임무 성공 🌟" });
    } else {
      gs.resources.energy = Math.max(0, gs.resources.energy - 10);
      socket.emit('quizFeedback', { success: false, message: "⚠️ 임무 실패 ⚠️" });
    }
    io.to(planetId).emit('gameStateUpdated', gs);
    broadcastLeaderboard();
  });

  socket.on('startMission', (pid) => {
    gameStates[pid] = { planetId: pid, round: 1, resources: { oxygen: 60, water: 60, energy: 60 }, completedRoles: [], story: { s: "미션을 시작합니다!" } };
    io.to(pid).emit('screenTransition', 'simulation');
    io.to(pid).emit('gameStateUpdated', gameStates[pid]);
    broadcastLeaderboard();
  });

  socket.on('adminAction', ({ action, adminPassword }) => {
    if (adminPassword !== 'space2026') return;
    if (action === 'HARD_SYSTEM_RESET') { planetStates = {}; gameStates = {}; io.emit('SYSTEM_WIPE_COMMAND'); }
  });
  socket.on('getAdminData', (pw) => { if (pw === 'space2026') { socket.emit('adminLoginResponse', { success: true }); broadcastLeaderboard(); } });
});

// 모든 경로를 index.html로 연결
app.use((req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });

// 🚀 RENDER 환경의 PORT 변수를 우선 사용하도록 설정
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`✅ PHM CLOUD SERVER RUNNING ON PORT ${PORT}`));
