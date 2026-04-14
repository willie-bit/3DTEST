import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Camera controller that responds to view mode changes
function CameraController({ viewMode, onCameraChange, photoCount }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 1, 0));
  const posRef = useRef(new THREE.Vector3(0, 8, 14));

  useEffect(() => {
    const r = Math.max(6, photoCount * 0.8);
    switch (viewMode) {
      case 'dollhouse':
        posRef.current.set(0, r * 0.9, r * 1.1);
        targetRef.current.set(0, 0, 0);
        break;
      case 'floorplan':
        posRef.current.set(0, r * 1.5, 0.01);
        targetRef.current.set(0, 0, 0);
        break;
      case 'walkthrough':
        posRef.current.set(0, 1.6, 0.1);
        targetRef.current.set(0, 1.6, -3);
        break;
      case 'orbit':
        posRef.current.set(r, r * 0.5, r);
        targetRef.current.set(0, 1, 0);
        break;
    }
  }, [viewMode, photoCount]);

  useFrame(() => {
    camera.position.lerp(posRef.current, 0.035);
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

// A single photo plane with texture loaded from data URL
function PhotoPlane({ url, position, rotation, index, onClick, isSelected }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const img = new Image();
    img.onload = () => {
      setAspect(img.width / img.height);
      const tex = loader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    };
    img.src = url;
  }, [url]);

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.08 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const height = 2.5;
  const width = height * aspect;

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onClick && onClick(index)}
        castShadow
      >
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial color="#334155" side={THREE.DoubleSide} />
        )}
      </mesh>
      {/* Frame border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.12, height + 0.12]} />
        <meshBasicMaterial
          color={isSelected ? '#2563eb' : hovered ? '#06b6d4' : '#475569'}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Label */}
      <Html position={[0, -height / 2 - 0.3, 0]} center>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '3px 10px',
          borderRadius: 6,
          fontSize: 11,
          color: '#94a3b8',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(71, 85, 105, 0.4)',
        }}>
          Photo {index + 1}
        </div>
      </Html>
      {/* Glow line from photo to ground */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -height / 2, 0, 0, -position[1] + 0.01, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#2563eb" transparent opacity={0.2} />
      </line>
    </group>
  );
}

// Photos arranged in a cylinder (panorama-like layout)
function PhotoCylinder({ photos, onSelectPhoto, selectedPhoto }) {
  if (!photos || photos.length === 0) return null;

  const radius = Math.max(5, photos.length * 0.7);
  const angleStep = (Math.PI * 2) / photos.length;

  return (
    <group>
      {photos.map((photo, i) => {
        const angle = i * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const rotY = -angle + Math.PI;

        return (
          <PhotoPlane
            key={photo.id || i}
            url={photo.url}
            position={[x, 1.6, z]}
            rotation={[0, rotY, 0]}
            index={i}
            onClick={onSelectPhoto}
            isSelected={selectedPhoto === i}
          />
        );
      })}
    </group>
  );
}

