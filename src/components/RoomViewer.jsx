import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Load a photo into a CanvasTexture (reliable with data URLs)
function usePhotoTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.src = url;
  }, [url]);

  return texture;
}

// A single photo panel in the cylinder
function PhotoPanel({ url, position, rotation, width, height }) {
  const texture = usePhotoTexture(url);
  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

// Stitch all photos into a continuous 360° cylinder
function PanoramaCylinder({ photos, radius, height }) {
  if (!photos || photos.length === 0) return null;

  const n = photos.length;
  // Each photo covers an equal arc of the full 360°
  const anglePerPhoto = (Math.PI * 2) / n;
  // Panel width = chord length of the arc
  const panelWidth = 2 * radius * Math.sin(anglePerPhoto / 2);

  return (
    <group>
      {photos.map((photo, i) => {
        // Angle for center of this panel (start from directly in front, go clockwise)
        const angle = i * anglePerPhoto;

        // Position on the cylinder wall (inside surface)
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius;

        // Rotation: face inward toward center
        const ry = angle;

        return (
          <PhotoPanel
            key={photo.id || i}
            url={photo.url}
            position={[x, height / 2, z]}
            rotation={[0, ry, 0]}
            width={panelWidth + 0.01} // tiny overlap to avoid gaps
            height={height}
          />
        );
      })}
    </group>
  );
}

// Floor with a subtle circular texture
function Floor({ radius }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[radius * 1.1, 64]} />
      <meshBasicMaterial color="#555555" side={THREE.DoubleSide} />
    </mesh>
  );
}

// Ceiling
function Ceiling({ radius, height }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <circleGeometry args={[radius * 1.1, 64]} />
      <meshBasicMaterial color="#aaaaaa" side={THREE.DoubleSide} />
    </mesh>
  );
}

// External view: room rotates slowly so you can see all photos from outside
function ExteriorView({ photos, radius, height }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  if (!photos || photos.length === 0) return null;

  const n = photos.length;
  const anglePerPhoto = (Math.PI * 2) / n;
  const panelWidth = 2 * radius * Math.sin(anglePerPhoto / 2);

  return (
    <group ref={groupRef}>
      {photos.map((photo, i) => {
        const angle = i * anglePerPhoto;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius;
        // Face OUTWARD for exterior view
        const ry = angle + Math.PI;

        return (
          <PhotoPanel
            key={photo.id || i}
            url={photo.url}
            position={[x, height / 2, z]}
            rotation={[0, ry, 0]}
            width={panelWidth + 0.01}
            height={height}
          />
        );
      })}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <meshBasicMaterial color="#666" side={THREE.DoubleSide} />
      </mesh>

      {/* Wireframe cylinder */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
        <meshBasicMaterial wireframe color="#4488ff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function RoomViewer({ photos, viewMode }) {
  const n = photos ? photos.length : 0;

  // Radius scales with number of photos to keep them a good size
  const radius = Math.max(4, n * 0.35);
  const height = 3.5;

  const isInside = viewMode === 'inside';

  return (
    <Canvas
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      style={{ width: '100%', height: '100%', background: '#111' }}
    >
      {isInside ? (
        <>
          {/* Camera at center of cylinder, eye height */}
          <PerspectiveCamera makeDefault position={[0, height * 0.45, 0]} fov={75} near={0.1} far={100} />
          <ambientLight intensity={3} />

          <PanoramaCylinder photos={photos} radius={radius} height={height} />
          <Floor radius={radius} />
          <Ceiling radius={radius} height={height} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={0.1}
            maxDistance={radius * 0.8}
            rotateSpeed={-0.4}
            target={[0, height * 0.45, 0]}
          />
        </>
      ) : (
        <>
          {/* Camera outside looking at the cylinder */}
          <PerspectiveCamera makeDefault position={[radius * 2.5, radius * 1.5, radius * 2.5]} fov={50} />
          <ambientLight intensity={2} />
          <directionalLight position={[5, 10, 5]} intensity={1} />

          <ExteriorView photos={photos} radius={radius} height={height} />

          <gridHelper args={[40, 40, '#333', '#222']} position={[0, -0.01, 0]} />

          <OrbitControls target={[0, height / 2, 0]} maxPolarAngle={Math.PI * 0.48} />
        </>
      )}
    </Canvas>
  );
}
