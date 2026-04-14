import React, { useState, useCallback } from 'react';
import Scene3D from '../components/Scene3D';
import ViewerToolbar from '../components/ViewerToolbar';
import ViewerSidebar from '../components/ViewerSidebar';
import MiniMap from '../components/MiniMap';
import MeasureTool from '../components/MeasureTool';

const VIEW_MODES = {
  DOLLHOUSE: 'dollhouse',
  FLOORPLAN: 'floorplan',
  WALKTHROUGH: 'walkthrough',
  ORBIT: 'orbit',
};

export default function ViewerPage({ navigate, project }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.DOLLHOUSE);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMeasure, setShowMeasure] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 5, z: 10 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [annotations, setAnnotations] = useState([
    { id: 1, x: 2, y: 1, z: 0, label: '입구', desc: '메인 출입구' },
    { id: 2, x: -3, y: 1, z: 2, label: '회의실', desc: '4인용 회의실' },
    { id: 3, x: 1, y: 1, z: -3, label: '작업 공간', desc: '개발팀 좌석' },
  ]);

  const handleCameraChange = useCallback((pos) => {
    setCameraPosition(pos);
  }, []);

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
            <span style={styles.projectMeta}>3D 가상 투어</span>
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
            style={{
              ...styles.toolBtn,
              ...(showMeasure ? styles.toolBtnActive : {}),
            }}
            onClick={() => setShowMeasure(!showMeasure)}
            title="거리 측정"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
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
            style={styles.toolBtn}
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
          annotations={annotations}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          showMeasure={showMeasure}
        />
      </div>

      {/* Mini Map */}
      {showMiniMap && (
        <div style={styles.miniMapContainer}>
          <MiniMap cameraPosition={cameraPosition} viewMode={viewMode} />
        </div>
      )}

      {/* Measure Tool Overlay */}
      {showMeasure && (
        <div style={styles.measureOverlay}>
          <MeasureTool />
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <ViewerSidebar
          annotations={annotations}
          onClose={() => setShowSidebar(false)}
          onSelectAnnotation={(a) => setSelectedPoint(a)}
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
    background: '#0a0f1a',
    overflow: 'hidden',
  },
  // Top Bar
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
    transition: 'all 0.2s',
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
    transition: 'all 0.2s',
  },
  toolBtnActive: {
    background: 'rgba(37, 99, 235, 0.2)',
    color: '#60a5fa',
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
  },
  // Canvas
  canvas: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Mini Map
  miniMapContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 50,
  },
  // Measure
  measureOverlay: {
    position: 'absolute',
    top: 70,
    left: 16,
    zIndex: 50,
  },
};