// Photos arranged in a flat grid (floorplan view)
function PhotoGrid({ photos, onSelectPhoto, selectedPhoto }) {
  if (!photos || photos.length === 0) return null;

  const cols = Math.ceil(Math.sqrt(photos.length));
  const spacing = 4;

  return (
    <group>
      {photos.map((photo, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - (cols - 1) / 2) * spacing;
        const z = (row - (Math.ceil(photos.length / cols) - 1) / 2) * spacing;

        return (
          <PhotoPlane
            key={photo.id || i}
            url={photo.url}
            position={[x, 0.02, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            index={i}
            onClick={onSelectPhoto}
            isSelected={selectedPhoto === i}
          />
        );
      })}
    </group>
  );
}

// Photos as a walkthrough corridor
function PhotoCorridor({ photos, onSelectPhoto, selectedPhoto }) {
  if (!photos || photos.length === 0) return null;

  const spacing = 4;

  return (
    <group>
      {photos.map((photo, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -Math.floor(i / 2) * spacing;
        const rotY = side === -1 ? Math.PI / 2 : -Math.PI / 2;

        return (
          <PhotoPlane
            key={photo.id || i}
            url={photo.url}
            position={[side * 3.5, 1.6, z]}
            rotation={[0, rotY, 0]}
            index={i}
            onClick={onSelectPhoto}
            isSelected={selectedPhoto === i}
          />
        );
      })}
    </group>
  );
}

// Connecting lines between photos (simulate SfM connections)
function PhotoConnections({ photos }) {
  if (!photos || photos.length < 2) return null;

  const radius = Math.max(5, photos.length * 0.7);
  const angleStep = (Math.PI * 2) / photos.length;

  const points = photos.map((_, i) => {
    const angle = i * angleStep;
    return new THREE.Vector3(
      Math.sin(angle) * radius,
      1.6,
      Math.cos(angle) * radius
    );
  });

  return (
    <group>
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const verts = new Float32Array([p.x, p.y, p.z, next.x, next.y, next.z]);
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={verts}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#2563eb" transparent opacity={0.4} />
          </line>
        );
      })}
      {/* Center connections */}
      {points.map((p, i) => {
        const verts = new Float32Array([p.x, p.y, p.z, 0, 0.5, 0]);
        return (
          <line key={`c-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={verts}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#06b6d4" transparent opacity={0.15} />
          </line>
        );
      })}
    </group>
  );
}

// Camera position markers
function CameraMarkers({ photos }) {
  if (!photos || photos.length === 0) return null;

  const radius = Math.max(5, photos.length * 0.7);
  const angleStep = (Math.PI * 2) / photos.length;

  return (
    <group>
      {photos.map((_, i) => {
        const angle = i * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        return (
          <group key={i} position={[x, 1.6, z]}>
            {/* Camera frustum visualization */}
            <mesh rotation={[0, -angle + Math.PI, 0]}>
              <coneGeometry args={[0.15, 0.3, 4]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} wireframe />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#2563eb" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Animated point cloud around the photo positions
function ScenePointCloud({ photos }) {
  const ref = useRef();
  const count = 3000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radius = Math.max(5, (photos?.length || 3) * 0.7);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 1.3;
      const h = Math.random() * 4;

      pos[i * 3] = Math.sin(angle) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.cos(angle) * r;

      // Warmer, more visible colors
      col[i * 3] = 0.3 + Math.random() * 0.4;
      col[i * 3 + 1] = 0.5 + Math.random() * 0.3;
      col[i * 3 + 2] = 0.7 + Math.random() * 0.3;
    }
    return { positions: pos, colors: col };
  }, [photos?.length]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// Ground plane with grid
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial color="#1a2030" roughness={0.9} transparent opacity={0.8} />
      </mesh>
      <gridHelper args={[40, 40, '#1e3a5f', '#162030']} position={[0, 0.01, 0]} />
    </group>
  );
}

// Center info hub
function CenterHub({ photoCount }) {
  return (
    <group position={[0, 0.5, 0]}>
      <mesh>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.6} />
      </mesh>
      <Html center>
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(37, 99, 235, 0.5)',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{photoCount}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>photos loaded</div>
        </div>
      </Html>
    </group>
  );
}

// Demo scene when no photos are uploaded
function DemoScene() {
  return (
    <group>
      {/* Bright ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#c4b59a" roughness={0.8} />
      </mesh>

      {/* Walls - brighter */}
      <mesh position={[0, 2, -6]} receiveShadow>
        <boxGeometry args={[14, 4, 0.2]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.7} />
      </mesh>
      <mesh position={[-7, 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4, 12]} />
        <meshStandardMaterial color="#d0bfa0" roughness={0.7} />
      </mesh>
      <mesh position={[7, 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4, 12]} />
        <meshStandardMaterial color="#d0bfa0" roughness={0.7} />
      </mesh>

      {/* Desks with color */}
      {[[-3, -3], [-1, -3], [1, -3], [3, -3]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.4, 0.06, 0.7]} />
            <meshStandardMaterial color="#c49a6c" roughness={0.5} />
          </mesh>
          {[[-0.6, 0.375, -0.3], [0.6, 0.375, -0.3], [-0.6, 0.375, 0.3], [0.6, 0.375, 0.3]].map((p, j) => (
            <mesh key={j} position={p} castShadow>
              <boxGeometry args={[0.04, 0.75, 0.04]} />
              <meshStandardMaterial color="#999" metalness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 1.15, -0.2]} castShadow>
            <boxGeometry args={[0.55, 0.35, 0.03]} />
            <meshStandardMaterial color="#222" emissive="#334466" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0.93, -0.2]} castShadow>
            <boxGeometry args={[0.04, 0.15, 0.04]} />
            <meshStandardMaterial color="#888" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Chairs */}
      {[[-3, -2], [-1, -2], [1, -2], [3, -2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.45, 0.06, 0.45]} />
            <meshStandardMaterial color="#3b6ea8" />
          </mesh>
          <mesh position={[0, 0.8, -0.2]} castShadow>
            <boxGeometry args={[0.43, 0.45, 0.04]} />
            <meshStandardMaterial color="#3b6ea8" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            <meshStandardMaterial color="#777" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Meeting Table */}
      <group position={[-4, 0, 3]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[2, 0.06, 1]} />
          <meshStandardMaterial color="#b8956a" roughness={0.4} />
        </mesh>
        {[[-0.8, 0.36, -0.35], [0.8, 0.36, -0.35], [-0.8, 0.36, 0.35], [0.8, 0.36, 0.35]].map((p, j) => (
          <mesh key={j} position={p} castShadow>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
        ))}
      </group>

      {/* Whiteboard */}
      <mesh position={[-6.85, 2.2, 3]} castShadow>
        <boxGeometry args={[0.05, 1.2, 1.8]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.2} />
      </mesh>

      {/* Bookshelf */}
      <group position={[6, 0, -4]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[1.2, 2.4, 0.35]} />
          <meshStandardMaterial color="#8B6914" roughness={0.6} />
        </mesh>
        {['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'].map((c, i) => (
          <mesh key={i} position={[-0.35 + i * 0.17, 1.8, 0.05]} castShadow>
            <boxGeometry args={[0.08, 0.25, 0.18]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>

      {/* Plants */}
      {[[6, 0, 4], [-6, 0, -4]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.4, 8]} />
            <meshStandardMaterial color="#a0522d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color="#2d8f2d" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Annotations */}
      {[
        { pos: [1, 2, 5.5], label: '입구', desc: '메인 출입구' },
        { pos: [-4, 2, 3], label: '회의실', desc: '미팅 공간' },
        { pos: [1, 2, -3], label: '작업 공간', desc: '4인 워크스테이션' },
      ].map((a, i) => (
        <group key={i} position={a.pos}>
          <Html center distanceFactor={10}>
            <div style={{
              background: 'rgba(37, 99, 235, 0.9)',
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{a.label}</div>
            </div>
          </Html>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#2563eb" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Main Scene component
export default function Scene3D({ viewMode, onCameraChange, photos, onSelectPhoto, selectedPhoto }) {
  const hasPhotos = photos && photos.length > 0;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ width: '100%', height: '100%', background: '#111827' }}
    >
      <PerspectiveCamera makeDefault position={[0, 8, 14]} fov={50} />
      <CameraController
        viewMode={viewMode}
        onCameraChange={onCameraChange}
        photoCount={hasPhotos ? photos.length : 5}
      />

      {/* Strong Lighting */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={2} castShadow color="#fff8f0" />
      <directionalLight position={[-8, 10, -5]} intensity={1} color="#e0e8ff" />
      <pointLight position={[0, 8, 0]} intensity={1.5} distance={30} color="#ffffff" />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.8]} />

      {hasPhotos ? (
        <>
          {/* Photo-based views */}
          {(viewMode === 'dollhouse' || viewMode === 'orbit') && (
            <>
              <PhotoCylinder photos={photos} onSelectPhoto={onSelectPhoto} selectedPhoto={selectedPhoto} />
              <PhotoConnections photos={photos} />
              <CameraMarkers photos={photos} />
            </>
          )}
          {viewMode === 'floorplan' && (
            <PhotoGrid photos={photos} onSelectPhoto={onSelectPhoto} selectedPhoto={selectedPhoto} />
          )}
          {viewMode === 'walkthrough' && (
            <PhotoCorridor photos={photos} onSelectPhoto={onSelectPhoto} selectedPhoto={selectedPhoto} />
          )}
          <ScenePointCloud photos={photos} />
          <CenterHub photoCount={photos.length} />
          <Ground />
        </>
      ) : (
        <>
          {/* Demo scene with proper lighting */}
          <DemoScene />

          {viewMode === 'floorplan' && (
            <Grid
              position={[0, 0.02, 0]}
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#3a5a8a"
              sectionSize={5}
              sectionColor="#4a7abf"
              fadeDistance={30}
              infiniteGrid
            />
          )}
        </>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={40}
        maxPolarAngle={viewMode === 'floorplan' ? 0.1 : Math.PI * 0.85}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
