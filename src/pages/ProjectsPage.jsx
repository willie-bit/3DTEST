import React from 'react';

const demoProjects = [
  {
    id: 'demo-office',
    name: '데모 사무실',
    date: '2026-04-14',
    photos: 32,
    status: 'completed',
    thumbnail: null,
    area: '120 m²',
  },
  {
    id: 'demo-meeting',
    name: '회의실 B',
    date: '2026-04-12',
    photos: 18,
    status: 'completed',
    thumbnail: null,
    area: '45 m²',
  },
  {
    id: 'demo-lobby',
    name: '로비',
    date: '2026-04-10',
    photos: 24,
    status: 'processing',
    thumbnail: null,
    area: '80 m²',
  },
];

export default function ProjectsPage({ navigate }) {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>내 프로젝트</h1>
            <p style={styles.subtitle}>생성한 3D 공간 스캔 목록</p>
          </div>
          <button style={styles.newBtn} onClick={() => navigate('upload')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 스캔
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>3</span>
            <span style={styles.statLabel}>총 프로젝트</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>2</span>
            <span style={styles.statLabel}>완료</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>1</span>
            <span style={styles.statLabel}>처리 중</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>245</span>
            <span style={styles.statLabel}>총 면적 (m²)</span>
          </div>
        </div>

        {/* Project Grid */}
        <div style={styles.grid}>
          {demoProjects.map(project => (
            <div
              key={project.id}
              style={styles.card}
              onClick={() => {
                if (project.status === 'completed') {
                  navigate('viewer', { project: { id: project.id, name: project.name } });
                }
              }}
            >
              {/* Thumbnail */}
              <div style={styles.cardThumb}>
                <div style={styles.thumbPlaceholder}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: project.status === 'completed'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                  color: project.status === 'completed' ? '#10b981' : '#f59e0b',
                }}>
                  {project.status === 'completed' ? '완료' : '처리 중'}
                </div>
              </div>

              {/* Info */}
              <div style={styles.cardInfo}>
                <h3 style={styles.cardName}>{project.name}</h3>
                <div style={styles.cardMeta}>
                  <span>{project.date}</span>
                  <span>|</span>
                  <span>{project.photos}장</span>
                  <span>|</span>
                  <span>{project.area}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.cardActions}>
                {project.status === 'completed' && (
                  <>
                    <button style={styles.actionBtn} title="3D 뷰어">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button style={styles.actionBtn} title="공유">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                      </svg>
                    </button>
                    <button style={styles.actionBtn} title="다운로드">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingTop: 90,
    paddingBottom: 60,
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.2)',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statNum: {
    fontSize: 24,
    fontWeight: 700,
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 20,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: 'rgba(30, 41, 59, 0.5)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  cardThumb: {
    height: 180,
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbPlaceholder: {
    opacity: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  cardInfo: {
    padding: '14px 18px',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f1f5f9',
    marginBottom: 6,
  },
  cardMeta: {
    display: 'flex',
    gap: 8,
    fontSize: 12,
    color: '#64748b',
  },
  cardActions: {
    display: 'flex',
    gap: 6,
    padding: '0 18px 14px',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};
