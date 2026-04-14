import React, { useRef, useEffect } from 'react';

export default function MiniMap({ cameraPosition, viewMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 160, h = 120;
    canvas.width = w;
    canvas.height = h;

    // Clear
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, w, h);

    // Draw room outline
    const roomW = 100, roomH = 80;
    const ox = (w - roomW) / 2;
    const oy = (h - roomH) / 2;

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, roomW, roomH);

    // Grid
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.15)';
    ctx.lineWidth = 0.5;
    for (let x = ox; x <= ox + roomW; x += 10) {
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + roomH); ctx.stroke();
    }
    for (let y = oy; y <= oy + roomH; y += 10) {
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + roomW, y); ctx.stroke();
    }

    // Room features
    // Desks
    ctx.fillStyle = 'rgba(139, 105, 20, 0.5)';
    [[20, 15], [32, 15], [44, 15], [56, 15], [20, 30], [32, 30]].forEach(([dx, dy]) => {
      ctx.fillRect(ox + dx, oy + dy, 10, 5);
    });

    // Meeting table
    ctx.fillStyle = 'rgba(123, 104, 65, 0.5)';
    ctx.fillRect(ox + 10, oy + 55, 18, 8);

    // Door
    ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
    ctx.fillRect(ox + 42, oy + roomH - 2, 16, 4);

    // Camera position
    const camX = ox + roomW / 2 + (cameraPosition.x / 12) * roomW * 0.8;
    const camY = oy + roomH / 2 - (cameraPosition.z / 10) * roomH * 0.8;

    // Camera direction
    ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
    ctx.beginPath();
    ctx.moveTo(camX, camY);
    ctx.arc(camX, camY, 15, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.fill();

    // Camera dot
    ctx.fillStyle = '#2563eb';
    ctx.shadowColor = '#2563eb';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(camX, camY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Annotation dots
    ctx.fillStyle = '#06b6d4';
    [
      [2, 1, 0],
      [-3, 1, 2],
      [1, 1, -3],
    ].forEach(([ax, _, az]) => {
      const px = ox + roomW / 2 + (ax / 12) * roomW * 0.8;
      const py = oy + roomH / 2 - (az / 10) * roomH * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [cameraPosition, viewMode]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>미니맵</span>
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
  },
  title: {
    fontSize: 10,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  canvas: {
    display: 'block',
    width: 160,
    height: 120,
  },
};
