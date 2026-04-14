import React, { useState, useRef, useCallback } from 'react';

export default function UploadPage({ navigate, setPhotos }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((newFiles) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setFiles(prev => [...prev, ...imageFiles]);

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          name: file.name,
          size: file.size,
          url: e.target.result,
          id: Math.random().toString(36).substr(2, 9),
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const removePhoto = (id) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
    setFiles(prev => prev.filter((_, i) => previews[i]?.id !== id));
  };

  const handleProcess = () => {
    if (previews.length < 2) return;
    setPhotos(previews);
    navigate('processing', { photos: previews });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left: Upload Area */}
        <div style={styles.mainCol}>
          <h1 style={styles.title}>공간 사진 업로드</h1>
          <p style={styles.subtitle}>
            3D 모델로 변환할 공간의 사진을 업로드하세요
          </p>

          {/* Project Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>프로젝트 이름</label>
            <input
              type="text"
              placeholder="예: 우리 사무실, 2층 회의실..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Drop Zone */}
          <div
            style={{
              ...styles.dropZone,
              ...(dragging ? styles.dropZoneActive : {}),
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div style={styles.dropIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#06b6d4' : '#475569'} strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={styles.dropText}>
              {dragging ? '여기에 놓으세요!' : '클릭하거나 사진을 드래그하세요'}
            </p>
            <p style={styles.dropHint}>
              JPG, PNG, HEIC 지원 | 최소 20장 권장
            </p>
          </div>

          {/* Photo Grid */}
          {previews.length > 0 && (
            <div style={styles.photoSection}>
              <div style={styles.photoHeader}>
                <h3 style={styles.photoCount}>
                  업로드된 사진 <span style={styles.countBadge}>{previews.length}</span>
                </h3>
                <button
                  style={styles.clearBtn}
                  onClick={() => { setFiles([]); setPreviews([]); }}
                >
                  전체 삭제
                </button>
              </div>
              <div style={styles.photoGrid}>
                {previews.map((p) => (
                  <div key={p.id} style={styles.photoCard}>
                    <img src={p.url} alt={p.name} style={styles.photoImg} />
                    <div style={styles.photoOverlay}>
                      <button
                        style={styles.removeBtn}
                        onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }}
                      >
                        &times;
                      </button>
                    </div>
                    <div style={styles.photoInfo}>
                      <span style={styles.photoName}>{p.name}</span>
                      <span style={styles.photoSize}>{formatSize(p.size)}</span>
                    </div>
                  </div>
                ))}
                {/* Add more button */}
                <div
                  style={styles.addMoreCard}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span style={styles.addMoreText}>추가</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div style={styles.sideCol}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>촬영 가이드</h3>
            <div style={styles.guideList}>
              {guidelines.map((g, i) => (
                <div key={i} style={styles.guideItem}>
                  <div style={styles.guideIcon}>{g.icon}</div>
                  <div>
                    <p style={styles.guideLabel}>{g.title}</p>
                    <p style={styles.guideDesc}>{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>업로드 상태</h3>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>사진 수</span>
              <span style={{
                ...styles.statusValue,
                color: previews.length >= 20 ? '#10b981' : previews.length >= 10 ? '#f59e0b' : '#ef4444',
              }}>
                {previews.length}장
              </span>
            </div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${Math.min((previews.length / 20) * 100, 100)}%`,
                background: previews.length >= 20 ? '#10b981' : previews.length >= 10 ? '#f59e0b' : '#ef4444',
              }} />
            </div>
            <p style={styles.statusHint}>
              {previews.length < 10 ? '최소 10장 이상의 사진이 필요합니다' :
               previews.length < 20 ? '20장 이상이면 더 좋은 결과를 얻을 수 있습니다' :
               '충분한 사진이 업로드되었습니다!'}
            </p>
          </div>

          <button
            style={{
              ...styles.processBtn,
              opacity: previews.length < 2 ? 0.5 : 1,
              pointerEvents: previews.length < 2 ? 'none' : 'auto',
            }}
            onClick={handleProcess}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            3D 변환 시작
          </button>
        </div>
      </div>
    </div>
  );
}

const guidelines = [
  {
    icon: '📸',
    title: '다양한 각도',
    desc: '한 지점에서 여러 방향으로 촬영하세요',
  },
  {
    icon: '🔄',
    title: '70% 이상 겹침',
    desc: '사진 간 영역이 충분히 겹쳐야 합니다',
  },
  {
    icon: '💡',
    title: '균일한 조명',
    desc: '플래시 사용을 피하고 자연광을 활용하세요',
  },
  {
    icon: '📏',
    title: '일정한 높이',
    desc: '가슴 높이에서 수평으로 촬영하세요',
  },
  {
    icon: '🚫',
    title: '움직이는 물체 제거',
    desc: '사람, 동물 등은 프레임에서 제외하세요',
  },
];

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
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 32,
    alignItems: 'start',
  },
  mainCol: {},
  sideCol: {
    position: 'sticky',
    top: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 8,
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(71, 85, 105, 0.4)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  dropZone: {
    border: '2px dashed rgba(71, 85, 105, 0.5)',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'rgba(30, 41, 59, 0.3)',
    marginBottom: 24,
  },
  dropZoneActive: {
    borderColor: '#06b6d4',
    background: 'rgba(6, 182, 212, 0.05)',
  },
  dropIcon: {
    marginBottom: 16,
  },
  dropText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 8,
  },
  dropHint: {
    fontSize: 13,
    color: '#64748b',
  },
  photoSection: {
    marginTop: 8,
  },
  photoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoCount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '2px 10px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
  },
  clearBtn: {
    background: 'none',
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'all 0.2s',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  },
  photoCard: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: '#1e293b',
  },
  photoImg: {
    width: '100%',
    height: 100,
    objectFit: 'cover',
    display: 'block',
  },
  photoOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  photoInfo: {
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  photoName: {
    fontSize: 11,
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  photoSize: {
    fontSize: 10,
    color: '#64748b',
  },
  addMoreCard: {
    borderRadius: 10,
    border: '2px dashed rgba(71, 85, 105, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 130,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  addMoreText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 500,
  },
  // Info Cards
  infoCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: 14,
    padding: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f1f5f9',
    marginBottom: 16,
  },
  guideList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  guideItem: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  guideIcon: {
    fontSize: 18,
    flexShrink: 0,
    marginTop: 2,
  },
  guideLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: 2,
  },
  guideDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.4,
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 600,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    background: 'rgba(71, 85, 105, 0.3)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'all 0.3s',
  },
  statusHint: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.5,
  },
  processBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    color: 'white',
    padding: '14px 24px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.3s',
  },
};
