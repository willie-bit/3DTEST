import React from 'react';

export default function ViewerSidebar({ photos, selectedPhoto, onClose, onSelectPhoto }) {
  const hasPhotos = photos && photos.length > 0;
  const selected = hasPhotos && selectedPhoto != null ? photos[selectedPhoto] : null;

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const totalSize = hasPhotos
    ? photos.reduce((sum, p) => sum + (p.size || 0), 0)
    : 0;

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {hasPhotos ? '스캔 정보' : '데모 공간 정보'}
        </h3>
        <button style={styles.closeBtn} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Selected Photo Preview */}
      {selected && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>선택된 사진</h4>
          <div style={styles.previewContainer}>
            <img src={selected.url} alt={selected.name} style={styles.previewImg} />
          </div>
          <div style={styles.photoDetailGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>파일명</span>
              <span style={styles.detailValue}>{selected.name || `Photo ${selectedPhoto + 1}`}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>크기</span>
              <span style={styles.detailValue}>{formatSize(selected.size)}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>인덱스</span>
              <span style={styles.detailValue}>{selectedPhoto + 1} / {photos.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
          {hasPhotos ? '업로드 데이터' : '공간 분석'}
        </h4>
        <div style={styles.statsGrid}>
          {hasPhotos ? (
            <>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{photos.length}</span>
                <span style={styles.statLabel}>사진 수</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{formatSize(totalSize)}</span>
                <span style={styles.statLabel}>총 크기</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{photos.length * 2}</span>
                <span style={styles.statLabel}>추정 연결점</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>360°</span>
                <span style={styles.statLabel}>커버리지</span>
              </div>
            </>
          ) : (
            <>
              <div style={styles.statCard}>
                <span style={styles.statValue}>120 m²</span>
                <span style={styles.statLabel}>총 면적</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>4 m</span>
                <span style={styles.statLabel}>천장 높이</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>3</span>
                <span style={styles.statLabel}>구역</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>4</span>
                <span style={styles.statLabel}>워크스테이션</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Photo List */}
      {hasPhotos && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>사진 목록</h4>
          <div style={styles.photoList}>
            {photos.map((p, i) => (
              <div
                key={p.id || i}
                style={{
                  ...styles.photoItem,
                  ...(selectedPhoto === i ? styles.photoItemActive : {}),
                }}
                onClick={() => onSelectPhoto(i)}
              >
                <img src={p.url} alt="" style={styles.photoThumb} />
                <div style={styles.photoItemInfo}>
                  <div style={styles.photoItemName}>{p.name || `Photo ${i + 1}`}</div>
                  <div style={styles.photoItemSize}>{formatSize(p.size)}</div>
                </div>
                <div style={{
                  ...styles.photoItemIndex,
                  color: selectedPhoto === i ? '#2563eb' : '#64748b',
                }}>
                  #{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Pipeline Info */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>처리 파이프라인</h4>
        <div style={styles.techList}>
          {[
            { step: 'SfM 정렬', tool: 'COLMAP', status: hasPhotos ? 'done' : 'demo' },
            { step: '포인트 클라우드', tool: 'OpenMVS', status: hasPhotos ? 'done' : 'demo' },
            { step: '메쉬 생성', tool: 'Poisson', status: hasPhotos ? 'done' : 'demo' },
            { step: 'AI 분석', tool: 'Detectron2', status: hasPhotos ? 'done' : 'demo' },
            { step: '렌더링', tool: 'Three.js', status: 'active' },
          ].map((item, i) => (
            <div key={i} style={styles.techRow}>
              <span style={{
                ...styles.techDot,
                background: item.status === 'active' ? '#10b981' : item.status === 'done' ? '#2563eb' : '#475569',
              }} />
              <span style={styles.techStep}>{item.step}</span>
              <span style={styles.techTool}>{item.tool}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Modes Guide */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>뷰 모드 안내</h4>
        <div style={styles.guideList}>
          <div style={styles.guideItem}>
            <span>🏠</span>
            <div>
              <div style={styles.guideName}>돌하우스</div>
              <div style={styles.guideDesc}>사진을 원형으로 배치하여 전체 공간 조감</div>
            </div>
          </div>
          <div style={styles.guideItem}>
            <span>📋</span>
            <div>
              <div style={styles.guideName}>평면도</div>
              <div style={styles.guideDesc}>사진을 그리드로 배치하여 위에서 내려다보기</div>
            </div>
          </div>
          <div style={styles.guideItem}>
            <span>🚶</span>
            <div>
              <div style={styles.guideName}>워크스루</div>
              <div style={styles.guideDesc}>복도형 배치로 공간을 걸어다니는 체험</div>
            </div>
          </div>
          <div style={styles.guideItem}>
            <span>🔄</span>
            <div>
              <div style={styles.guideName}>궤도</div>
              <div style={styles.guideDesc}>자유롭게 회전하며 모든 각도에서 관찰</div>
            </div>
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
    width: 330,
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
  title: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 6,
    background: 'rgba(241, 245, 249, 0.08)', color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
  },
  section: {
    padding: '16px 18px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
  },
  sectionTitle: {
    fontSize: 11, fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
  },
  previewContainer: {
    borderRadius: 10, overflow: 'hidden', marginBottom: 12,
    border: '1px solid rgba(71, 85, 105, 0.3)',
  },
  previewImg: {
    width: '100%', height: 180, objectFit: 'cover', display: 'block',
  },
  photoDetailGrid: { display: 'flex', flexDirection: 'column', gap: 6 },
  detailRow: { display: 'flex', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, color: '#94a3b8' },
  detailValue: {
    fontSize: 12, color: '#f1f5f9', fontWeight: 500,
    maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10, padding: 12,
    display: 'flex', flexDirection: 'column',
  },
  statValue: { fontSize: 16, fontWeight: 700, color: '#f1f5f9' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  photoList: {
    display: 'flex', flexDirection: 'column', gap: 6,
    maxHeight: 250, overflowY: 'auto',
  },
  photoItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 8, borderRadius: 8,
    background: 'rgba(30, 41, 59, 0.3)', cursor: 'pointer',
    transition: 'all 0.2s', border: '1px solid transparent',
  },
  photoItemActive: {
    background: 'rgba(37, 99, 235, 0.15)',
    border: '1px solid rgba(37, 99, 235, 0.4)',
  },
  photoThumb: {
    width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0,
  },
  photoItemInfo: { flex: 1, minWidth: 0 },
  photoItemName: {
    fontSize: 12, fontWeight: 500, color: '#e2e8f0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  photoItemSize: { fontSize: 11, color: '#64748b' },
  photoItemIndex: { fontSize: 11, fontWeight: 600, flexShrink: 0 },
  techList: { display: 'flex', flexDirection: 'column', gap: 10 },
  techRow: { display: 'flex', alignItems: 'center', gap: 8 },
  techDot: {
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
  },
  techStep: { fontSize: 12, color: '#e2e8f0', fontWeight: 500, flex: 1 },
  techTool: {
    fontSize: 11, color: '#2563eb', fontWeight: 600,
    background: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: 4,
  },
  guideList: { display: 'flex', flexDirection: 'column', gap: 10 },
  guideItem: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  guideName: { fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 },
  guideDesc: { fontSize: 11, color: '#64748b', lineHeight: 1.4 },
};
