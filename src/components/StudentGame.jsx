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

// ════════════════════════════════════════════════════
// 모든 엔딩 CSS (한 곳에 통합)
// ════════════════════════════════════════════════════
const ENDING_CSS = `
  @keyframes eg_twinkle  { 0%,100%{opacity:.15} 50%{opacity:.9} }
  @keyframes eg_float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes eg_launch   { 0%{transform:translateX(-50%) translateY(0);opacity:0} 15%{opacity:1} 100%{transform:translateX(-50%) translateY(-110vh);opacity:0} }
  @keyframes eg_sunpulse { 0%,100%{box-shadow:0 0 40px #fbbf24,0 0 80px rgba(251,191,36,.3)} 50%{box-shadow:0 0 70px #fbbf24,0 0 140px rgba(251,191,36,.5)} }
  @keyframes eg_spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes eg_panelopen{ from{width:0;opacity:0} to{opacity:1} }
  @keyframes eg_robot    { 0%{left:20%;bottom:35%} 25%{left:60%;bottom:35%} 50%{left:60%;bottom:65%} 75%{left:35%;bottom:65%} 100%{left:20%;bottom:35%} }
  @keyframes eg_scandot  { 0%,100%{transform:translate(-50%,50%) scale(1);opacity:.8} 50%{transform:translate(-50%,50%) scale(1.5);opacity:1} }
  @keyframes eg_orbit    { from{transform:translateX(-50%) translateY(65px) rotate(0deg)} to{transform:translateX(-50%) translateY(65px) rotate(360deg)} }
  @keyframes eg_leaf     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(12deg)} }
  @keyframes eg_sparkle  { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
  @keyframes eg_confetti { 0%{transform:translateY(-8%) rotate(0deg);opacity:1} 100%{transform:translateY(110%) rotate(540deg);opacity:0} }
  @keyframes eg_starburst{ 0%,100%{transform:scale(.7);opacity:.5} 50%{transform:scale(1.3);opacity:1} }
  @keyframes eg_nebula   { 0%,100%{opacity:.7} 50%{opacity:1} }
  @keyframes eg_soar     { 0%{transform:translateX(-50%) translateY(0) scale(.7);opacity:0} 30%{opacity:1} 100%{transform:translateX(-50%) translateY(-100vh) scale(1.3);opacity:0} }
  @keyframes eg_blink    { 0%,100%{opacity:1} 50%{opacity:0} }
`;

// 별 공통 컴포넌트
function Stars({ count=50 }) {
  const list = React.useMemo(()=>
    [...Array(count)].map((_,i)=>({
      w:(Math.abs(Math.sin(i*7.3))*2+1).toFixed(1),
      top:((Math.sin(i*3.7)*.5+.5)*100).toFixed(1),
      left:((Math.cos(i*2.9)*.5+.5)*100).toFixed(1),
      dur:(1.5+Math.abs(Math.sin(i))*2).toFixed(1),
      del:(Math.abs(Math.cos(i*.7))*1.5).toFixed(1),
    })),[count]);
  return (<>{list.map((s,i)=>(
    <div key={i} style={{position:'absolute',width:s.w+'px',height:s.w+'px',borderRadius:'50%',
      background:'white',top:s.top+'%',left:s.left+'%',opacity:.6,
      animation:`eg_twinkle ${s.dur}s ${s.del}s ease-in-out infinite`}}/>
  ))}</>);
}

// R1: 행성 + 별
function BgPlanet() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <Stars />
      <div style={{position:'absolute',bottom:'8%',right:'8%',width:'180px',height:'180px',
        borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,#a5b4fc,#3730a3 60%,#1e1b4b)',
        boxShadow:'0 0 60px rgba(129,140,248,.6)',animation:'eg_float 4s ease-in-out infinite'}}/>
    </div>
  );
}

// R2: 로켓 발사
function BgRocket() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <Stars count={35}/>
      <div style={{position:'absolute',left:'50%',bottom:'5%',fontSize:'4rem',animation:'eg_launch 2.2s ease-in infinite'}}>🚀</div>
      <div style={{position:'absolute',left:'28%',bottom:'5%',fontSize:'2.5rem',animation:'eg_launch 2.2s .4s ease-in infinite',opacity:.5}}>🚀</div>
      <div style={{position:'absolute',left:'68%',bottom:'5%',fontSize:'2.5rem',animation:'eg_launch 2.2s .7s ease-in infinite',opacity:.5}}>🚀</div>
    </div>
  );
}

