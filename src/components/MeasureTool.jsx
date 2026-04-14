import React, { useState } from 'react';

export default function MeasureTool() {
  const [points, setPoints] = useState([
    { label: 'A', x: 2.5, y: 0, z: -3 },
    { label: 'B', x: 2.5, y: 0, z: 3 },
  ]);

  const distance = Math.sqrt(
    Math.pow(points[1].x - points[0].x, 2) +
    Math.pow(points[1].y - points[0].y, 2) +
    Math.pow(points[1].z - points[0].z, 2)
  );

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        <span style={styles.title}>거리 측정</span>
      </div>

      <div style={styles.content}>
        <div style={styles.pointRow}>
          <span style={styles.pointLabel}>
            <span style={{ ...styles.pointDot, background: '#2563eb' }} />
            지점 A
          </span>
          <span style={styles.pointCoord}>
            ({points[0].x.toFixed(1)}, {points[0].y.toFixed(1)}, {points[0].z.toFixed(1)})
          </span>
        </div>
        <div style={styles.pointRow}>
          <span style={styles.pointLabel}>
            <span style={{ ...styles.pointDot, background: '#ef4444' }} />
            지점 B
          </span>
          <span style={styles.pointCoord}>
            ({points[1].x.toFixed(1)}, {points[1].y.toFixed(1)}, {points[1].z.toFixed(1)})
          </span>
        </div>

        <div style={styles.result}>
          <span style={styles.resultLabel}>거리</span>
          <span style={styles.resultValue}>{distance.toFixed(2)} m</span>
        </div>

        <p style={styles.hint}>
          3D 공간에서 두 점을 클릭하여 거리를 측정하세요
        </p>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: 220,
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  },
  title: {
    fontSize: 12,
    fontWeight: 600,
    color: '#f1f5f9',
  },
  content: {
    padding: 12,
  },
  pointRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: 500,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
  },
  pointCoord: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  result: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#06b6d4',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 1.5,
  },
};
