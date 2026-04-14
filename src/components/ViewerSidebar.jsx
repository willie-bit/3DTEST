import React from 'react';

export default function ViewerSidebar({ annotations, onClose, onSelectAnnotation }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h3 style={styles.title}>공간 정보</h3>
        <button style={styles.closeBtn} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Space Stats */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>공간 분석</h4>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>120</span>
            <span style={styles.statUnit}>m²</span>
            <span style={styles.statLabel}>총 면적</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>3.5</span>
            <span style={styles.statUnit}>m</span>
            <span style={styles.statLabel}>천장 높이</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>4</span>
            <span style={styles.statUnit}>개</span>
            <span style={styles.statLabel}>구역</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>6</span>
            <span style={styles.statUnit}>개</span>
            <span style={styles.statLabel}>워크스테이션</span>
          </div>
        </div>
      </div>

      {/* Annotations */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>주요 지점</h4>
        <div style={styles.annotationList}>
          {annotations.map(a => (
            <div
              key={a.id}
              style={styles.annotationItem}
              onClick={() => onSelectAnnotation(a)}
            >
              <div style={styles.annotationDot} />
              <div>
                <div style={styles.annotationLabel}>{a.label}</div>
                <div style={styles.annotationDesc}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Detection */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>AI 감지 결과</h4>
        <div style={styles.detectionList}>
          {[
            { name: '책상', count: 6, icon: '🪑', confidence: 97 },
            { name: '의자', count: 10, icon: '💺', confidence: 95 },
            { name: '모니터', count: 6, icon: '🖥️', confidence: 93 },
            { name: '화이트보드', count: 1, icon: '📋', confidence: 91 },
            { name: '책장', count: 1, icon: '📚', confidence: 89 },
            { name: '식물', count: 2, icon: '🌿', confidence: 85 },
          ].map((item, i) => (
            <div key={i} style={styles.detectionItem}>
              <span style={styles.detectionIcon}>{item.icon}</span>
              <span style={styles.detectionName}>{item.name}</span>
              <span style={styles.detectionCount}>{item.count}개</span>
              <div style={styles.confidenceBar}>
                <div
                  style={{
                    ...styles.confidenceFill,
                    width: `${item.confidence}%`,
                  }}
                />
              </div>
              <span style={styles.confidenceText}>{item.confidence}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Info */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>기술 정보</h4>
        <div style={styles.techList}>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>SfM 엔진</span>
            <span style={styles.techValue}>COLMAP</span>
          </div>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>3D 재구성</span>
            <span style={styles.techValue}>OpenMVS</span>
          </div>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>AI 분석</span>
            <span style={styles.techValue}>Detectron2</span>
          </div>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>렌더링</span>
            <span style={styles.techValue}>Three.js</span>
          </div>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>폴리곤 수</span>
            <span style={styles.techValue}>~45,000</span>
          </div>
          <div style={styles.techRow}>
            <span style={styles.techLabel}>포인트 클라우드</span>
            <span style={styles.techValue}>2,000 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'absolute',
    top: 56,
    right: 0,
    bottom: 48,
    width: 320,
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(71, 85, 105, 0.3)',
    overflowY: 'auto',
    zIndex: 90,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f1f5f9',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    padding: '16px 18px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f1f5f9',
    display: 'inline',
  },
  statUnit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 2,
    display: 'inline',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  annotationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  annotationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(30, 41, 59, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  annotationDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#2563eb',
    flexShrink: 0,
  },
  annotationLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f1f5f9',
  },
  annotationDesc: {
    fontSize: 11,
    color: '#64748b',
  },
  detectionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  detectionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },
  detectionIcon: {
    fontSize: 14,
  },
  detectionName: {
    color: '#e2e8f0',
    fontWeight: 500,
    width: 60,
  },
  detectionCount: {
    color: '#64748b',
    width: 30,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    background: 'rgba(71, 85, 105, 0.3)',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
    borderRadius: 2,
  },
  confidenceText: {
    color: '#64748b',
    fontSize: 11,
    width: 30,
    textAlign: 'right',
  },
  techList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  techRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  techValue: {
    fontSize: 12,
    color: '#f1f5f9',
    fontWeight: 500,
  },
};
