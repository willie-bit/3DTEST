import React, { useState, useCallback, useEffect } from 'react';
import RoomViewer from '../components/RoomViewer';

export default function ViewerPage({ navigate, project, photos }) {
  const [viewMode, setViewMode] = useState('inside');
  const [showHelp, setShowHelp] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const hasPhotos = photos && photos.length > 0;

  useEffect(() => {
    if (showHelp) {
      const t = setTimeout(() => setShowHelp(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showHelp]);

  return (
    <div style={styles.viewer}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button style={styles.backBtn} onClick={() => navigate('landing')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 style={styles.projectName}>{project?.name || '내 공간'}</h2>
            <span style={styles.projectMeta}>
              {hasPhotos ? `${photos.length}장 파노라마 뷰` : '사진을 업로드하세요'}
            </span>
          </div>
        </div>

        <div style={styles.viewTabs}>
          <button
            style={{ ...styles.viewTab, ...(viewMode === 'inside' ? styles.viewTabActive : {}) }}
            onClick={() => setViewMode('inside')}
          >
            🚶 내부 시점
          </button>
          <button
            style={{ ...styles.viewTab, ...(viewMode === 'outside' ? styles.viewTabActive : {}) }}
            onClick={() => setViewMode('outside')}
          >
            🏠 외부 시점
          </button>
        </div>

        <div style={styles.topRight}>
          <button
            style={{ ...styles.toolBtn, ...(showInfo ? styles.toolBtnActive : {}) }}
            onClick={() => setShowInfo(!showInfo)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3D Viewer - ALL photos passed at once */}
      <div style={styles.mainArea}>
        {hasPhotos ? (
          <RoomViewer photos={photos} viewMode={viewMode} />
        ) : (
          <div style={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#94a3b8' }}>사무실 사진을 업로드하세요</h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
              사진을 올리면 360° 파노라마처럼<br />공간 안에 들어가 둘러볼 수 있습니다
            </p>
            <button style={styles.uploadBtn} onClick={() => navigate('upload')}>
              사진 업로드
            </button>
          </div>
        )}
      </div>

      {/* Photo thumbnail strip */}
      {hasPhotos && (
        <div style={styles.thumbBar}>
          <div style={styles.thumbScroll}>
            {photos.map((p, i) => (
              <img key={p.id || i} src={p.url} alt="" style={styles.thumb} />
            ))}
          </div>
        </div>
      )}

      {/* Help overlay */}
      {showHelp && hasPhotos && (
        <div style={styles.helpOverlay} onClick={() => setShowHelp(false)}>
          <div style={styles.helpCard}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 12 }}>조작 방법</h3>
            <div style={styles.helpRow}>🖱️ 드래그: 주위를 둘러보기</div>
            <div style={styles.helpRow}>🔲 스크롤: 확대/축소</div>
            <p style={{ fontSize: 11, color: '#555', marginTop: 12 }}>클릭하여 닫기</p>
          </div>
        </div>
      )}

      {/* Info panel */}
      {showInfo && (
        <div style={styles.infoPanel}>
          <div style={styles.infoHeader}>
            <span>공간 정보</span>
            <button style={{ background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' }} onClick={() => setShowInfo(false)}>×</button>
          </div>
          <div style={{ padding: '10px 14px' }}>
            <div style={styles.infoRow}><span style={styles.infoLabel}>사진 수</span><span style={styles.infoValue}>{photos?.length || 0}장</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>렌더링</span><span style={styles.infoValue}>360° 파노라마 투영</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>모드</span><span style={styles.infoValue}>{viewMode === 'inside' ? '내부 시점' : '외부 시점'}</span></div>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={styles.bottomBar}>
        <span style={{ fontSize: 11, color: '#555' }}>
          마우스 드래그로 360° 둘러보세요 | 스크롤로 확대/축소
        </span>
      </div>
    </div>
  );
}

const styles = {
  viewer: { position: 'fixed', inset: 0, background: '#000', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  topBar: {
    height: 52, flexShrink: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#aaa',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
  },
  projectName: { fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 },
  projectMeta: { fontSize: 11, color: '#666' },
  viewTabs: { display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2 },
  viewTab: {
    padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#888',
    background: 'none', border: 'none', cursor: 'pointer',
  },
  viewTabActive: { color: '#fff', background: 'rgba(37,99,235,0.4)' },
  topRight: { display: 'flex', gap: 6 },
  toolBtn: {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#aaa',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
  },
  toolBtnActive: { background: 'rgba(37,99,235,0.3)', color: '#60a5fa' },
  mainArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  uploadBtn: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)', color: 'white',
    padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  thumbBar: {
    height: 60, flexShrink: 0, background: 'rgba(0,0,0,0.9)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden', zIndex: 100,
  },
  thumbScroll: { display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' },
  thumb: {
    width: 48, height: 48, objectFit: 'cover', borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)', opacity: 0.7, flexShrink: 0,
  },
  helpOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  helpCard: {
    background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '24px 32px', maxWidth: 300,
  },
  helpRow: { fontSize: 13, color: '#aaa', marginBottom: 8, textAlign: 'left' },
  infoPanel: {
    position: 'absolute', top: 60, right: 12, width: 240, zIndex: 90,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden',
  },
  infoHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: 13, fontWeight: 600, color: '#fff',
  },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 12, color: '#888' },
  infoValue: { fontSize: 12, color: '#ddd', fontWeight: 500 },
  bottomBar: {
    height: 28, flexShrink: 0, background: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
};
