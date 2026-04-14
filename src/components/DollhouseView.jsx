import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

// A camera position marker in the 3D scene
function CameraMarker({ position, index, isCurrent, onClick, photoUrl }) {
  const groupRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (groupRef.current && isCurrent) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -position[1] + 0.02, 0]}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshBasicMaterial color={isCurrent ? '#2563eb' : '#475569'} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical line to marker */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -position[1] + 0.02, 0, 0, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={isCurrent ? '#2563eb' : '#334155'} transparent opacity={0.4} />
      </line>

      {/* Marker sphere */}
      <mesh>
        <sphereGeometry args={[isCurrent ? 0.18 : 0.12, 16, 16]} />
        <meshBasicMaterial color={isCurrent ? '#2563eb' : '#64748b'} />
      </mesh>

      {/* Animated ring for current */}
      {isCurrent && (
        <mesh ref={ringRef}>
          <torusGeometry args={[0.3, 0.02, 8, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Camera frustum */}
      <mesh rotation={[0, (index / 10) * Math.PI * 2, 0]}>
        <coneGeometry args={[0.12, 0.25, 4]} />
        <meshBasicMaterial color={isCurrent ? '#06b6d4' : '#475569'} wireframe transparent opacity={0.5} />
      </mesh>

      {/* Clickable label */}
      <Html center distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div
          onClick={() => onClick(index)}
          style={{
            background: isCurrent ? 'rgba(37,99,235,0.9)' : 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${isCurrent ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8,
            padding: '4px 10px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>
            {index + 1}
          </div>
        </div>
      </Html>

      {/* Small photo preview for current */}
      {isCurrent && photoUrl && (
        <Html position={[0, 0.5, 0]} center distanceFactor={6}>
          <div style={{
            width: 120, height: 80, borderRadius: 6, overflow: 'hidden',
            border: '2px solid rgba(37,99,235,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection paths between camera positions
function CameraPaths({ positions }) {
  if (positions.length < 2) return null;

  return (
    <group>
      {positions.map((pos, i) => {
        if (i === positions.length - 1) return null;
        const next = positions[i + 1];
        const verts = new Float32Array([
          pos[0], 0.03, pos[2],
          next[0], 0.03, next[2],
        ]);
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={2} array={verts} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#2563eb" transparent opacity={0.3} />
          </line>
        );
      })}
    </group>
  );
}

// Simple room outline
function RoomOutline({ photoCount }) {
  const size = Math.max(6, photoCount * 0.4);
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2.5, size * 2]} />
        <meshStandardMaterial color="#1a1f2e" roughness={0.9} />
      </mesh>

      {/* Grid */}
      <gridHelper
        args={[size * 2.5, Math.round(size * 2.5), '#1e2d45', '#141a28']}
        position={[0, 0.01, 0]}
      />

      {/* Subtle walls */}
      {[
        { pos: [0, 0.8, -size], size: [size * 2.5, 1.6, 0.05] },
        { pos: [-size * 1.25, 0.8, 0], size: [0.05, 1.6, size * 2] },
        { pos: [size * 1.25, 0.8, 0], size: [0.05, 1.6, size * 2] },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color="#1e2940" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Point cloud decoration
function PointCloudDecor({ count = 1500, spread = 8 }) {
  const ref = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread * 2;
      pos[i * 3 + 1] = Math.random() * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 1.5;
      col[i * 3] = 0.15 + Math.random() * 0.15;
      col[i * 3 + 1] = 0.25 + Math.random() * 0.2;
      col[i * 3 + 2] = 0.5 + Math.random() * 0.3;
    }
    return { positions: pos, colors: col };
  }, [count, spread]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function DollhouseView({ photos, currentIndex, onSelectPhoto }) {
  const hasPhotos = photos && photos.length > 0;
  const photoCount = hasPhotos ? photos.length : 0;

  // Lay out photos in a path (serpentine walk through space)
  const positions = useMemo(() => {
    if (!hasPhotos) return [];
    const cols = Math.ceil(Math.sqrt(photoCount));
    return photos.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = (col - (cols - 1) / 2) * 1.8;
      const z = (row - (Math.ceil(photoCount / cols) - 1) / 2) * 1.8;
      return [x, 0.4, z];
    });
  }, [photos, hasPhotos, photoCount]);

  const camDistance = Math.max(8, photoCount * 0.3);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', background: '#0d1117' }}
      >
        <PerspectiveCamera makeDefault position={[camDistance * 0.8, camDistance * 0.7, camDistance * 0.8]} fov={45} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <hemisphereLight args={['#334155', '#0f172a', 0.5]} />

        <RoomOutline photoCount={photoCount} />
        <PointCloudDecor spread={Math.max(6, photoCount * 0.3)} />

        {hasPhotos && (
          <>
            <CameraPaths positions={positions} />
            {photos.map((photo, i) => (
              <CameraMarker
                key={photo.id || i}
                position={positions[i]}
                index={i}
                isCurrent={i === currentIndex}
                onClick={onSelectPhoto}
                photoUrl={photo.url}
              />
            ))}
          </>
        )}

        {!hasPhotos && (
          <Html center>
            <div style={{
              background: 'rgba(0,0,0,0.8)', padding: '20px 30px',
              borderRadius: 12, textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p style={{ color: '#aaa', fontSize: 14 }}>사진을 업로드하면 여기에</p>
              <p style={{ color: '#aaa', fontSize: 14 }}>촬영 위치가 표시됩니다</p>
            </div>
          </Html>
        )}

        <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI * 0.45} target={[0, 0, 0]} />
      </Canvas>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#2563eb' }} />
          <span>현재 위치</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#64748b' }} />
          <span>촬영 위치</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 16, height: 2, background: '#2563eb', opacity: 0.5, borderRadius: 1 }} />
          <span>이동 경로</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  legend: {
    position: 'absolute', bottom: 16, left: 16,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
    padding: '8px 14px', borderRadius: 8,
    display: 'flex', gap: 16, alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#888',
  },
  legendDot: {
    width: 8, height: 8, borderRadius: '50%',
  },
};
