import React, { useState } from 'react';

export default function ViewerToolbar({ viewMode }) {
  const [zoom, setZoom] = useState(100);

  return (
    <div style={styles.toolbar}>
      <div style={styles.left}>
        <div style={styles.modeIndicator}>
          <span style={styles.modeDot} />
          <span style={styles.modeText}>
            {viewMode === 'dollhouse' && '돌하우스 뷰'}
            {viewMode === 'floorplan' && '평면도 뷰'}
            {viewMode === 'walkthrough' && '워크스루 뷰'}
            {viewMode === 'orbit' && '궤도 뷰'}
          </span>
        </div>
      </div>

      <div style={styles.center}>
        <div style={styles.hint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
          <span>마우스 드래그: 회전 | 스크롤: 줌 | 우클릭: 이동</span>
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.zoomBtn} onClick={() => setZoom(z => Math.max(z - 10, 20))}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span style={styles.zoomText}>{zoom}%</span>
        <button style={styles.zoomBtn} onClick={() => setZoom(z => Math.min(z + 10, 200))}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button style={styles.fullscreenBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(71, 85, 105, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  modeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
  modeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 500,
  },
  center: {},
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#64748b',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 500,
    width: 40,
    textAlign: 'center',
  },
  fullscreenBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'rgba(241, 245, 249, 0.08)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
};
