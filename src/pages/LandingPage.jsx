import React, { useEffect, useRef } from 'react';

export default function LandingPage({ navigate }) {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBgEffect} />
        <div style={styles.heroContent} className="fade-in">
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            오픈소스 3D 공간 스캐닝
          </div>
          <h1 style={styles.heroTitle}>
            사진으로 만드는
            <br />
            <span style={styles.heroGradient}>3D 가상 공간</span>
          </h1>
          <p style={styles.heroDesc}>
            스마트폰 사진만으로 사무실, 매장, 부동산 등 어떤 공간이든
            <br />
            몰입감 있는 3D 가상 투어로 변환합니다.
          </p>
          <div style={styles.heroCTA}>
            <button style={styles.primaryBtn} onClick={() => navigate('upload')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              사진 업로드 시작
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('viewer', { project: { id: 'demo', name: '데모 사무실' } })}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              데모 체험하기
            </button>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>3D</span>
              <span style={styles.statLabel}>가상 투어</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>360°</span>
              <span style={styles.statLabel}>파노라마 뷰</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>AI</span>
              <span style={styles.statLabel}>공간 분석</span>
            </div>
          </div>
        </div>

        {/* 3D Preview */}
        <div style={styles.heroVisual} className="slide-up">
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <div style={styles.previewDots}>
                <span style={{ ...styles.dot, background: '#ef4444' }} />
                <span style={{ ...styles.dot, background: '#f59e0b' }} />
                <span style={{ ...styles.dot, background: '#10b981' }} />
              </div>
              <span style={styles.previewTitle}>SpaceView 3D Viewer</span>
            </div>
            <div style={styles.previewBody}>
              <DemoScene />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>쉽고 빠른 3D 변환 파이프라인</h2>
          <p style={styles.sectionDesc}>
            복잡한 장비 없이 스마트폰 사진만으로 고품질 3D 공간을 만들 수 있습니다
          </p>
        </div>
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard} className="fade-in">
              <div style={{ ...styles.featureIcon, background: f.color }}>
                {f.icon}
              </div>
              <div style={styles.featureStep}>STEP {i + 1}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
              <div style={styles.featureTech}>
                {f.techs.map((t, j) => (
                  <span key={j} style={styles.techTag}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section style={styles.techSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>기술 스택</h2>
          <p style={styles.sectionDesc}>
            최신 오픈소스 기술로 구축된 3D 공간 시각화 플랫폼
          </p>
        </div>
        <div style={styles.techGrid}>
          {techStack.map((t, i) => (
            <div key={i} style={styles.techCard}>
              <div style={styles.techCardIcon}>{t.icon}</div>
              <h4 style={styles.techCardTitle}>{t.name}</h4>
              <p style={styles.techCardDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>지금 바로 시작하세요</h2>
          <p style={styles.ctaDesc}>
            사무실 사진을 업로드하고 몇 분 안에 3D 가상 투어를 만들어 보세요
          </p>
          <button style={styles.ctaButton} onClick={() => navigate('upload')}>
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerLogo}>SpaceView 3D</span>
          <span style={styles.footerText}>
            Powered by COLMAP, OpenMVS, Three.js & React
          </span>
        </div>
      </footer>
    </div>
  );
}

function DemoScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 600;
    const h = canvas.height = 360;
    let frame = 0;

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Grid floor
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.lineWidth = 0.5;
      const offset = (frame * 0.3) % 30;
      for (let i = 0; i < 20; i++) {
        const y = 200 + i * 15 - offset * 0.5;
        const spread = (y - 180) * 2;
        ctx.beginPath();
        ctx.moveTo(300 - spread, y);
        ctx.lineTo(300 + spread, y);
        ctx.stroke();
      }
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(300 + i * 5, 200);
        ctx.lineTo(300 + i * 60, h);
        ctx.stroke();
      }

      // Animated 3D wireframe room
      const t = frame * 0.01;
      const cx = 300, cy = 160;
      const size = 80;

      // Room vertices (perspective)
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      const points = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      ].map(([x, y, z]) => {
        const rx = x * cos - z * sin;
        const rz = x * sin + z * cos;
        const scale = 200 / (200 + rz * size * 0.5);
        return [cx + rx * size * scale, cy + y * size * 0.6 * scale];
      });

      const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7],
      ];

      // Glow effect
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1.5;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(points[a][0], points[a][1]);
        ctx.lineTo(points[b][0], points[b][1]);
        ctx.stroke();
      });

      // Vertices
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#2563eb';
      points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Point cloud effect
      for (let i = 0; i < 50; i++) {
        const px = Math.sin(frame * 0.02 + i * 1.2) * 120 + cx;
        const py = Math.cos(frame * 0.015 + i * 0.8) * 60 + cy;
        const alpha = 0.2 + Math.sin(frame * 0.03 + i) * 0.15;
        ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scan line
      const scanY = 100 + ((frame * 0.5) % 160);
      const gradient = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(100, scanY - 2, 400, 4);

      frame++;
      requestAnimationFrame(draw);
    }
    const rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: '0 0 12px 12px' }} />;
}

