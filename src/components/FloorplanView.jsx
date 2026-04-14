import React, { useRef, useEffect, useState } from 'react';

export default function FloorplanView({ photos, currentIndex, onSelectPhoto }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(-1);
  const [size, setSize] = useState({ w: 800, h: 600 });

  const hasPhotos = photos && photos.length > 0;
  const photoCount = hasPhotos ? photos.length : 0;

  // Compute photo positions
  const getPositions = () => {
    if (!hasPhotos) return [];
    const cols = Math.ceil(Math.sqrt(photoCount));
    const rows = Math.ceil(photoCount / cols);
    const spacing = Math.min(size.w / (cols + 2), size.h / (rows + 2), 100);
    const offsetX = (size.w - (cols - 1) * spacing) / 2;
    const offsetY = (size.h - (rows - 1) * spacing) / 2;

    return photos.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return {
        x: offsetX + col * spacing,
        y: offsetY + row * spacing,
      };
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = size.w * 2;
    canvas.height = size.h * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid
    ctx.strokeStyle = 'rgba(30, 45, 69, 0.5)';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < size.w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size.h); ctx.stroke();
    }
    for (let y = 0; y < size.h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size.w, y); ctx.stroke();
    }

    if (!hasPhotos) {
      ctx.fillStyle = '#444';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('사진을 업로드하면 평면도가 표시됩니다', size.w / 2, size.h / 2);
      return;
    }

    const positions = getPositions();

    // Draw connections
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 1;
    positions.forEach((p, i) => {
      if (i < positions.length - 1) {
        const next = positions[i + 1];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    });

    // Draw photo markers
    positions.forEach((p, i) => {
      const isCurrent = i === currentIndex;
      const isHover = i === hovered;

      // Outer glow for current
      if (isCurrent) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 30);
        glow.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
        glow.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Camera view cone
      const coneAngle = Math.PI * 0.35;
      const coneLen = 25;
      const dir = i < positions.length - 1
        ? Math.atan2(positions[i + 1].y - p.y, positions[i + 1].x - p.x)
        : i > 0
        ? Math.atan2(p.y - positions[i - 1].y, p.x - positions[i - 1].x)
        : 0;

      ctx.fillStyle = isCurrent
        ? 'rgba(37, 99, 235, 0.15)'
        : 'rgba(100, 116, 139, 0.08)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, coneLen, dir - coneAngle, dir + coneAngle);
      ctx.closePath();
      ctx.fill();

      // Marker circle
      const radius = isCurrent ? 10 : isHover ? 8 : 6;
      ctx.fillStyle = isCurrent ? '#2563eb' : isHover ? '#3b82f6' : '#475569';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // White inner dot
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isCurrent ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();

      // Index label
      ctx.fillStyle = isCurrent ? '#fff' : '#888';
      ctx.font = `${isCurrent ? '600' : '500'} ${isCurrent ? 11 : 10}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, p.x, p.y - radius - 6);
    });

    // Scale bar
    const scaleBarY = size.h - 30;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, scaleBarY);
    ctx.lineTo(120, scaleBarY);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, scaleBarY - 4); ctx.lineTo(20, scaleBarY + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(120, scaleBarY - 4); ctx.lineTo(120, scaleBarY + 4); ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('~ 5m', 70, scaleBarY - 8);

  }, [photos, currentIndex, hovered, size, hasPhotos]);

  // Handle click on canvas
  const handleClick = (e) => {
    if (!hasPhotos) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const positions = getPositions();

    for (let i = 0; i < positions.length; i++) {
      const dx = x - positions[i].x;
      const dy = y - positions[i].y;
      if (dx * dx + dy * dy < 400) {
        onSelectPhoto(i);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!hasPhotos) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const positions = getPositions();

    let found = -1;
    for (let i = 0; i < positions.length; i++) {
      const dx = x - positions[i].x;
      const dy = y - positions[i].y;
      if (dx * dx + dy * dy < 400) { found = i; break; }
    }
    setHovered(found);
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(-1)}
      />
      {/* Title overlay */}
      <div style={styles.titleOverlay}>
        <span style={styles.titleText}>평면도</span>
        {hasPhotos && <span style={styles.titleCount}>{photoCount}개 촬영 지점</span>}
      </div>
      {/* Current photo preview */}
      {hasPhotos && photos[currentIndex] && (
        <div style={styles.previewBox}>
          <img src={photos[currentIndex].url} alt="" style={styles.previewImg} />
          <div style={styles.previewLabel}>
            현재 위치: {currentIndex + 1}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%', position: 'relative', background: '#0d1117',
  },
  canvas: {
    width: '100%', height: '100%', cursor: 'pointer',
  },
  titleOverlay: {
    position: 'absolute', top: 12, left: 12,
    display: 'flex', gap: 12, alignItems: 'center',
  },
  titleText: {
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    padding: '4px 12px', borderRadius: 6,
    fontSize: 12, fontWeight: 600, color: '#fff',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  titleCount: {
    fontSize: 11, color: '#666',
  },
  previewBox: {
    position: 'absolute', bottom: 12, right: 12,
    width: 180, borderRadius: 8, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.8)',
  },
  previewImg: {
    width: '100%', height: 100, objectFit: 'cover', display: 'block',
  },
  previewLabel: {
    padding: '6px 10px', fontSize: 11, color: '#aaa', fontWeight: 500,
  },
};