// R3: 태양 + 전지판
function BgSolar() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <Stars count={30}/>
      <div style={{position:'absolute',top:'12%',right:'12%',width:'110px',height:'110px',borderRadius:'50%',
        background:'radial-gradient(circle,#fef3c7,#fbbf24 50%,#d97706)',
        boxShadow:'0 0 40px #fbbf24',animation:'eg_sunpulse 2.5s ease-in-out infinite'}}/>
      <div style={{position:'absolute',top:'12%',right:'12%',width:'110px',height:'110px',
        animation:'eg_spin 10s linear infinite'}}>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{position:'absolute',top:'50%',left:'50%',
            width:'70px',height:'2px',background:'linear-gradient(to right,rgba(251,191,36,.8),transparent)',
            transformOrigin:'0 50%',transform:`rotate(${i*45}deg)`,marginTop:'-1px'}}/>
        ))}
      </div>
      <div style={{position:'absolute',bottom:'20%',left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:'3px'}}>
        <div style={{height:'14px',background:'linear-gradient(90deg,#1d4ed8,#60a5fa)',borderRadius:'2px',
          animation:'eg_panelopen 1.8s .3s ease-out both',width:'90px'}}/>
        <div style={{width:'14px',height:'28px',background:'#94a3b8',borderRadius:'2px'}}/>
        <div style={{height:'14px',background:'linear-gradient(90deg,#60a5fa,#1d4ed8)',borderRadius:'2px',
          animation:'eg_panelopen 1.8s .5s ease-out both',width:'90px'}}/>
      </div>
    </div>
  );
}

// R4: 그리드 + 로봇
function BgRobot() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.15}}>
        <defs><pattern id="eg_grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#34d399" strokeWidth=".8"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#eg_grid)"/>
      </svg>
      {[[20,35],[60,35],[60,65],[35,65]].map(([l,b],i)=>(
        <div key={i} style={{position:'absolute',left:l+'%',bottom:b+'%',width:'12px',height:'12px',
          borderRadius:'50%',background:'#34d399',opacity:.8,transform:'translate(-50%,50%)',
          animation:`eg_scandot 1.5s ${i*.25}s ease-in-out infinite`}}/>
      ))}
      <div style={{position:'absolute',fontSize:'2.8rem',animation:'eg_robot 4s linear infinite'}}>🤖</div>
    </div>
  );
}

// R5: 지구 + 궤도
function BgEarth() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <Stars count={40}/>
      <div style={{position:'absolute',bottom:'10%',left:'50%',transform:'translateX(-50%)',
        width:'130px',height:'130px',borderRadius:'50%',
        background:'radial-gradient(circle at 38% 35%,#67e8f9,#1d4ed8 45%,#065f46)',
        boxShadow:'0 0 50px rgba(96,165,250,.6)',animation:'eg_float 5s ease-in-out infinite'}}>
        <div style={{position:'absolute',top:'18%',left:'12%',width:'28%',height:'18%',background:'rgba(255,255,255,.18)',borderRadius:'50%',transform:'rotate(-20deg)'}}/>
      </div>
      <div style={{position:'absolute',bottom:'10%',left:'50%',width:'240px',height:'240px',
        transform:'translateX(-50%) translateY(65px)',borderRadius:'50%',
        border:'1.5px dashed rgba(96,165,250,.3)'}}/>
      <div style={{position:'absolute',bottom:'10%',left:'50%',width:'240px',height:'240px',
        transform:'translateX(-50%) translateY(65px) rotate(0deg)',borderRadius:'50%',
        animation:'eg_orbit 3s linear infinite'}}>
        <div style={{position:'absolute',top:'-14px',left:'50%',transform:'translateX(-50%)',fontSize:'1.8rem'}}>🛸</div>
      </div>
    </div>
  );
}

