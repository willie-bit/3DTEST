import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

// Camera controller that responds to view mode changes
function CameraController({ viewMode, onCameraChange }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3());

  useEffect(() => {
    switch (viewMode) {
      case 'dollhouse':
        posRef.current.set(8, 10, 8);
        targetRef.current.set(0, 0, 0);
        break;
      case 'floorplan':
        posRef.current.set(0, 15, 0.01);
        targetRef.current.set(0, 0, 0);
        break;
      case 'walkthrough':
        posRef.current.set(0, 1.6, 5);
        targetRef.current.set(0, 1.6, 0);
        break;
      case 'orbit':
        posRef.current.set(10, 6, 10);
        targetRef.current.set(0, 1, 0);
        break;
    }
  }, [viewMode]);

  useFrame(() => {
    camera.position.lerp(posRef.current, 0.03);
    if (onCameraChange) {
      onCameraChange({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
    }
  });

  return null;
}

// Animated point cloud effect
function PointCloud() {
  const ref = useRef();
  const count = 2000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Office-like distribution
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Color variations (blue-cyan palette)
      col[i * 3] = 0.15 + Math.random() * 0.2;
      col[i * 3 + 1] = 0.4 + Math.random() * 0.3;
      col[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Office Floor
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial color="#2a2f3a" roughness={0.8} />
    </mesh>
  );
}

// Office Walls
function Walls() {
  const wallMaterial = <meshStandardMaterial color="#3a3f4a" roughness={0.9} />;
  return (
    <group>
      {/* Back Wall */}
      <mesh position={[0, 1.75, -5]} castShadow receiveShadow>
        <boxGeometry args={[12, 3.5, 0.15]} />
        {wallMaterial}
      </mesh>
      {/* Left Wall */}
      <mesh position={[-6, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 3.5, 10]} />
        {wallMaterial}
      </mesh>
      {/* Right Wall */}
      <mesh position={[6, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 3.5, 10]} />
        {wallMaterial}
      </mesh>
      {/* Front Wall with door gap */}
      <mesh position={[-3.5, 1.75, 5]} castShadow receiveShadow>
        <boxGeometry args={[5, 3.5, 0.15]} />
        {wallMaterial}
      </mesh>
      <mesh position={[4, 1.75, 5]} castShadow receiveShadow>
        <boxGeometry args={[4, 3.5, 0.15]} />
        {wallMaterial}
      </mesh>
      {/* Door frame top */}
      <mesh position={[1.25, 3.2, 5]} castShadow>
        <boxGeometry args={[2.5, 0.3, 0.15]} />
        {wallMaterial}
      </mesh>
    </group>
  );
}

// Office Desk
function Desk({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk top */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.7]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.65, 0.375, -0.3], [0.65, 0.375, -0.3], [-0.65, 0.375, 0.3], [0.65, 0.375, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.04, 0.75, 0.04]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.35, 0.03]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1a3a5c" emissiveIntensity={0.3} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.88, -0.2]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.78, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// Office Chair
function Chair({ position }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.45, 0.06, 0.45]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.8, -0.2]} castShadow>
        <boxGeometry args={[0.43, 0.5, 0.04]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
    </group>
  );
}

// Bookshelf
function Bookshelf({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 2, 0.35]} />
        <meshStandardMaterial color="#5C4033" roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {[0.4, 0, -0.4, -0.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.15, 0.03, 0.32]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
      ))}
      {/* Books */}
      {[
        { pos: [-0.3, 0.65, 0], color: '#e74c3c', size: [0.08, 0.25, 0.2] },
        { pos: [-0.15, 0.63, 0], color: '#3498db', size: [0.06, 0.22, 0.2] },
        { pos: [0, 0.64, 0], color: '#2ecc71', size: [0.07, 0.24, 0.2] },
        { pos: [0.15, 0.62, 0], color: '#f39c12', size: [0.08, 0.2, 0.2] },
        { pos: [0.3, 0.65, 0], color: '#9b59b6', size: [0.06, 0.26, 0.2] },
        { pos: [-0.2, 0.22, 0], color: '#1abc9c', size: [0.07, 0.2, 0.2] },
        { pos: [0.1, 0.24, 0], color: '#e67e22', size: [0.09, 0.24, 0.2] },
      ].map((book, i) => (
        <mesh key={i} position={book.pos} castShadow>
          <boxGeometry args={book.size} />
          <meshStandardMaterial color={book.color} />
        </mesh>
      ))}
    </group>
  );
}

