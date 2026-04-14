import React, { useEffect, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Single wall with photo texture
function Wall({ photoUrl, position, rotation, width, height }) {
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    if (!photoUrl) {
      setMaterial(new THREE.MeshBasicMaterial({ color: '#aaaaaa', side: THREE.DoubleSide }));
      return;
    }

    // Load photo as texture using an Image element (works with data URLs)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;

      setMaterial(new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
        toneMapped: false,
      }));
    };
    img.onerror = () => {
      setMaterial(new THREE.MeshBasicMaterial({ color: '#999999', side: THREE.DoubleSide }));
    };
    img.src = photoUrl;
  }, [photoUrl]);

  if (!material) return null;

  return (
    <mesh position={position} rotation={rotation} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default function RoomViewer({ photos, allPhotos, viewMode }) {
  const W = 10; // room width
  const H = 4;  // room height
  const D = 8;  // room depth

  // Assign each photo to a wall face
  const wallPhotos = useMemo(() => {
    const result = { front: [], right: [], back: [], left: [] };
    if (!photos || photos.length === 0) return result;

    const faces = ['front', 'right', 'back', 'left'];
    photos.forEach((p, i) => {
      result[faces[i % 4]].push(p.url);
    });
    return result;
  }, [photos]);

  const isInside = viewMode === 'inside';

  return (
    <Canvas
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      style={{ width: '100%', height: '100%', background: '#222' }}
    >
      {isInside ? (
        <>
          <PerspectiveCamera makeDefault position={[0, H * 0.45, 0]} fov={80} near={0.1} far={100} />
          <ambientLight intensity={3} />

          {/* === FRONT WALL (facing -Z) === */}
          <WallStrip
            photos={wallPhotos.front}
            wallWidth={W}
            wallHeight={H}
            position={[0, H / 2, -D / 2]}
            rotation={[0, 0, 0]}
          />

          {/* === BACK WALL (facing +Z, rotated 180) === */}
          <WallStrip
            photos={wallPhotos.back}
            wallWidth={W}
            wallHeight={H}
            position={[0, H / 2, D / 2]}
            rotation={[0, Math.PI, 0]}
          />

          {/* === RIGHT WALL === */}
          <WallStrip
            photos={wallPhotos.right}
            wallWidth={D}
            wallHeight={H}
            position={[W / 2, H / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          />

          {/* === LEFT WALL === */}
          <WallStrip
            photos={wallPhotos.left}
            wallWidth={D}
            wallHeight={H}
            position={[-W / 2, H / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[W, D]} />
            <meshBasicMaterial color="#777777" side={THREE.DoubleSide} />
          </mesh>

          {/* Ceiling */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
            <planeGeometry args={[W, D]} />
            <meshBasicMaterial color="#cccccc" side={THREE.DoubleSide} />
          </mesh>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={0.1}
            maxDistance={4}
            rotateSpeed={-0.4}
            target={[0, H * 0.45, -1]}
          />
        </>
      ) : (
        <>
          <PerspectiveCamera makeDefault position={[14, 10, 14]} fov={50} />
          <ambientLight intensity={2} />
          <directionalLight position={[5, 10, 5]} intensity={1} />

          {/* Same room but viewed from outside */}
          <group>
            {/* Show photos on outside walls */}
            {allPhotos && allPhotos.slice(0, 4).map((photo, i) => {
              const configs = [
                { pos: [0, H / 2, -D / 2 - 0.01], rot: [0, Math.PI, 0], w: W, h: H },
                { pos: [W / 2 + 0.01, H / 2, 0], rot: [0, Math.PI / 2, 0], w: D, h: H },
                { pos: [0, H / 2, D / 2 + 0.01], rot: [0, 0, 0], w: W, h: H },
                { pos: [-W / 2 - 0.01, H / 2, 0], rot: [0, -Math.PI / 2, 0], w: D, h: H },
              ];
              const c = configs[i];
              return (
                <Wall
                  key={i}
                  photoUrl={photo.url}
                  position={c.pos}
                  rotation={c.rot}
                  width={c.w}
                  height={c.h}
                />
              );
            })}

            {/* Wireframe */}
            <mesh position={[0, H / 2, 0]}>
              <boxGeometry args={[W, H, D]} />
              <meshBasicMaterial wireframe color="#4488ff" transparent opacity={0.3} />
            </mesh>

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[W, D]} />
              <meshBasicMaterial color="#666" side={THREE.DoubleSide} />
            </mesh>
          </group>

          <gridHelper args={[40, 40, '#333', '#222']} position={[0, -0.01, 0]} />

          <OrbitControls target={[0, H / 2, 0]} maxPolarAngle={Math.PI * 0.48} />
        </>
      )}
    </Canvas>
  );
}

// Renders one or more photos along a wall
function WallStrip({ photos, wallWidth, wallHeight, position, rotation }) {
  if (!photos || photos.length === 0) {
    // No photos - render a plain grey wall
    return (
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <meshBasicMaterial color="#bbbbbb" side={THREE.DoubleSide} />
      </mesh>
    );
  }

  if (photos.length === 1) {
    // Single photo covers the whole wall
    return (
      <Wall
        photoUrl={photos[0]}
        position={position}
        rotation={rotation}
        width={wallWidth}
        height={wallHeight}
      />
    );
  }

  // Multiple photos: split wall into panels
  const panelWidth = wallWidth / photos.length;
  const basePos = new THREE.Vector3(...position);
  const euler = new THREE.Euler(...rotation);
  const quat = new THREE.Quaternion().setFromEuler(euler);

  return (
    <group>
      {photos.map((url, i) => {
        // Calculate panel offset along the wall's local X axis
        const localX = -wallWidth / 2 + panelWidth / 2 + i * panelWidth;
        const offset = new THREE.Vector3(localX, 0, 0).applyQuaternion(quat);
        const pos = [basePos.x + offset.x, basePos.y + offset.y, basePos.z + offset.z];

        return (
          <Wall
            key={i}
            photoUrl={url}
            position={pos}
            rotation={rotation}
            width={panelWidth}
            height={wallHeight}
          />
        );
      })}
    </group>
  );
}