const features = [
  {
    title: '사진 촬영 & 업로드',
    desc: '스마트폰으로 공간을 다양한 각도에서 촬영하세요. 20~50장의 사진이면 충분합니다.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h18"/></svg>,
    color: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    techs: ['JPEG/PNG', 'EXIF 데이터', 'LiDAR 지원'],
  },
  {
    title: '3D 재구성',
    desc: 'SfM과 MVS 기술로 사진에서 자동으로 카메라 위치를 계산하고 3D 모델을 생성합니다.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    techs: ['COLMAP', 'OpenMVS', 'Gaussian Splatting'],
  },
  {
    title: 'AI 공간 분석',
    desc: '딥러닝으로 벽, 바닥, 가구 등을 자동 인식하고 공간의 구조를 분석합니다.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/><path d="M12 8v4l3 3"/></svg>,
    color: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    techs: ['Detectron2', 'Open3D', 'SegFormer'],
  },
  {
    title: '웹 3D 뷰어',
    desc: '브라우저에서 바로 3D 가상 투어를 체험하세요. 돌하우스 뷰, 평면도, 워크스루를 지원합니다.',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
    color: 'linear-gradient(135deg, #10b981, #34d399)',
    techs: ['Three.js', 'React Three Fiber', 'WebGL'],
  },
];

const techStack = [
  { name: 'React', desc: 'UI 프레임워크', icon: '⚛️' },
  { name: 'Three.js', desc: '3D 렌더링', icon: '🎨' },
  { name: 'COLMAP', desc: 'SfM 엔진', icon: '📐' },
  { name: 'OpenMVS', desc: '3D 재구성', icon: '🏗️' },
  { name: 'Open3D', desc: '포인트클라우드', icon: '☁️' },
  { name: 'Express', desc: 'API 서버', icon: '🔧' },
  { name: 'Detectron2', desc: 'AI 분석', icon: '🤖' },
  { name: 'WebGL', desc: '하드웨어 가속', icon: '⚡' },
];

const styles = {
  page: {
    minHeight: '100vh',
  },
  // Hero
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 32px 60px',
    overflow: 'hidden',
  },
  heroBgEffect: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  heroContent: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    maxWidth: 800,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(37, 99, 235, 0.15)',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#60a5fa',
    marginBottom: 24,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite',
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    marginBottom: 20,
    color: '#f1f5f9',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #a855f7 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: 18,
    lineHeight: 1.7,
    color: '#94a3b8',
    marginBottom: 36,
  },
  heroCTA: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 48,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    padding: '14px 28px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
    transition: 'all 0.3s',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#f1f5f9',
    padding: '14px 28px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    border: '1px solid rgba(241, 245, 249, 0.15)',
    transition: 'all 0.3s',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 24,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 40,
    background: 'rgba(71, 85, 105, 0.5)',
  },
  heroVisual: {
    width: '100%',
    maxWidth: 640,
    marginTop: 40,
    position: 'relative',
    zIndex: 1,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.4)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    background: '#1e293b',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
  },
  previewDots: {
    display: 'flex',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
  previewTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
  },
  previewBody: {
    height: 360,
    background: '#0f172a',
  },
  // Features
  features: {
    padding: '100px 32px',
    maxWidth: 1280,
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 16,
    color: '#f1f5f9',
  },
  sectionDesc: {
    fontSize: 16,
    color: '#94a3b8',
    maxWidth: 600,
    margin: '0 auto',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260, 1fr))',
    gap: 24,
  },
  featureCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: 16,
    padding: 28,
    transition: 'all 0.3s',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureStep: {
    fontSize: 11,
    fontWeight: 700,
    color: '#06b6d4',
    letterSpacing: '0.1em',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 10,
    color: '#f1f5f9',
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#94a3b8',
    marginBottom: 16,
  },
  featureTech: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTag: {
    display: 'inline-block',
    background: 'rgba(37, 99, 235, 0.1)',
    border: '1px solid rgba(37, 99, 235, 0.2)',
    borderRadius: 6,
    padding: '3px 10px',
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: 500,
  },
  // Tech Stack
  techSection: {
    padding: '80px 32px',
    maxWidth: 1280,
    margin: '0 auto',
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 16,
  },
  techCard: {
    background: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(71, 85, 105, 0.2)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  techCardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  techCardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f1f5f9',
    marginBottom: 4,
  },
  techCardDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  // CTA
  ctaSection: {
    padding: '60px 32px 80px',
    maxWidth: 800,
    margin: '0 auto',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(6, 182, 212, 0.1))',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    borderRadius: 24,
    padding: '60px 40px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 12,
    color: '#f1f5f9',
  },
  ctaDesc: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 28,
  },
  ctaButton: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '14px 36px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
    transition: 'all 0.3s',
  },
  // Footer
  footer: {
    borderTop: '1px solid rgba(71, 85, 105, 0.2)',
    padding: '24px 32px',
  },
  footerContent: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: 600,
    color: '#64748b',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
  },
};
