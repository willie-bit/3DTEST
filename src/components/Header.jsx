import React, { useState, useEffect } from 'react';

export default function Header({ navigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      ...styles.header,
      ...(scrolled ? styles.headerScrolled : {}),
    }}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('landing')}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#logoGrad)" />
              <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="#0f172a" opacity="0.6" />
              <path d="M16 12L19 13.75V17.25L16 19L13 17.25V13.75L16 12Z" fill="white" />
            </svg>
          </div>
          <span style={styles.logoText}>SpaceView 3D</span>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navLink,
              ...(currentPage === 'landing' ? styles.navLinkActive : {}),
            }}
            onClick={() => navigate('landing')}
          >
            홈
          </button>
          <button
            style={{
              ...styles.navLink,
              ...(currentPage === 'projects' ? styles.navLinkActive : {}),
            }}
            onClick={() => navigate('projects')}
          >
            내 프로젝트
          </button>
          <button
            style={styles.ctaButton}
            onClick={() => navigate('upload')}
          >
            + 새 스캔
          </button>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '16px 0',
    transition: 'all 0.3s ease',
    background: 'transparent',
  },
  headerScrolled: {
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
    padding: '12px 0',
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    background: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: '#f1f5f9',
    background: 'rgba(37, 99, 235, 0.15)',
  },
  ctaButton: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    marginLeft: 8,
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  },
};
