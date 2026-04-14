import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Load a texture from a data URL
function usePhotoTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) { setTexture(null); return; }
    const tex = new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(t);
    });
    return () => { if (tex) tex.dispose(); };
  }, [url]);

  return texture;
}

// A single wall panel textured with a photo
function PhotoWall({ url, position, rotation, size }) {
  const texture = usePhotoTexture(url);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      {texture ? (
        <meshBasicMaterial map={texture} side={THREE.FrontSide} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#333" side={THREE.FrontSide} />
      )}
    </mesh>
  );
}

// The room that wraps photos around the viewer
function PhotoRoom({ photos, roomSize }) {
  const [w, h, d] = roomSize; // width, height, depth

  // Assign photos to wall positions
  // With N photos, distribute them across walls intelligently
  const wallAssignments = useMemo(() => {
    if (!photos || photos.length === 0) return [];

    const assignments = [];
    const n = photos.length;

    if (n === 1) {
      // Single photo: front wall only
      assignments.push({ url: photos[0].url, face: 'front' });
    } else if (n === 2) {
      assignments.push({ url: photos[0].url, face: 'front' });
      assignments.push({ url: photos[1].url, face: 'right' });
    } else if (n === 3) {
      assignments.push({ url: photos[0].url, face: 'front' });
      assignments.push({ url: photos[1].url, face: 'right' });
      assignments.push({ url: photos[2].url, face: 'left' });
    } else if (n === 4) {
      assignments.push({ url: photos[0].url, face: 'front' });
      assignments.push({ url: photos[1].url, face: 'right' });
      assignments.push({ url: photos[2].url, face: 'back' });
      assignments.push({ url: photos[3].url, face: 'left' });
    } else {
      // 5+ photos: 4 main walls, extras become panels along walls
      // Front wall
      const frontCount = Math.ceil(n * 0.3);
      const rightCount = Math.ceil(n * 0.25);
      const backCount = Math.ceil(n * 0.2);
      const leftCount = n - frontCount - rightCount - backCount;

      let idx = 0;

      // Front: multiple panels side by side
      for (let i = 0; i < frontCount && idx < n; i++) {
        assignments.push({ url: photos[idx++].url, face: 'front', panel: i, totalPanels: frontCount });
      }
      for (let i = 0; i < rightCount && idx < n; i++) {
        assignments.push({ url: photos[idx++].url, face: 'right', panel: i, totalPanels: rightCount });
      }
      for (let i = 0; i < backCount && idx < n; i++) {
        assignments.push({ url: photos[idx++].url, face: 'back', panel: i, totalPanels: backCount });
      }
      for (let i = 0; i < leftCount && idx < n; i++) {
        assignments.push({ url: photos[idx++].url, face: 'left', panel: i, totalPanels: leftCount });
      }
    }

    return assignments;
  }, [photos]);

  // Convert assignments to positioned walls
  const walls = useMemo(() => {
    const result = [];

    wallAssignments.forEach((a, i) => {
      const panel = a.panel || 0;
      const totalPanels = a.totalPanels || 1;
      const panelW = (a.face === 'front' || a.face === 'back') ? w / totalPanels : d / totalPanels;
      const panelH = h;

      let x = 0, y = h / 2, z = 0;
      let ry = 0;

      switch (a.face) {
        case 'front': {
          const startX = -w / 2 + panelW / 2;
          x = startX + panel * panelW;
          z = -d / 2;
          ry = 0;
          break;
        }
        case 'back': {
          const startX = w / 2 - panelW / 2;
          x = startX - panel * panelW;
          z = d / 2;
          ry = Math.PI;
          break;
        }
        case 'right': {
          const startZ = -d / 2 + panelW / 2;
          z = startZ + panel * panelW;
          x = w / 2;
          ry = -Math.PI / 2;
          break;
        }
        case 'left': {
          const startZ = d / 2 - panelW / 2;
          z = startZ - panel * panelW;
          x = -w / 2;
          ry = Math.PI / 2;
          break;
        }
      }

      result.push({
        key: i,
        url: a.url,
        position: [x, y, z],
        rotation: [0, ry, 0],
        size: [panelW - 0.02, panelH, 1],
      });
    });

    return result;
  }, [wallAssignments, w, h, d]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.8} />
      </mesh>

      {/* Photo walls */}
      {walls.map((wall) => (
        <PhotoWall
          key={wall.key}
          url={wall.url}
          position={wall.position}
          rotation={wall.rotation}
          size={wall.size}
        />
      ))}

      {/* Fill empty wall areas with neutral color where no photos */}
      {/* Back wall fill (if not fully covered) */}
      <mesh position={[0, h / 2, d / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 + 0.01]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
      </mesh>
      <mesh position={[w / 2 - 0.01, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
      </mesh>
      <mesh position={[-w / 2 + 0.01, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Exterior dollhouse view
function ExteriorRoom({ photos, roomSize }) {
  const [w, h, d] = roomSize;
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Semi-transparent walls to see inside */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#888" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Walls with photos on outside */}
      {photos && photos.slice(0, 4).map((photo, i) => {
        const faces = [
          { pos: [0, h / 2, -d / 2], rot: [0, 0, 0] },       // front
          { pos: [w / 2, h / 2, 0], rot: [0, -Math.PI / 2, 0] }, // right
          { pos: [0, h / 2, d / 2], rot: [0, Math.PI, 0] },   // back
          { pos: [-w / 2, h / 2, 0], rot: [0, Math.PI / 2, 0] }, // left
        ];
        const face = faces[i];
        const wallW = (i === 0 || i === 2) ? w : d;
        return (
          <PhotoWall
            key={i}
            url={photo.url}
            position={face.pos}
            rotation={face.rot}
            size={[wallW, h]}
          />
        );
      })}

      {/* Wireframe outline */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial wireframe color="#4488ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function RoomViewer({ photos, allPhotos, viewMode, viewpointIndex, totalViewpoints }) {
  const roomW = 10;
  const roomH = 4;
  const roomD = 8;

  const isInside = viewMode === 'inside';

  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: '100%', height: '100%', background: '#111' }}
    >
      {isInside ? (
        <>
          {/* Camera inside the room */}
          <PerspectiveCamera
            makeDefault
            position={[0, roomH * 0.45, 0]}
            fov={75}
            near={0.1}
            far={100}
          />
          {/* Good lighting to see photos clearly */}
          <ambientLight intensity={2.5} />
          <pointLight position={[0, roomH - 0.5, 0]} intensity={1} distance={20} />

          <PhotoRoom photos={photos} roomSize={[roomW, roomH, roomD]} />

          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            enableZoom={true}
            enablePan={false}
            minDistance={0.1}
            maxDistance={3}
            target={[0, roomH * 0.45, -2]}
            rotateSpeed={-0.3}
          />
        </>
      ) : (
        <>
          {/* Camera outside looking at the room */}
          <PerspectiveCamera
            makeDefault
            position={[12, 10, 12]}
            fov={50}
          />
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          <hemisphereLight args={['#b1e1ff', '#886633', 0.5]} />

          <ExteriorRoom photos={allPhotos} roomSize={[roomW, roomH, roomD]} />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <gridHelper args={[40, 40, '#222244', '#111122']} />

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            target={[0, roomH / 2, 0]}
            maxPolarAngle={Math.PI * 0.48}
          />
        </>
      )}
    </Canvas>
  );
}
