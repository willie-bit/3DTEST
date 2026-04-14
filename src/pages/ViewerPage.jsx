import React, { useState, useCallback, useEffect, useRef } from 'react';
import RoomViewer from '../components/RoomViewer';

export default function ViewerPage({ navigate, project, photos }) {
  const [currentViewpoint, setCurrentViewpoint] = useState(0);
  const [showHelp, setShowHelp] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState('inside'); // 'inside' or 'outside'

  const hasPhotos = photos && photos.length > 0;

  // Auto-hide help after 5 seconds
  useEffect(() => {
    if (showHelp) {
      const t = setTimeout(() => setShowHelp(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showHelp]);

  // Organize photos into viewpoints (groups of up to 6 for cube faces)
  const viewpoints = [];
  if (hasPhotos) {
    // Each viewpoint uses up to 6 photos for the room faces
    // Minimum: 1 photo per viewpoint (shown as front wall, others auto-filled)
    const photosPerView = Math.min(6, Math.max(1, Math.ceil(photos.length / Math.max(1, Math.floor(photos.length / 4)))));
    for (let i = 0; i < photos.length; i += photosPerView) {
      viewpoints.push(photos.slice(i, i + photosPerView));
    }
  }

  const totalViewpoints = viewpoints.length;
  const currentPhotos = viewpoints[currentViewpoint] || [];

  const goToViewpoint = (index) => {
    if (index >= 0 && index < totalViewpoints) {
      setCurrentViewpoint(index);
    }
  };

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
              {hasPhotos
                ? `지점 ${currentViewpoint + 1} / ${totalViewpoints} (${photos.length}장)`
                : '사진을 업로드하세요'}
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

      {/* Main 3D Room */}
      <div style={styles.mainArea}>
        {hasPhotos ? (
          <RoomViewer
            photos={currentPhotos}
            allPhotos={photos}
            viewMode={viewMode}
            viewpointIndex={currentViewpoint}
            totalViewpoints={totalViewpoints}
          />
        ) : (
          <div style={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            <h3 style={styles.emptyTitle}>공간 사진을 업로드하세요</h3>
            <p style={styles.emptyDesc}>
              사무실 사진을 올리면 사진이 벽면에 투영되어<br />
              공간 안에 들어가 있는 것처럼 볼 수 있습니다
            </p>
            <button style={styles.uploadBtn} onClick={() => navigate('upload')}>
              사진 업로드
            </button>
          </div>
        )}
      </div>

      {/* Navigation floor hotspots */}
      {hasPhotos && totalViewpoints > 1 && (
        <div style={styles.navOverlay}>
          {currentViewpoint > 0 && (
            <button
              style={{ ...styles.floorNav, left: '25%' }}
              onClick={() => goToViewpoint(currentViewpoint - 1)}
            >
              <div style={styles.floorNavRing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
              <span style={styles.floorNavLabel}>이전 지점</span>
            </button>
          )}
          {currentViewpoint < totalViewpoints - 1 && (
            <button
              style={{ ...styles.floorNav, right: '25%' }}
              onClick={() => goToViewpoint(currentViewpoint + 1)}
            >
              <div style={styles.floorNavRing}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
              <span style={styles.floorNavLabel}>다음 지점</span>
            </button>
          )}
        </div>
      )}

      {/* Viewpoint selector */}
      {hasPhotos && totalViewpoints > 1 && (
        <div style={styles.viewpointBar}>
          {viewpoints.map((vp, i) => (
            <button
              key={i}
              style={{
                ...styles.vpDot,
                ...(i === currentViewpoint ? styles.vpDotActive : {}),
              }}
              onClick={() => goToViewpoint(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Photo thumbnails */}
      {hasPhotos && (
        <div style={styles.thumbBar}>
          <div style={styles.thumbScroll}>
            {photos.map((p, i) => {
              // Find which viewpoint this photo belongs to
              let vpIdx = 0;
              let count = 0;
              for (let v = 0; v < viewpoints.length; v++) {
                count += viewpoints[v].length;
                if (i < count) { vpIdx = v; break; }
              }
              return (
                <img
                  key={p.id || i}
                  src={p.url}
                  alt=""
                  style={{
                    ...styles.thumb,
                    ...(vpIdx === currentViewpoint ? styles.thumbActive : {}),
                  }}
                  onClick={() => goToViewpoint(vpIdx)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Help overlay */}
      {showHelp && hasPhotos && (
        <div style={styles.helpOverlay} onClick={() => setShowHelp(false)}>
          <div style={styles.helpCard}>
            <h3 style={styles.helpTitle}>조작 방법</h3>
            <div style={styles.helpRow}>🖱️ 드래그: 시점 회전 (주위를 둘러보기)</div>
            <div style={styles.helpRow}>🔲 스크롤: 확대/축소</div>
            <div style={styles.helpRow}>⭕ 바닥 원: 다음 지점으로 이동</div>
            <div style={styles.helpRow}>📷 하단 썸네일: 지점 선택</div>
            <p style={styles.helpDismiss}>클릭하여 닫기</p>
          </div>
        </div>
      )}

      {/* Info panel */}
      {showInfo && (
        <div style={styles.infoPanel}>
          <div style={styles.infoPanelHeader}>
            <span>공간 정보</span>
            <button style={styles.infoPanelClose} onClick={() => setShowInfo(false)}>×</button>
          </div>
          <div style={styles.infoPanelBody}>
            <div style={styles.infoRow}><span style={styles.infoLabel}>총 사진</span><span style={styles.infoValue}>{photos?.length || 0}장</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>시점 수</span><span style={styles.infoValue}>{totalViewpoints}개</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>현재 시점</span><span style={styles.infoValue}>{currentViewpoint + 1}</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>현재 사진</span><span style={styles.infoValue}>{currentPhotos.length}장 사용</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>렌더링</span><span style={styles.infoValue}>Three.js 큐브 투영</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>모드</span><span style={styles.infoValue}>{viewMode === 'inside' ? '내부 시점' : '외부 시점'}</span></div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div style={styles.bottomBar}>
        <span style={styles.hint}>
          마우스 드래그로 주위를 둘러보세요 | 바닥 원을 클릭하여 이동
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
    background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
  },
  viewTabActive: { color: '#fff', background: 'rgba(37,99,235,0.4)' },
  topRight: { display: 'flex', gap: 6 },
  toolBtn: {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#aaa',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
  },
  toolBtnActive: { background: 'rgba(37,99,235,0.3)', color: '#60a5fa' },
  mainArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  emptyState: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: 600, color: '#94a3b8' },
  emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6 },
  uploadBtn: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)', color: 'white',
    padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  navOverlay: { position: 'absolute', bottom: 140, left: 0, right: 0, pointerEvents: 'none', zIndex: 50 },
  floorNav: {
    position: 'absolute', pointerEvents: 'auto', background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  floorNavRing: {
    width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.6)',
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 30px rgba(255,255,255,0.15)', animation: 'pulse 2s infinite',
  },
  floorNavLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.8)' },
  viewpointBar: {
    position: 'absolute', bottom: 108, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
    display: 'flex', gap: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
    padding: '6px 12px', borderRadius: 20,
  },
  vpDot: {
    width: 28, height: 28, borderRadius: '50%', fontSize: 11, fontWeight: 600, color: '#888',
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  },
  vpDotActive: {
    background: '#2563eb', color: '#fff', border: '1px solid #2563eb',
    boxShadow: '0 0 12px rgba(37,99,235,0.5)',
  },
  thumbBar: {
    height: 64, flexShrink: 0, background: 'rgba(0,0,0,0.9)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden', zIndex: 100,
  },
  thumbScroll: { display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' },
  thumb: {
    width: 52, height: 52, objectFit: 'cover', borderRadius: 4, cursor: 'pointer',
    border: '2px solid transparent', opacity: 0.4, transition: 'all 0.2s', flexShrink: 0,
  },
  thumbActive: { border: '2px solid #2563eb', opacity: 1, boxShadow: '0 0 10px rgba(37,99,235,0.4)' },
  helpOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  helpCard: {
    background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '24px 32px', maxWidth: 340, textAlign: 'center',
  },
  helpTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 },
  helpRow: { fontSize: 13, color: '#aaa', marginBottom: 8, textAlign: 'left' },
  helpDismiss: { fontSize: 11, color: '#555', marginTop: 12 },
  infoPanel: {
    position: 'absolute', top: 60, right: 12, width: 250, zIndex: 90,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden',
  },
  infoPanelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: 13, fontWeight: 600, color: '#fff',
  },
  infoPanelClose: { background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' },
  infoPanelBody: { padding: '10px 14px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 12, color: '#888' },
  infoValue: { fontSize: 12, color: '#ddd', fontWeight: 500 },
  bottomBar: {
    height: 28, flexShrink: 0, background: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  hint: { fontSize: 11, color: '#555' },
};
