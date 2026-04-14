import React, { useState, useCallback } from 'react';
import Scene3D from '../components/Scene3D';
import ViewerToolbar from '../components/ViewerToolbar';
import ViewerSidebar from '../components/ViewerSidebar';
import MiniMap from '../components/MiniMap';

const VIEW_MODES = {
  DOLLHOUSE: 'dollhouse',
  FLOORPLAN: 'floorplan',
  WALKTHROUGH: 'walkthrough',
  ORBIT: 'orbit',
};

export default function ViewerPage({ navigate, project, photos }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.DOLLHOUSE);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 8, z: 14 });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleCameraChange = useCallback((pos) => {
    setCameraPosition(pos);
  }, []);

  const handleSelectPhoto = useCallback((index) => {
    setSelectedPhoto(index);
    setShowSidebar(true);
  }, []);

  const hasPhotos = photos && photos.length > 0;

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
          <div style={styles.projectInfo}>
            <h2 style={styles.projectName}>{project?.name || '데모 사무실'}</h2>
            <span style={styles.projectMeta}>
              {hasPhotos ? `${photos.length}장 사진 기반 3D 뷰` : '데모 3D 가상 투어'}
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={styles.viewTabs}>
          {[
            { key: VIEW_MODES.DOLLHOUSE, label: '돌하우스', icon: '🏠' },
            { key: VIEW_MODES.FLOORPLAN, label: '평면도', icon: '📋' },
            { key: VIEW_MODES.WALKTHROUGH, label: '워크스루', icon: '🚶' },
            { key: VIEW_MODES.ORBIT, label: '궤도', icon: '🔄' },
          ].map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.viewTab,
                ...(viewMode === tab.key ? styles.viewTabActive : {}),
              }}
              onClick={() => setViewMode(tab.key)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.topRight}>
          <button
            style={styles.toolBtn}
            onClick={() => setShowMiniMap(!showMiniMap)}
            title="미니맵"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </button>
          <button
            style={{
              ...styles.toolBtn,
              ...(showSidebar ? { background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' } : {}),
            }}
            onClick={() => setShowSidebar(!showSidebar)}
            title="정보 패널"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          <button style={styles.shareBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            공유
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={styles.canvas}>
        <Scene3D
          viewMode={viewMode}
          onCameraChange={handleCameraChange}
          photos={photos}
          onSelectPhoto={handleSelectPhoto}
          selectedPhoto={selectedPhoto}
        />
      </div>

      {/* Photo strip at bottom (when photos exist) */}
      {hasPhotos && (
        <div style={styles.photoStrip}>
          <div style={styles.photoStripInner}>
            {photos.map((p, i) => (
              <img
                key={p.id || i}
                src={p.url}
                alt={p.name}
                style={{
                  ...styles.stripThumb,
                  ...(selectedPhoto === i ? styles.stripThumbActive : {}),
                }}
                onClick={() => handleSelectPhoto(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mini Map */}
      {showMiniMap && (
        <div style={styles.miniMapContainer}>
          <MiniMap cameraPosition={cameraPosition} viewMode={viewMode} photos={photos} />
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <ViewerSidebar
          photos={photos}
          selectedPhoto={selectedPhoto}
          onClose={() => setShowSidebar(false)}
          onSelectPhoto={handleSelectPhoto}
        />
      )}

      {/* Bottom Toolbar */}
      <ViewerToolbar viewMode={viewMode} />
    </div>
  );
}

const styles = {
  viewer: {
    position: 'fixed',
    inset: 0,
    background: '#111827',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {},
  projectName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f1f5f9',
  },
  projectMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  viewTabs: {
    display: 'flex',
    gap: 4,
    background: 'rgba(241, 245, 249, 0.05)',
    borderRadius: 10,
    padding: 3,
  },
  viewTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: '#94a3b8',
    background: 'none',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
  },
  viewTabActive: {
    color: '#f1f5f9',
    background: 'rgba(37, 99, 235, 0.3)',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  shareBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    marginLeft: 4,
    border: 'none',
    cursor: 'pointer',
  },
  canvas: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
  },
  photoStrip: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    height: 72,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(71, 85, 105, 0.3)',
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    overflow: 'hidden',
  },
  photoStripInner: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    padding: '8px 0',
  },
  stripThumb: {
    width: 56,
    height: 56,
    objectFit: 'cover',
    borderRadius: 6,
    cursor: 'pointer',
    border: '2px solid transparent',
    opacity: 0.7,
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  stripThumbActive: {
    border: '2px solid #2563eb',
    opacity: 1,
    boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
  },
  miniMapContainer: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    zIndex: 50,
  },
};
