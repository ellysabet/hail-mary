import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { subscribeToSession } from '../utils/storage';
import Round1 from './rounds/Round1';
import Round2 from './rounds/Round2';
import Round3 from './rounds/Round3';
import Round4 from './rounds/Round4';
import Round5 from './rounds/Round5';
import Round6 from './rounds/Round6';


// ── 엔딩 시퀀스 컴포넌트 ──────────────────────────────────────

// ── 장면별 애니메이션 배경 컴포넌트들 ────────────────────────

// R1: 행성이 천천히 회전하며 별이 반짝임
function BgPlanet() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes rotatePlanet { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes floatUp { 0%{transform:translateY(0)} 50%{transform:translateY(-12px)} 100%{transform:translateY(0)} }
      `}</style>
      {/* 별들 */}
      {[...Array(50)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width: (Math.sin(i*7+1)*1.2+1.5)+'px', height:(Math.sin(i*7+1)*1.2+1.5)+'px',
          background:'white',
          top:(Math.sin(i*3.7)*50+50)+'%', left:(Math.cos(i*2.9)*50+50)+'%',
          animation:`twinkle ${1.5+Math.sin(i)*1.5}s ${Math.cos(i*0.7)*1}s ease-in-out infinite`,
        }}/>
      ))}
      {/* 행성 */}
      <div style={{
        position:'absolute', bottom:'8%', right:'10%',
        width:'200px', height:'200px', borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%, #818cf8, #1e1b4b)',
        boxShadow:'0 0 60px rgba(99,102,241,0.5)',
        animation:'floatUp 4s ease-in-out infinite',
        opacity:0.85,
      }}>
        <div style={{
          position:'absolute', top:'15%', left:'10%', right:'10%', bottom:'70%',
          background:'rgba(255,255,255,0.07)', borderRadius:'50%', transform:'rotate(-30deg)',
        }}/>
      </div>
    </div>
  );
}

// R2: 로켓이 아래→위로 날아오름
function BgRocket() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes launch { 0%{transform:translateY(120%) rotate(-10deg);opacity:0} 30%{opacity:1} 100%{transform:translateY(-120%) rotate(-10deg);opacity:0.3} }
        @keyframes exhaust { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.4)} }
        @keyframes starStream { 0%{opacity:0;transform:translateY(0)} 50%{opacity:0.8} 100%{opacity:0;transform:translateY(60px)} }
      `}</style>
      {[...Array(35)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', width:'2px', height:'2px', background:'white',
          top:(Math.sin(i*4.1)*45+50)+'%', left:(Math.cos(i*3.3)*45+50)+'%',
          opacity: Math.random()*0.6+0.2,
        }}/>
      ))}
      {/* 메인 로켓 */}
      <div style={{
        position:'absolute', left:'50%', transform:'translateX(-50%)',
        animation:'launch 2.5s ease-in infinite',
        fontSize:'5rem', lineHeight:1,
      }}>🚀</div>
      {/* 보조 로켓들 */}
      {[-30,-15,15,30].map((x,i)=>(
        <div key={i} style={{
          position:'absolute', left:`calc(50% + ${x}%)`,
          fontSize:'2.5rem',
          animation:`launch ${2+i*0.3}s ${i*0.4}s ease-in infinite`,
          opacity:0.4,
        }}>🚀</div>
      ))}
    </div>
  );
}