// R6: 재활용 + 잎
function BgEco() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <div style={{position:'absolute',top:'10%',right:'10%',fontSize:'6rem',opacity:.2,animation:'eg_spin 8s linear infinite'}}>♻️</div>
      <div style={{position:'absolute',top:'55%',left:'5%',fontSize:'3rem',opacity:.2,animation:'eg_spin 6s 1s linear infinite'}}>♻️</div>
      {['🌱','🌿','🍃'].map((e,i)=>(
        <div key={i} style={{position:'absolute',bottom:(15+i*15)+'%',left:(12+i*22)+'%',
          fontSize:'2rem',opacity:.4,animation:`eg_leaf ${2.5+i*.4}s ${i*.3}s ease-in-out infinite`}}>{e}</div>
      ))}
      {[...Array(10)].map((_,i)=>(
        <div key={i} style={{position:'absolute',
          top:((Math.sin(i*3.7)*.4+.5)*100).toFixed(1)+'%',
          left:((Math.cos(i*2.9)*.4+.5)*100).toFixed(1)+'%',
          fontSize:'1rem',opacity:0,animation:`eg_sparkle ${1.5+Math.abs(Math.sin(i))}s ${(i*.2).toFixed(1)}s ease-in-out infinite`}}>✨</div>
      ))}
    </div>
  );
}

// R7: 색종이 축하
function BgCelebrate() {
  const pieces = React.useMemo(()=>
    ['#fbbf24','#f472b6','#34d399','#60a5fa','#a78bfa','#fb923c'].flatMap((c,ci)=>
      [...Array(7)].map((_,i)=>({c,
        left:((ci*16+i*3+Math.abs(Math.sin(ci+i))*8)).toFixed(1),
        dur:(2+Math.abs(Math.sin(ci+i))*1.5).toFixed(1),
        delay:(ci*.12+i*.09).toFixed(2),
        w:(5+Math.abs(Math.sin(i))*5).toFixed(0),
        h:(9+Math.abs(Math.cos(i))*7).toFixed(0),
      }))), []);
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      {pieces.map((p,i)=>(
        <div key={i} style={{position:'absolute',top:'-5%',left:p.left+'%',
          width:p.w+'px',height:p.h+'px',background:p.c,borderRadius:'2px',opacity:.85,
          animation:`eg_confetti ${p.dur}s ${p.delay}s ease-in infinite`}}/>
      ))}
      {['⭐','🌟','✨','💫','⭐','🌟','✨'].map((e,i)=>(
        <div key={i} style={{position:'absolute',
          top:(10+Math.abs(Math.sin(i*2))*40).toFixed(1)+'%',
          left:(8+i*13).toFixed(1)+'%',
          fontSize:(1.8+Math.abs(Math.sin(i))*.8).toFixed(1)+'rem',
          animation:`eg_starburst ${1.5+Math.abs(Math.sin(i))*.5}s ${(i*.18).toFixed(2)}s ease-in-out infinite`}}>{e}</div>
      ))}
    </div>
  );
}

// R8: 성운 + 로켓 상승
function BgFinalSpace() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      <Stars count={65}/>
      <div style={{position:'absolute',top:'25%',left:'15%',width:'70%',height:'50%',borderRadius:'50%',
        background:'radial-gradient(ellipse,rgba(139,92,246,.18) 0%,rgba(59,130,246,.09) 55%,transparent 70%)',
        animation:'eg_nebula 5s ease-in-out infinite'}}/>
      <div style={{position:'absolute',left:'50%',bottom:'5%',fontSize:'3.5rem',animation:'eg_soar 2.8s ease-in infinite'}}>🚀</div>
    </div>
  );
}

const SCENE_BG = [BgPlanet,BgRocket,BgSolar,BgRobot,BgEarth,BgEco,BgCelebrate,BgFinalSpace];