// Meeting Table
function MeetingTable({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[2.2, 0.06, 1]} />
        <meshStandardMaterial color="#7B6841" roughness={0.5} />
      </mesh>
      {[[-0.9, 0.36, -0.35], [0.9, 0.36, -0.35], [-0.9, 0.36, 0.35], [0.9, 0.36, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#5C5040" />
        </mesh>
      ))}
    </group>
  );
}

// Whiteboard
function Whiteboard({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2, 1.2, 0.05]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[2.1, 1.3, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
    </group>
  );
}

// Plant
function Plant({ position }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Leaves */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.1,
            0.4 + Math.random() * 0.2,
            Math.sin((angle * Math.PI) / 180) * 0.1,
          ]}
          rotation={[0.3, (angle * Math.PI) / 180, 0.2]}
          castShadow
        >
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#228B22' : '#32CD32'} />
        </mesh>
      ))}
    </group>
  );
}

// Ceiling light
function CeilingLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight intensity={2} distance={8} color="#fff5e6" castShadow position={[0, -0.1, 0]} />
    </group>
  );
}

// 3D Annotation tag
function AnnotationTag({ annotation, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[annotation.x, annotation.y, annotation.z]}>
      <Html center distanceFactor={10}>
        <div
          onClick={() => onClick && onClick(annotation)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'rgba(37, 99, 235, 0.95)' : 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(37, 99, 235, 0.5)',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
            {annotation.label}
          </div>
          {hovered && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              {annotation.desc}
            </div>
          )}
        </div>
      </Html>
      {/* Marker dot */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Main 3D Scene
export default function Scene3D({ viewMode, onCameraChange, annotations, selectedPoint, onSelectPoint, showMeasure }) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', background: '#0a0f1a' }}
    >
      <PerspectiveCamera makeDefault position={[8, 10, 8]} fov={50} />
      <CameraController viewMode={viewMode} onCameraChange={onCameraChange} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Ceiling Lights */}
      <CeilingLight position={[-2, 3.4, -1]} />
      <CeilingLight position={[2, 3.4, -1]} />
      <CeilingLight position={[0, 3.4, 2]} />

      {/* Office Structure */}
      <Floor />
      <Walls />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#2d3040" side={THREE.DoubleSide} />
      </mesh>

      {/* Desks - Work Area */}
      <Desk position={[-3, 0, -3]} />
      <Desk position={[-1, 0, -3]} />
      <Desk position={[1, 0, -3]} />
      <Desk position={[3, 0, -3]} />
      <Desk position={[-3, 0, -1]} rotation={Math.PI} />
      <Desk position={[-1, 0, -1]} rotation={Math.PI} />

      {/* Chairs */}
      <Chair position={[-3, 0, -2.2]} />
      <Chair position={[-1, 0, -2.2]} />
      <Chair position={[1, 0, -2.2]} />
      <Chair position={[3, 0, -2.2]} />
      <Chair position={[-3, 0, -1.8]} />
      <Chair position={[-1, 0, -1.8]} />

      {/* Meeting Area */}
      <MeetingTable position={[-3.5, 0, 2.5]} />
      <Chair position={[-4.5, 0, 2.5]} />
      <Chair position={[-2.5, 0, 2.5]} />
      <Chair position={[-3.5, 0, 1.8]} />
      <Chair position={[-3.5, 0, 3.2]} />

      {/* Whiteboard */}
      <Whiteboard position={[-5.9, 2, 2.5]} />

      {/* Bookshelf */}
      <Bookshelf position={[5, 1, -3]} />

      {/* Plants */}
      <Plant position={[5, 0, 4]} />
      <Plant position={[-5.5, 0, -4]} />

      {/* Point Cloud Effect */}
      <PointCloud />

      {/* Annotations */}
      {annotations && annotations.map(a => (
        <AnnotationTag
          key={a.id}
          annotation={a}
          onClick={onSelectPoint}
        />
      ))}

      {/* Grid (visible in certain modes) */}
      {viewMode === 'floorplan' && (
        <Grid
          position={[0, 0.01, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1e3a5f"
          sectionSize={5}
          sectionColor="#2563eb"
          fadeDistance={30}
          infiniteGrid
        />
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={viewMode === 'floorplan' ? 20 : 25}
        maxPolarAngle={viewMode === 'floorplan' ? 0.1 : Math.PI * 0.85}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
