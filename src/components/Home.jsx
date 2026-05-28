import { useState } from 'react';
import { useGame } from '../context/GameContext';

function Home() {
  const { setCurrentScreen } = useGame();
  const [showPrivacy, setShowPrivacy] = useState(false);

  const privacySections = [
    {
      title: "제1조 [수집하는 개인정보 항목 및 수집 방법]",
      content: `운영자는 서비스 제공을 위해 필요 최소한의 개인정보만을 수집합니다.\n\n• 교사(운영자): 이름, 연락처(이메일) — 서비스 운영 시 직접 입력\n• 학생(참여자): 팀명, 학생 이름, 게임 참여 기록(점수, 라운드 결과) — 교사 또는 학생이 수업 중 직접 입력\n\n※ 학생은 이메일·비밀번호 없이 세션 코드와 이름만으로 참여합니다.\n※ 학생 정보의 등록·관리 책임은 담당 교사에게 있습니다.`
    },
    {
      title: "제2조 [개인정보 수집·이용 목적]",
      content: `• 수업용 우주산업 진로교육 게임 진행 및 결과 표시\n• 팀별·개인별 실시간 점수 집계 및 교사 대시보드 제공\n• 서비스 오류 추적 및 기술적 문제 해결`
    },
    {
      title: "제3조 [개인정보 보유 기간 및 파기]",
      content: `• 학생 이름, 팀명, 점수 등 세션 데이터: 수업 세션 종료 후 교사가 직접 삭제 (수업 당일 파기 원칙)\n• 접속 기록(IP 등): 3개월 보관 (「통신비밀보호법」 제15조의2 기준)\n\n※ 교사는 수업 종료 후 교사 대시보드의 '수업 종료' 기능으로 세션 데이터를 직접 삭제할 수 있습니다.`
    },
    {
      title: "제4조 [개인정보의 제3자 제공]",
      content: `운영자는 법령에 따른 경우를 제외하고 이용자의 사전 동의 없이 개인정보를 제3자에게 제공하지 않습니다.\n운영자는 학생 개인정보를 수익화·마케팅 목적으로 제3자에게 제공하지 않습니다.`
    },
    {
      title: "제5조 [개인정보 처리 위탁]",
      content: `운영자는 서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.\n\n• 수탁자: Google LLC (Firebase)\n• 위탁 업무: 실시간 데이터베이스 운영 (세션 데이터 저장·관리)\n• 데이터 보관 지역: 싱가포르 (asia-southeast1)\n\n※ 위탁 업무 내용 또는 수탁자가 변경될 경우 본 처리방침을 통해 공개합니다.`
    },
    {
      title: "제6조 [아동·청소년 개인정보 보호]",
      content: `서비스 이용자인 학생은 만 14세 미만 아동을 포함할 수 있습니다.\n\n• 학생 정보(이름, 팀명 등)는 담당 교사(지도·관리자)만이 등록·수정·삭제할 수 있습니다.\n• 학생 본인은 이름만 입력하며, 이메일 등 추가 개인정보를 직접 입력하지 않습니다.\n\n교사는 학생 정보를 등록하기 전 학교 규정 및 법령에 따라 필요한 동의 절차를 이행할 책임이 있습니다.`
    },
    {
      title: "제7조 [이용자의 권리와 행사 방법]",
      content: `이용자(교사) 및 학생의 법정대리인은 언제든지 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다.\n\n• 교사는 교사 대시보드를 통해 직접 학생 정보를 조회·수정·삭제할 수 있습니다.\n• 그 외 문의: 아래 개인정보 보호 책임자에게 연락\n\n개인정보 침해 신고 및 상담 기관:\n• 개인정보침해 신고센터: privacy.kisa.or.kr / (국번없이) 118\n• 개인정보 분쟁조정위원회: www.kopico.go.kr / (국번없이) 1833-6972`
    },
    {
      title: "제8조 [개인정보의 안전성 확보 조치]",
      content: `• Firebase 보안 규칙 적용을 통한 데이터 접근 권한 통제\n• 모든 데이터 통신에 HTTPS 암호화 적용\n• 세션 코드 기반 교사·학생 접근 권한 분리 관리`
    },
    {
      title: "제9조 [자동 수집 장치의 설치·운용 및 거부]",
      content: `운영자는 서비스 상태 유지를 위해 브라우저의 localStorage에 세션 정보를 임시 저장합니다.\n이용자는 브라우저 설정을 통해 직접 삭제할 수 있으며, 이 경우 서비스 이용이 초기화됩니다.\n운영자는 별도의 광고·마케팅 목적의 쿠키를 운영하지 않습니다.`
    },
    {
      title: "제10조 [개인정보 보호 책임자]",
      content: `운영자는 개인정보 처리와 관련한 민원을 신속히 처리하기 위해 개인정보 보호 책임자를 지정합니다.\n\n• 성명: 우수정\n• 이메일: ellysabet81@gmail.com\n\n본 개인정보 처리방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 공지사항을 통해 최소 7일 전에 고지합니다.\n\n부칙: 본 방침은 2026년 4월 1일부터 적용됩니다.`
    },
  ];

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
          <button
            onClick={() => setShowPrivacy(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.7,
              padding: 0,
            }}
          >
            개인정보처리방침
          </button>
          {' '}|{' '}개발: Elly (Soojeong) | 2026
        </p>
      </div>

      {showPrivacy && (
        <div
          onClick={() => setShowPrivacy(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e1b3a',
              color: '#e2e8f0',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '640px',
              margin: '0 1rem',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                우주산업 진로탐험 개인정보 처리방침
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              시행일: 2026년 4월 1일
            </p>

            {privacySections.map((section, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#c4b5fd',
                  borderLeft: '3px solid #7c3aed',
                  paddingLeft: '0.6rem',
                  marginBottom: '0.5rem',
                }}>
                  {section.title}
                </h3>
                <p style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  margin: 0,
                }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
