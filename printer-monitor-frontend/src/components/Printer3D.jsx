import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// The actual 3D Copier Model
const CopierModel = ({ status, errorStatus }) => {
  const groupRef = useRef();
  const paperRef = useRef();
  
  const isPrinting = status === 'Printing' || status === 'Warmup';
  const isError = status === 'Stopped' || status === 'Offline' || (errorStatus && errorStatus !== 'OK');
  const isWarning = status === 'Warning';

  // Animation Loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Gentle floating and auto-rotation
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1 - 0.5; // Slight angle

    // Printing animation: Paper slides out
    if (isPrinting && paperRef.current) {
      // Loop the paper sliding out every 2 seconds
      const cycle = t % 2; 
      // Paper starts inside (z=0.2), slides out to (z=1.5)
      paperRef.current.position.z = 0.2 + (cycle * 0.6);
      paperRef.current.material.opacity = cycle > 1.8 ? 0 : 1; // fade out at the end
    } else if (paperRef.current) {
      paperRef.current.position.z = 0.2; // hide inside
      paperRef.current.material.opacity = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Cabinet (Drawers) */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[1.6, 1.4, 1.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* Drawer lines for detail */}
      <mesh position={[0, -0.8, 0.71]}>
        <boxGeometry args={[1.4, 0.02, 0.02]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, -1.4, 0.71]}>
        <boxGeometry args={[1.4, 0.02, 0.02]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Middle Section (Output Tray Area) */}
      <mesh position={[0, -0.1, -0.2]}>
        <boxGeometry args={[1.6, 0.8, 1.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Scanner Bed (Top) */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.3, 1.6]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ADF (Auto Document Feeder on top of scanner) */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.6, 0.2, 1.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Control Panel Screen */}
      <mesh position={[0.6, 0.35, 0.85]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      {/* Glowing UI Screen */}
      <mesh position={[0.6, 0.36, 0.88]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial 
          color={isError ? "#ef4444" : isWarning ? "#eab308" : "#3b82f6"} 
          emissive={isError ? "#ef4444" : isWarning ? "#eab308" : "#3b82f6"}
          emissiveIntensity={isError ? 2 : 1}
        />
      </mesh>

      {/* Animated Paper (Hidden by default, slides out into the middle section) */}
      <mesh ref={paperRef} position={[0, -0.2, 0.2]} rotation={[-0.05, 0, 0]}>
        <planeGeometry args={[0.8, 1.1]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} transparent />
      </mesh>

      {/* Error Light (Red PointLight) */}
      {isError && (
        <pointLight position={[0.6, 0.6, 1]} color="#ef4444" intensity={2} distance={3} />
      )}
      {/* Warning Light (Yellow) */}
      {isWarning && !isError && (
        <pointLight position={[0.6, 0.6, 1]} color="#eab308" intensity={1.5} distance={3} />
      )}
    </group>
  );
};

export default function Printer3D({ status, errorStatus }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        
        <CopierModel status={status} errorStatus={errorStatus} />
        
        {/* Soft shadow on the ground */}
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={5} blur={2} far={4} />
        <Environment preset="city" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>
    </div>
  );
}