// R3: 태양이 빛나고 태양전지판 펼쳐짐
function BgSolar() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes sunPulse { 0%,100%{transform:scale(1);box-shadow:0 0 60px #f59e0b,0 0 120px #f59e0b44} 50%{transform:scale(1.08);box-shadow:0 0 90px #fbbf24,0 0 180px #fbbf2466} }
        @keyframes rayRotate { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes panelOpen { 0%{width:0;opacity:0} 100%{width:80px;opacity:1} }
      `}</style>
      {/* 태양 */}
      <div style={{
        position:'absolute', top:'20%', right:'15%',
        width:'120px', height:'120px', borderRadius:'50%',
        background:'radial-gradient(circle, #fde68a, #f59e0b)',
        animation:'sunPulse 2.5s ease-in-out infinite',
      }}/>
      {/* 광선 */}
      <div style={{
        position:'absolute', top:'20%', right:'15%',
        width:'120px', height:'120px',
        animation:'rayRotate 8s linear infinite',
        transformOrigin:'60px 60px',
      }}>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%',
            width:'80px', height:'3px',
            background:'linear-gradient(to right, rgba(251,191,36,0.7), transparent)',
            transformOrigin:'0 50%',
            transform:`translate(0,-50%) rotate(${i*45}deg)`,
          }}/>
        ))}
      </div>
      {/* 태양전지판 */}
      <div style={{
        position:'absolute', bottom:'25%', left:'50%', transform:'translateX(-50%)',
        display:'flex', alignItems:'center', gap:'4px',
      }}>
        <div style={{height:'12px', background:'linear-gradient(90deg,#1d4ed8,#3b82f6)', borderRadius:'2px', animation:'panelOpen 1.5s 0.2s ease-out both', width:'80px'}}/>
        <div style={{width:'16px', height:'24px', background:'#64748b', borderRadius:'2px'}}/>
        <div style={{height:'12px', background:'linear-gradient(90deg,#3b82f6,#1d4ed8)', borderRadius:'2px', animation:'panelOpen 1.5s 0.4s ease-out both', width:'80px'}}/>
      </div>
      {[...Array(30)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', width:'1.5px', height:'1.5px', background:'rgba(253,230,138,0.6)',
          top:(Math.sin(i*3.7)*45+50)+'%', left:(Math.cos(i*2.9)*45+50)+'%',
        }}/>
      ))}
    </div>
  );
}

// R4: 로봇이 그리드를 이동
function BgRobot() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes robotMove { 0%{left:15%;bottom:30%} 25%{left:55%;bottom:30%} 50%{left:55%;bottom:60%} 75%{left:25%;bottom:60%} 100%{left:15%;bottom:30%} }
        @keyframes scanPulse { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.3)} }
        @keyframes gridFade { 0%,100%{opacity:0.07} 50%{opacity:0.18} }
      `}</style>
      {/* 그리드 배경 */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',animation:'gridFade 3s ease-in-out infinite'}}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#10b981" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {/* 경로 점들 */}
      {[[15,30],[55,30],[55,60],[25,60]].map(([l,b],i)=>(
        <div key={i} style={{
          position:'absolute', left:l+'%', bottom:b+'%',
          width:'14px', height:'14px', borderRadius:'50%',
          background:'#10b981', opacity:0.7,
          animation:`scanPulse 1.5s ${i*0.3}s ease-in-out infinite`,
          transform:'translate(-50%,50%)',
        }}/>
      ))}
      {/* 로봇 */}
      <div style={{
        position:'absolute',
        animation:'robotMove 4s linear infinite',
        fontSize:'2.8rem', transform:'translate(-50%,50%)',
      }}>🤖</div>
      {/* 스캔 원 */}
      <div style={{
        position:'absolute', bottom:'30%', left:'15%',
        width:'40px', height:'40px', borderRadius:'50%',
        border:'2px solid #10b981', opacity:0.4,
        animation:'scanPulse 1.5s ease-in-out infinite',
        transform:'translate(-50%,50%)',
      }}/>
    </div>
  );
}

// R5: 지구가 보이고 우주선이 궤도를 그리며 귀환
function BgEarth() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes orbitShip { from{transform:rotate(0deg) translateX(130px) rotate(0deg)} to{transform:rotate(360deg) translateX(130px) rotate(-360deg)} }
        @keyframes earthGlow { 0%,100%{box-shadow:0 0 40px rgba(59,130,246,0.5)} 50%{box-shadow:0 0 80px rgba(59,130,246,0.8)} }
        @keyframes earthRotate { from{background-position:0 0} to{background-position:200px 0} }
      `}</style>
      {[...Array(40)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', width:'2px', height:'2px', background:'white',
          top:(Math.sin(i*3.7)*45+50)+'%', left:(Math.cos(i*2.9)*45+50)+'%', opacity:0.4+Math.sin(i)*0.3,
        }}/>
      ))}
      {/* 지구 */}
      <div style={{
        position:'absolute', bottom:'15%', left:'50%', transform:'translateX(-50%)',
        width:'140px', height:'140px', borderRadius:'50%',
        background:'radial-gradient(circle at 40% 40%, #22d3ee, #1d4ed8 50%, #064e3b)',
        animation:'earthGlow 3s ease-in-out infinite',
      }}>
        <div style={{position:'absolute',top:'20%',left:'15%',width:'30%',height:'20%',background:'rgba(255,255,255,0.15)',borderRadius:'50%',transform:'rotate(-20deg)'}}/>
        <div style={{position:'absolute',top:'55%',left:'40%',width:'40%',height:'15%',background:'rgba(255,255,255,0.12)',borderRadius:'50%',transform:'rotate(10deg)'}}/>
      </div>
      {/* 궤도선 */}
      <div style={{
        position:'absolute', bottom:'15%', left:'50%',
        width:'0', height:'0',
        transform:'translateX(-50%) translateY(70px)',
      }}>
        <div style={{
          position:'absolute', top:'-130px', left:'-130px',
          width:'260px', height:'260px', borderRadius:'50%',
          border:'1.5px dashed rgba(59,130,246,0.3)',
        }}/>
        <div style={{
          position:'absolute', top:'-130px', left:'-130px',
          width:'260px', height:'260px', borderRadius:'50%',
          animation:'orbitShip 3.5s linear infinite',
        }}>
          <div style={{
            position:'absolute', top:'-14px', left:'50%',
            fontSize:'1.8rem', transform:'translateX(-50%)',
          }}>🛸</div>
        </div>
      </div>
    </div>
  );
}

// R6: 재활용 아이콘이 회전하고 별이 반짝
function BgEco() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes recycleRotate { from{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} to{transform:rotate(360deg) scale(1)} }
        @keyframes leafFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(15deg)} }
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
      {/* 큰 재활용 */}
      <div style={{
        position:'absolute', top:'15%', right:'12%',
        fontSize:'6rem', opacity:0.25,
        animation:'recycleRotate 5s linear infinite',
      }}>♻️</div>
      {/* 작은 재활용들 */}
      {[['15%','70%',3],['70%','75%',2.5],['80%','20%',2]].map(([t,l,s],i)=>(
        <div key={i} style={{
          position:'absolute', top:t, left:l, fontSize:`${s}rem`, opacity:0.2,
          animation:`recycleRotate ${4+i}s ${i*0.5}s linear infinite`,
        }}>♻️</div>
      ))}
      {/* 잎사귀 */}
      {['🌱','🌿','🍃'].map((e,i)=>(
        <div key={i} style={{
          position:'absolute',
          bottom: (20+i*15)+'%', left: (15+i*25)+'%',
          fontSize:'2rem', opacity:0.5,
          animation:`leafFloat ${2.5+i*0.4}s ${i*0.3}s ease-in-out infinite`,
        }}>{e}</div>
      ))}
      {/* 반짝이들 */}
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute',
          top:(Math.sin(i*3.7)*40+50)+'%', left:(Math.cos(i*2.9)*40+50)+'%',
          fontSize:'1rem', opacity:0,
          animation:`sparkle ${1.5+Math.sin(i)*1}s ${Math.cos(i*0.7)*0.8+0.2}s ease-in-out infinite`,
        }}>✨</div>
      ))}
    </div>
  );
}

// R7: 황금빛 별이 터지는 축하
function BgCelebrate() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes confettiFall { 0%{transform:translateY(-10%) rotate(0deg);opacity:1} 100%{transform:translateY(110%) rotate(720deg);opacity:0} }
        @keyframes starBurst { 0%,100%{transform:scale(0.8);opacity:0.6} 50%{transform:scale(1.2);opacity:1} }
        @keyframes goldGlow { 0%,100%{text-shadow:0 0 20px #fbbf24} 50%{text-shadow:0 0 60px #fbbf24, 0 0 100px #f59e0b} }
      `}</style>
      {/* 색종이 */}
      {['#fbbf24','#f472b6','#34d399','#60a5fa','#a78bfa','#fb923c'].map((c,ci)=>
        [...Array(8)].map((_,i)=>(
          <div key={ci*8+i} style={{
            position:'absolute',
            left: (ci*17+i*3+Math.sin(ci+i)*10)+'%',
            top:'-5%',
            width: (6+Math.sin(i)*4)+'px',
            height: (10+Math.cos(i)*6)+'px',
            background: c,
            borderRadius:'2px',
            animation:`confettiFall ${2+Math.sin(ci+i)*1.5}s ${(ci*0.15+i*0.1)}s ease-in infinite`,
            opacity:0.85,
          }}/>
        ))
      )}
      {/* 큰 별들 */}
      {['⭐','🌟','✨','💫','⭐','🌟'].map((e,i)=>(
        <div key={i} style={{
          position:'absolute',
          top: (10+Math.sin(i*2)*35)+'%',
          left: (10+i*15)+'%',
          fontSize: (2+Math.sin(i)*0.8)+'rem',
          animation:`starBurst ${1.5+Math.sin(i)*0.5}s ${i*0.2}s ease-in-out infinite`,
        }}>{e}</div>
      ))}
    </div>
  );
}