const ENDING_SCENES = [
  {round:'Round 1', text:'새로운 행성을 발견하고\n생명체의 흔적을 찾아냈습니다.', bg:'#0a0e27', accent:'#818cf8'},
  {round:'Round 2', text:'직접 설계한 로켓으로\n타우 세티 e를 향해 발사했습니다.', bg:'#1a0008', accent:'#f87171'},
  {round:'Round 3', text:'우주 태양전지판을 펼쳐\n탐사에 필요한 에너지를 확보했습니다.', bg:'#1c1000', accent:'#fbbf24'},
  {round:'Round 4', text:'탐사 로봇을 조종해\n행성 곳곳의 데이터를 수집했습니다.', bg:'#001810', accent:'#34d399'},
  {round:'Round 5', text:'정확한 궤도를 계산해\n지구로 안전하게 귀환했습니다.', bg:'#000d20', accent:'#60a5fa'},
  {round:'Round 6', text:'지속가능한 우주를 위한\n아이디어 포스터를 완성했습니다.', bg:'#001a0e', accent:'#6ee7b7'},
  {round:null, text:'6번의 임무를 모두 완수한\n여러분을 진심으로 축하합니다!', bg:'#120a00', accent:'#fbbf24', big:true},
  {round:null, text:'여러분은 앞으로\n우주산업을 이끌어갈\n빛나는 기대주입니다.', bg:'#0a0018', accent:'#a78bfa', big:true},
];

function useTypewriter(text, speed, active) {
  const [displayed, setDisplayed] = React.useState('');
  React.useEffect(()=>{
    if (!active){setDisplayed('');return;}
    setDisplayed('');
    let i=0;
    const t=setInterval(()=>{
      if(i<text.length){setDisplayed(text.slice(0,i+1));i++;}
      else clearInterval(t);
    },speed);
    return ()=>clearInterval(t);
  },[text,active]);
  return displayed;
}

function EndingSequence({ onComplete }) {
  const [sceneIdx,setSceneIdx]=React.useState(0);
  const [fade,setFade]=React.useState(true);
  const SCENE_DUR=1750, FADE_DUR=350;

  React.useEffect(()=>{
    const total=ENDING_SCENES.length;
    const go=()=>{
      setFade(false);
      setTimeout(()=>{
        setSceneIdx(p=>{
          const n=p+1;
          if(n>=total){onComplete();return p;}
          return n;
        });
        setFade(true);
      },FADE_DUR);
    };
    const t=setTimeout(go,SCENE_DUR);
    return ()=>clearTimeout(t);
  },[sceneIdx]);

  const scene=ENDING_SCENES[sceneIdx];
  const BgComp=SCENE_BG[sceneIdx]||BgFinalSpace;
  const typed=useTypewriter(scene.text,56,fade);

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:scene.bg,
      display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
      transition:`opacity ${FADE_DUR}ms ease`,opacity:fade?1:0,padding:'2rem'}}>
      <style>{ENDING_CSS}</style>
      <BgComp/>
      <div style={{background:'rgba(0,0,0,0.5)',border:`2px solid ${scene.accent}`,borderRadius:'24px',
        padding:scene.big?'3rem 2.5rem':'2.5rem 2rem',maxWidth:'540px',width:'100%',
        textAlign:'center',position:'relative',zIndex:2,backdropFilter:'blur(16px)',
        boxShadow:`0 0 50px ${scene.accent}66`}}>
        {scene.round&&(
          <div style={{display:'inline-block',padding:'0.25rem 0.875rem',
            background:scene.accent+'33',border:`1px solid ${scene.accent}`,
            borderRadius:'20px',fontSize:'0.8rem',fontWeight:700,marginBottom:'1.25rem',
            letterSpacing:'0.08em',color:scene.accent}}>{scene.round}</div>
        )}
        <p style={{fontSize:scene.big?'clamp(1.1rem,3vw,1.45rem)':'clamp(0.95rem,2.5vw,1.15rem)',
          lineHeight:2,fontWeight:scene.big?700:500,whiteSpace:'pre-line',minHeight:'3.5em',color:'white'}}>
          {typed}<span style={{opacity:.5,animation:'eg_blink .8s step-end infinite'}}>|</span>
        </p>
      </div>
      <div style={{display:'flex',gap:'0.5rem',marginTop:'2rem',position:'relative',zIndex:2}}>
        {ENDING_SCENES.map((_,i)=>(
          <div key={i} style={{width:i===sceneIdx?'1.5rem':'0.5rem',height:'0.5rem',borderRadius:'4px',
            background:i===sceneIdx?scene.accent:'rgba(255,255,255,.25)',transition:'all .3s'}}/>
        ))}
      </div>
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
