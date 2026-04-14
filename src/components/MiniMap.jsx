import React, { useRef, useEffect } from 'react';

export default function MiniMap({ cameraPosition, viewMode, photos }) {
  const canvasRef = useRef(null);
  const hasPhotos = photos && photos.length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 160, h = 120;
    canvas.width = w;
    canvas.height = h;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    if (hasPhotos) {
      // Draw photo positions in circular layout
      const radius = 35;
      const angleStep = (Math.PI * 2) / photos.length;

      // Connection lines
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.lineWidth = 0.5;
      photos.forEach((_, i) => {
        const a1 = i * angleStep;
        const a2 = ((i + 1) % photos.length) * angleStep;
        ctx.beginPath();
        ctx.moveTo(cx + Math.sin(a1) * radius, cy + Math.cos(a1) * radius);
        ctx.lineTo(cx + Math.sin(a2) * radius, cy + Math.cos(a2) * radius);
        ctx.stroke();
      });

      // Center lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
      photos.forEach((_, i) => {
        const a = i * angleStep;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(a) * radius, cy + Math.cos(a) * radius);
        ctx.stroke();
      });

      // Photo dots
      ctx.fillStyle = '#06b6d4';
      photos.forEach((_, i) => {
        const a = i * angleStep;
        const px = cx + Math.sin(a) * radius;
        const py = cy + Math.cos(a) * radius;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center marker
      ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw demo room outline
      const rw = 90, rh = 70;
      const ox = (w - rw) / 2;
      const oy = (h - rh) / 2;

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, rw, rh);

      // Grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = ox; x <= ox + rw; x += 10) {
        ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + rh); ctx.stroke();
      }
      for (let y = oy; y <= oy + rh; y += 10) {
        ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + rw, y); ctx.stroke();
      }

      // Desk areas
      ctx.fillStyle = 'rgba(196, 154, 108, 0.4)';
      [[22, 15], [33, 15], [44, 15], [55, 15]].forEach(([dx, dy]) => {
        ctx.fillRect(ox + dx, oy + dy, 9, 5);
      });

      // Meeting table
      ctx.fillRect(ox + 10, oy + 48, 16, 7);
    }

    // Camera position
    const scale = hasPhotos ? 3 : 5;
    const camX = cx + (cameraPosition.x / (hasPhotos ? 12 : 14)) * 50;
    const camY = cy - (cameraPosition.z / (hasPhotos ? 12 : 12)) * 40;

    // Camera FOV cone
    ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
    ctx.beginPath();
    ctx.moveTo(camX, camY);
    ctx.arc(camX, camY, 14, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.fill();

    // Camera dot
    ctx.fillStyle = '#2563eb';
    ctx.shadowColor = '#2563eb';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(camX, camY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [cameraPosition, viewMode, photos, hasPhotos]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>미니맵</span>
        {hasPhotos && (
          <span style={styles.count}>{photos.length} photos</span>
        )}
      </div>
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

const styles = {
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  header: {
    padding: '6px 10px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 10, fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  count: {
    fontSize: 9, color: '#2563eb', fontWeight: 600,
  },
  canvas: {
    display: 'block', width: 160, height: 120,
  },
};
