import React, { useState, useCallback, useEffect, useRef } from 'react';
import DollhouseView from '../components/DollhouseView';
import FloorplanView from '../components/FloorplanView';

const VIEW_MODES = {
  WALKTHROUGH: 'walkthrough',
  DOLLHOUSE: 'dollhouse',
  FLOORPLAN: 'floorplan',
};

export default function ViewerPage({ navigate, project, photos }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.WALKTHROUGH);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const hasPhotos = photos && photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentIndex] : null;

  // Navigate to a photo with transition
  const goToPhoto = useCallback((index) => {
    if (index === currentIndex || transitioning || !hasPhotos) return;
    if (index < 0 || index >= photos.length) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setPanOffset({ x: 0, y: 0 });
      setZoom(1);
      setTimeout(() => setTransitioning(false), 400);
    }, 300);
  }, [currentIndex, transitioning, hasPhotos, photos]);

  const goNext = () => goToPhoto(Math.min(currentIndex + 1, (photos?.length || 1) - 1));
  const goPrev = () => goToPhoto(Math.max(currentIndex - 1, 0));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape') navigate('landing');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, photos]);

  // Mouse pan
  const handleMouseDown = (e) => {
    if (viewMode !== VIEW_MODES.WALKTHROUGH) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panOffset };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: panStart.current.x + (e.clientX - dragStart.current.x) / zoom,
      y: panStart.current.y + (e.clientY - dragStart.current.y) / zoom,
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Scroll zoom
  const handleWheel = (e) => {
    if (viewMode !== VIEW_MODES.WALKTHROUGH) return;
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
  };

  // Jump from dollhouse/floorplan to walkthrough
  const jumpToPhoto = (index) => {
    setCurrentIndex(index);
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
    setViewMode(VIEW_MODES.WALKTHROUGH);
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
              {hasPhotos ? `${currentIndex + 1} / ${photos.length}` : '데모'}
            </span>
          </div>
        </div>

        <div style={styles.viewTabs}>
          {[
            { key: VIEW_MODES.WALKTHROUGH, label: '워크스루', icon: '🚶' },
            { key: VIEW_MODES.DOLLHOUSE, label: '돌하우스', icon: '🏠' },
            { key: VIEW_MODES.FLOORPLAN, label: '평면도', icon: '📋' },
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
              ...(showInfo ? styles.toolBtnActive : {}),
            }}
            onClick={() => setShowInfo(!showInfo)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainArea}>
        {viewMode === VIEW_MODES.WALKTHROUGH && (
          /* === IMMERSIVE WALKTHROUGH VIEW === */
          <div
            style={styles.immersiveContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {hasPhotos && currentPhoto ? (
              <>
                {/* Full-screen photo */}
                <div style={{
                  ...styles.photoWrapper,
                  opacity: transitioning ? 0 : 1,
                  transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                }}>
                  <img
                    src={currentPhoto.url}
                    alt=""
                    style={styles.immersivePhoto}
                    draggable={false}
                  />
                </div>

                {/* Navigation hotspots on the floor area */}
                {!transitioning && (
                  <div style={styles.navHotspotsContainer}>
                    {/* Previous */}
                    {currentIndex > 0 && (
                      <button
                        style={{ ...styles.floorHotspot, left: '30%', bottom: '15%' }}
                        onClick={goPrev}
                      >
                        <div style={styles.hotspotRing}>
                          <div style={styles.hotspotInner} />
                        </div>
                        <span style={styles.hotspotLabel}>
                          ← {currentIndex}
                        </span>
                      </button>
                    )}
                    {/* Next */}
                    {currentIndex < photos.length - 1 && (
                      <button
                        style={{ ...styles.floorHotspot, right: '30%', bottom: '15%' }}
                        onClick={goNext}
                      >
                        <div style={styles.hotspotRing}>
                          <div style={styles.hotspotInner} />
                        </div>
                        <span style={styles.hotspotLabel}>
                          {currentIndex + 2} →
                        </span>
                      </button>
                    )}
                    {/* Center forward */}
                    {currentIndex < photos.length - 1 && (
                      <button
                        style={{ ...styles.floorHotspot, left: '50%', bottom: '25%', transform: 'translateX(-50%)' }}
                        onClick={goNext}
                      >
                        <div style={{ ...styles.hotspotRing, width: 48, height: 48 }}>
                          <div style={{ ...styles.hotspotInner, width: 20, height: 20 }} />
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Position indicator */}
                <div style={styles.positionBar}>
                  <div style={styles.positionTrack}>
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        style={{
                          ...styles.positionDot,
                          ...(i === currentIndex ? styles.positionDotActive : {}),
                        }}
                        onClick={() => goToPhoto(i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Arrow controls */}
                {currentIndex > 0 && (
                  <button style={{ ...styles.arrowBtn, left: 16 }} onClick={goPrev}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}
                {currentIndex < photos.length - 1 && (
                  <button style={{ ...styles.arrowBtn, right: 16 }} onClick={goNext}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}

                {/* Photo counter overlay */}
                <div style={styles.counterOverlay}>
                  {currentIndex + 1} / {photos.length}
                </div>
              </>
            ) : (
              /* No photos - show demo message */
              <div style={styles.noPhotos}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
                <h3 style={styles.noPhotosTitle}>사진을 업로드하세요</h3>
                <p style={styles.noPhotosDesc}>
                  공간 사진을 업로드하면 이 화면에서<br />
                  메타포트처럼 공간을 탐색할 수 있습니다
                </p>
                <button style={styles.uploadBtn} onClick={() => navigate('upload')}>
                  사진 업로드하기
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === VIEW_MODES.DOLLHOUSE && (
          <DollhouseView
            photos={photos}
            currentIndex={currentIndex}
            onSelectPhoto={jumpToPhoto}
          />
        )}

        {viewMode === VIEW_MODES.FLOORPLAN && (
          <FloorplanView
            photos={photos}
            currentIndex={currentIndex}
            onSelectPhoto={jumpToPhoto}
          />
        )}
      </div>

      {/* Photo strip */}
      {hasPhotos && (
        <div style={styles.photoStrip}>
          <div style={styles.photoStripScroll}>
            {photos.map((p, i) => (
              <img
                key={p.id || i}
                src={p.url}
                alt=""
                style={{
                  ...styles.stripThumb,
                  ...(i === currentIndex ? styles.stripThumbActive : {}),
                }}
                onClick={() => viewMode === VIEW_MODES.WALKTHROUGH ? goToPhoto(i) : jumpToPhoto(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && hasPhotos && (
        <div style={styles.infoPanel}>
          <div style={styles.infoPanelHeader}>
            <span style={styles.infoPanelTitle}>사진 정보</span>
            <button style={styles.infoPanelClose} onClick={() => setShowInfo(false)}>×</button>
          </div>
          {currentPhoto && (
            <div style={styles.infoPanelBody}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>파일명</span>
                <span style={styles.infoValue}>{currentPhoto.name}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>크기</span>
                <span style={styles.infoValue}>
                  {currentPhoto.size ? (currentPhoto.size / 1048576).toFixed(1) + ' MB' : '-'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>위치</span>
                <span style={styles.infoValue}>{currentIndex + 1} / {photos.length}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>확대</span>
                <span style={styles.infoValue}>{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          )}
          <div style={styles.infoPanelBody}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>총 사진</span>
              <span style={styles.infoValue}>{photos.length}장</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>조작</span>
              <span style={styles.infoValue}>드래그: 이동, 스크롤: 확대</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <span style={styles.hint}>
          {viewMode === VIEW_MODES.WALKTHROUGH
            ? '바닥 원을 클릭하여 이동 | 드래그: 시점 이동 | 스크롤: 확대/축소 | ←→: 이전/다음'
            : '사진 위치를 클릭하면 해당 시점으로 이동합니다'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  viewer: {
    position: 'fixed', inset: 0, background: '#000', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  // Top Bar
  topBar: {
    height: 52, flexShrink: 0,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 100,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(255,255,255,0.08)', color: '#aaa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
  },
  projectName: { fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 },
  projectMeta: { fontSize: 11, color: '#666' },
  viewTabs: {
    display: 'flex', gap: 2,
    background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2,
  },
  viewTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
    color: '#888', background: 'none', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewTabActive: {
    color: '#fff', background: 'rgba(37, 99, 235, 0.4)',
  },
  topRight: { display: 'flex', gap: 6 },
  toolBtn: {
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(255,255,255,0.08)', color: '#aaa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
  },
  toolBtnActive: { background: 'rgba(37,99,235,0.3)', color: '#60a5fa' },

  // Main area
  mainArea: {
    flex: 1, position: 'relative', overflow: 'hidden',
  },

  // Immersive walkthrough
  immersiveContainer: {
    width: '100%', height: '100%', position: 'relative',
    background: '#000', cursor: 'grab', overflow: 'hidden',
    userSelect: 'none',
  },
  photoWrapper: {
    width: '100%', height: '100%', position: 'absolute', inset: 0,
    transition: 'opacity 0.3s ease, transform 0.1s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  immersivePhoto: {
    width: '100%', height: '100%', objectFit: 'cover',
    pointerEvents: 'none',
  },

  // Floor navigation hotspots
  navHotspotsContainer: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
  },
  floorHotspot: {
    position: 'absolute', pointerEvents: 'auto',
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'transform 0.2s',
  },
  hotspotRing: {
    width: 40, height: 40, borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 0 20px rgba(255,255,255,0.2)',
    animation: 'pulse 2s infinite',
  },
  hotspotInner: {
    width: 14, height: 14, borderRadius: '50%',
    background: 'rgba(255,255,255,0.8)',
  },
  hotspotLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },

  // Position dots
  positionBar: {
    position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
    zIndex: 20,
  },
  positionTrack: {
    display: 'flex', gap: 4, alignItems: 'center',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
    padding: '6px 12px', borderRadius: 20,
    maxWidth: '80vw', overflowX: 'auto',
  },
  positionDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', padding: 0,
  },
  positionDotActive: {
    background: '#2563eb', width: 12, height: 12,
    boxShadow: '0 0 8px rgba(37,99,235,0.6)',
  },

  // Arrow buttons
  arrowBtn: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 48, height: 48, borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 20, transition: 'all 0.2s',
  },

  // Counter
  counterOverlay: {
    position: 'absolute', top: 12, right: 12, zIndex: 20,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    padding: '4px 12px', borderRadius: 12,
    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
  },

  // No photos
  noPhotos: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 16,
  },
  noPhotosTitle: { fontSize: 20, fontWeight: 600, color: '#94a3b8' },
  noPhotosDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6 },
  uploadBtn: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white', padding: '12px 24px', borderRadius: 10,
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
    marginTop: 8,
  },

  // Photo strip
  photoStrip: {
    height: 64, flexShrink: 0,
    background: 'rgba(0,0,0,0.9)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', padding: '0 8px',
    overflow: 'hidden', zIndex: 100,
  },
  photoStripScroll: {
    display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 0',
    scrollbarWidth: 'none',
  },
  stripThumb: {
    width: 52, height: 52, objectFit: 'cover', borderRadius: 4,
    cursor: 'pointer', border: '2px solid transparent', opacity: 0.5,
    transition: 'all 0.2s', flexShrink: 0,
  },
  stripThumbActive: {
    border: '2px solid #2563eb', opacity: 1,
    boxShadow: '0 0 10px rgba(37,99,235,0.4)',
  },

  // Info panel
  infoPanel: {
    position: 'absolute', top: 60, right: 12, width: 260, zIndex: 90,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    overflow: 'hidden',
  },
  infoPanelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  infoPanelTitle: { fontSize: 13, fontWeight: 600, color: '#fff' },
  infoPanelClose: {
    background: 'none', border: 'none', color: '#666', fontSize: 18,
    cursor: 'pointer', padding: '0 4px',
  },
  infoPanelBody: { padding: '10px 14px' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', marginBottom: 6,
  },
  infoLabel: { fontSize: 12, color: '#888' },
  infoValue: {
    fontSize: 12, color: '#ddd', fontWeight: 500, maxWidth: 150,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  // Bottom bar
  bottomBar: {
    height: 32, flexShrink: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  hint: { fontSize: 11, color: '#555' },
};