// R8: 별 사이로 로켓이 나아가는 우주 엔딩
function BgFinalSpace() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <style>{`
        @keyframes starScroll { 0%{transform:translateY(0)} 100%{transform:translateY(60px)} }
        @keyframes rocketSoar { 0%{transform:translate(-50%,30%) scale(0.6);opacity:0} 40%{opacity:1} 100%{transform:translate(-50%,-80%) scale(1.4);opacity:0.7} }
        @keyframes nebula { 0%,100%{opacity:0.08} 50%{opacity:0.18} }
        @keyframes pulse2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>
      {/* 성운 */}
      <div style={{
        position:'absolute', top:'20%', left:'20%',
        width:'60%', height:'60%', borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)',
        animation:'nebula 4s ease-in-out infinite',
      }}/>
      {/* 별 레이어 */}
      {[...Array(60)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width:(Math.sin(i*7+1)*1.5+1.5)+'px',
          height:(Math.sin(i*7+1)*1.5+1.5)+'px',
          background:'white',
          top:(Math.sin(i*3.1)*50+50)+'%',
          left:(Math.cos(i*2.7)*50+50)+'%',
          opacity: 0.1+Math.abs(Math.sin(i*1.3))*0.7,
          animation:`starBurst ${1.5+Math.sin(i)*1}s ${Math.cos(i*0.5)*0.5}s ease-in-out infinite`,
        }}/>
      ))}
      {/* 중앙 로켓 상승 */}
      <div style={{
        position:'absolute', left:'50%', bottom:'10%',
        fontSize:'4rem',
        animation:'rocketSoar 3s ease-in infinite',
      }}>🚀</div>
      {/* 은하수 느낌 띠 */}
      <div style={{
        position:'absolute', top:'30%', left:'-10%',
        width:'120%', height:'200px',
        background:'linear-gradient(90deg, transparent, rgba(139,92,246,0.08), rgba(99,102,241,0.12), rgba(139,92,246,0.08), transparent)',
        transform:'rotate(-15deg)',
        animation:'pulse2 5s ease-in-out infinite',
      }}/>
    </div>
  );
}

// 장면별 배경 컴포넌트 매핑
const SCENE_BACKGROUNDS = [BgPlanet, BgRocket, BgSolar, BgRobot, BgEarth, BgEco, BgCelebrate, BgFinalSpace];

// 장면 데이터
const ENDING_SCENES = [
  { round:'Round 1', text:'새로운 행성을 발견하고\n생명체의 흔적을 찾아냈습니다.', bg:'linear-gradient(135deg,#0f0c29,#1e1b4b)', border:'rgba(99,102,241,0.6)' },
  { round:'Round 2', text:'직접 설계한 로켓으로\n타우 세티 e를 향해 발사했습니다.', bg:'linear-gradient(135deg,#1a0000,#450a0a)', border:'rgba(239,68,68,0.6)' },
  { round:'Round 3', text:'우주 태양전지판을 펼쳐\n탐사에 필요한 에너지를 확보했습니다.', bg:'linear-gradient(135deg,#1c1000,#451a03)', border:'rgba(245,158,11,0.6)' },
  { round:'Round 4', text:'탐사 로봇을 조종해\n행성 곳곳의 데이터를 수집했습니다.', bg:'linear-gradient(135deg,#001a0e,#022c22)', border:'rgba(16,185,129,0.6)' },
  { round:'Round 5', text:'정확한 궤도를 계산해\n지구로 안전하게 귀환했습니다.', bg:'linear-gradient(135deg,#000d1a,#0c2340)', border:'rgba(59,130,246,0.6)' },
  { round:'Round 6', text:'지속가능한 우주를 위한\n아이디어 포스터를 완성했습니다.', bg:'linear-gradient(135deg,#001a0e,#064e3b)', border:'rgba(16,185,129,0.5)' },
  { round:null,      text:'6번의 임무를 모두 완수한 여러분,\n진심으로 축하합니다!', bg:'linear-gradient(135deg,#1c0f00,#451a03)', border:'rgba(251,191,36,0.8)', big:true },
  { round:null,      text:'여러분은 앞으로\n우주산업을 이끌어갈\n빛나는 기대주입니다.', bg:'linear-gradient(135deg,#0a001a,#1e0b3a)', border:'rgba(167,139,250,0.8)', big:true },
];

// 타자 효과 훅
function useTypewriter(text, speed, active) {
  const [displayed, setDisplayed] = React.useState('');
  React.useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const clean = text;
    const timer = setInterval(() => {
      if (i < clean.length) { setDisplayed(clean.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, active]);
  return displayed;
}

function EndingSequence({ onComplete }) {
  const [sceneIdx, setSceneIdx] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  const SCENE_DURATION = 1700;
  const FADE_DURATION = 350;

  React.useEffect(() => {
    const total = ENDING_SCENES.length;
    const advance = () => {
      setFade(false);
      setTimeout(() => {
        setSceneIdx(prev => {
          const next = prev + 1;
          if (next >= total) { onComplete(); return prev; }
          return next;
        });
        setFade(true);
      }, FADE_DURATION);
    };
    const timer = setTimeout(advance, SCENE_DURATION);
    return () => clearTimeout(timer);
  }, [sceneIdx]);

  const scene = ENDING_SCENES[sceneIdx];
  const BgComponent = SCENE_BACKGROUNDS[sceneIdx] || BgFinalSpace;
  const typed = useTypewriter(scene.text, 28, fade);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background: scene.bg,
      display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
      transition:`opacity ${FADE_DURATION}ms ease`,
      opacity: fade ? 1 : 0,
      padding:'2rem',
    }}>
      {/* 장면별 애니메이션 배경 */}
      <BgComponent />

      {/* 카드 */}
      <div style={{
        background:'rgba(0,0,0,0.45)',
        border:`2px solid ${scene.border}`,
        borderRadius:'24px',
        padding: scene.big ? '3rem 2.5rem' : '2.5rem 2rem',
        maxWidth:'540px', width:'100%',
        textAlign:'center',
        position:'relative', zIndex:2,
        backdropFilter:'blur(16px)',
        boxShadow:`0 0 50px ${scene.border}`,
      }}>
        {scene.round && (
          <div style={{
            display:'inline-block', padding:'0.25rem 0.875rem',
            background: scene.border, borderRadius:'20px',
            fontSize:'0.8rem', fontWeight:700, marginBottom:'1rem', letterSpacing:'0.05em',
          }}>{scene.round}</div>
        )}
        <p style={{
          fontSize: scene.big ? 'clamp(1.1rem,3vw,1.5rem)' : 'clamp(0.95rem,2.5vw,1.15rem)',
          lineHeight:2, fontWeight: scene.big ? 700 : 500,
          whiteSpace:'pre-line', minHeight:'3.5em', color:'white',
        }}>
          {typed}
          <span style={{opacity:0.5, animation:'blink 0.8s step-end infinite'}}>|</span>
        </p>
      </div>

      {/* 진행 도트 */}
      <div style={{ display:'flex', gap:'0.5rem', marginTop:'2rem', position:'relative', zIndex:2 }}>
        {ENDING_SCENES.map((_,i)=>(
          <div key={i} style={{
            width: i===sceneIdx ? '1.5rem' : '0.5rem',
            height:'0.5rem', borderRadius:'4px',
            background: i===sceneIdx ? 'white' : 'rgba(255,255,255,0.25)',
            transition:'all 0.3s',
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes starBurst { 0%,100%{transform:scale(0.8);opacity:0.5} 50%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}

function StudentGame() {
  const { sessionCode, studentData, setCurrentScreen } = useGame();
  const [currentRound, setCurrentRound] = useState(0);
  const [team, setTeam] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);       // 수업 종료(세션 삭제)
  const [finalResults, setFinalResults] = useState(false); // 최종결과 보기 (축하 화면)
  const [showEnding, setShowEnding] = useState(false);     // 엔딩 시퀀스
  const [endingDone, setEndingDone] = useState(false);     // 엔딩 완료 후 종료 화면

  useEffect(() => {
    if (!sessionCode) return;

    // 진입 시 세션 유효성 먼저 확인
    const checkSessionValid = async () => {
      try {
        const { getSession } = await import('../utils/storage');
        const session = await getSession(sessionCode);
        if (!session || session.closed) {
          localStorage.removeItem('student_data');
          setShowEnding(true);
          return;
        }
      } catch (e) {}
    };
    checkSessionValid();

    const unsubscribe = subscribeToSession(sessionCode, async (session) => {
      if (!session) {
        // 세션이 삭제됨 → 완전 종료
        localStorage.removeItem('student_data');
        setShowEnding(true);
        document.body.className = '';
        return;
      }

      // 세션 닫힘 플래그
      if (session.closed) {
        // localStorage에서 학생 데이터 삭제 → 재접근 불가
        localStorage.removeItem('student_data');
        setShowEnding(true);
        document.body.className = '';
        return;
      }

      // 최종 결과 표시 (축하 화면)
      if (session.finalResults) {
        setFinalResults(true);
        document.body.className = '';
        return;
      }

      setCurrentRound(session.currentRound || 0);

      if (session.currentRound > 0) {
        document.body.className = `round-${session.currentRound}-bg`;
      } else {
        document.body.className = '';
      }

      if (session.teams && studentData?.teamId) {
        const myTeam = session.teams.find(t => t.id === studentData.teamId);
        if (myTeam) {
          setTeam({ ...myTeam, currentStudentName: studentData.studentName });
        }
      }
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [sessionCode, studentData]);

  // ── 엔딩 시퀀스 ───────────────────────────────────────────
  if (showEnding && !endingDone) {
    return <EndingSequence onComplete={() => { setShowEnding(false); setEndingDone(true); setGameEnded(true); }} />;
  }

  // ── 세션 완전 종료 화면 ────────────────────────────────────
  if (gameEnded) {
    return (
      <div className="container">
        <div className="card card-large text-center" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ marginBottom: '1rem' }}>수업이 종료되었습니다</h2>
          <div className="alert alert-info">
            <p style={{ lineHeight: 1.8 }}>
              선생님이 수업을 종료했습니다.<br />
              해당 세션 코드로는 더 이상 접속할 수 없습니다.
            </p>
          </div>
          <button className="btn btn-primary mt-3" onClick={() => setCurrentScreen('home')}>
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 최종 결과 / 축하 화면 ──────────────────────────────────
  if (finalResults) {
    return (
      <div className="container">
        <div className="card card-large text-center" style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* 헤더 */}
          <div style={{ fontSize: '5rem', marginBottom: '0.5rem', animation: 'pulse 2s infinite' }}>
            🚀✨
          </div>
          <h1 style={{
            fontSize: 'clamp(1.6rem,4vw,2.2rem)', marginBottom: '1rem',
            background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            행성 탐사 성공!
          </h1>

          {/* 축하 메시지 1 */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.1))',
            border: '2px solid rgba(251,191,36,0.4)', borderRadius: '16px',
            padding: '1.5rem', marginBottom: '1.25rem',
          }}>
            <p style={{ fontSize: 'clamp(1rem,2.5vw,1.15rem)', lineHeight: 2, fontWeight: 500 }}>
              🎉 6번의 우주 임무를 모두 무사히 완수한 것을 진심으로 축하합니다!<br />
              타우 세티 e 행성 탐사에 성공한 여러분은 진정한 우주 탐험가입니다.
            </p>
          </div>

          {/* 축하 메시지 2 */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(167,139,250,0.15),rgba(139,92,246,0.1))',
            border: '2px solid rgba(167,139,250,0.4)', borderRadius: '16px',
            padding: '1.5rem', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
            <p style={{ fontSize: 'clamp(0.95rem,2.5vw,1.1rem)', lineHeight: 2 }}>
              여러분 한 명 한 명이 앞으로 우주산업 발전에 기여할
              <strong style={{ color: '#a78bfa' }}> 큰 인재</strong>가 되길<br />
              진심으로 응원하고 기대합니다!
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className="alert alert-info" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>
              ⏳ 선생님이 수업 종료 버튼을 누르면 해당 세션이 마감됩니다
            </p>
          </div>

          {/* 팀 점수 */}
          {team && (
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
              padding: '1.25rem', marginTop: '1.25rem',
            }}>
              <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>
                {studentData?.studentName}님의 팀 최종 점수
              </p>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fbbf24' }}>
                {team.totalScore || 0}점
              </div>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.25rem' }}>{team.name} 팀</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '1.5rem 0 0.5rem' }}>
            {['🛸','🌍','🚀','⭐','🛰️','🌟','🪐','✨'].map((e, i) => (
              <span key={i} style={{ fontSize: '1.8rem' }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container">
        <div className="card text-center">
          <div className="loading">
            <div style={{ fontSize: '4rem' }}>⏳</div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentRound === 0) {
    return (
      <div className="container">
        <div className="card card-large text-center">
          <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🚀</div>
          <h2>환영합니다, {studentData.studentName}님!</h2>
          <p className="subtitle" style={{ marginTop: '1rem' }}>
            팀: <strong>{team.name}</strong>
          </p>
          <div className="alert alert-info mt-2">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏱️</div>
            <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>
              선생님이 라운드를 시작할 때까지 기다려주세요
            </p>
          </div>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>현재 팀 점수</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fbbf24' }}>
              {team.totalScore || 0}
            </div>
          </div>
          <button
            className="btn btn-secondary mt-3"
            onClick={() => { if (window.confirm('정말 나가시겠습니까?')) setCurrentScreen('home'); }}
          >
            나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentRound === 1 && <Round1 team={team} sessionCode={sessionCode} />}
      {currentRound === 2 && <Round2 team={team} sessionCode={sessionCode} />}
      {currentRound === 3 && <Round3 team={team} sessionCode={sessionCode} />}
      {currentRound === 4 && <Round4 team={team} sessionCode={sessionCode} />}
      {currentRound === 5 && <Round5 team={team} sessionCode={sessionCode} />}
      {currentRound === 6 && <Round6 team={team} sessionCode={sessionCode} />}
    </div>
  );
}

export default StudentGame;
