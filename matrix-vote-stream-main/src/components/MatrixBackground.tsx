import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const MatrixBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.1);
    mountRef.current.appendChild(renderer.domElement);

    // Matrix characters
    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Create matrix rain columns
    const columns = Math.floor(window.innerWidth / 20);
    const drops: number[] = [];
    const rainGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Initialize drops and positions
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
      
      // Create multiple characters per column for rain effect
      for (let j = 0; j < 50; j++) {
        positions.push(
          (i - columns / 2) * 20, // x
          Math.random() * window.innerHeight - window.innerHeight / 2, // y
          0 // z
        );
        
        // Green color with varying opacity
        const intensity = Math.random() * 0.8 + 0.2;
        colors.push(0, intensity, 0); // RGB
      }
    }

    rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    rainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const rainMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const rainPoints = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(rainPoints);

    camera.position.z = 100;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate rain drops
      const positions = rainGeometry.attributes.position.array as Float32Array;
      const colors = rainGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= Math.random() * 3 + 2; // y position

        // Reset drop if it goes below screen
        if (positions[i + 1] < -window.innerHeight / 2) {
          positions[i + 1] = window.innerHeight / 2;
          // Random color intensity for new drop
          const colorIndex = (i / 3) * 3;
          const intensity = Math.random() * 0.8 + 0.2;
          colors[colorIndex] = 0; // R
          colors[colorIndex + 1] = intensity; // G
          colors[colorIndex + 2] = 0; // B
        }
      }

      rainGeometry.attributes.position.needsUpdate = true;
      rainGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
};