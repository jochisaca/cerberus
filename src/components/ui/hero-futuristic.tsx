'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';

// For WebGPU compatibility, we'll use regular Three.js with fallbacks
const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

// Post Processing component - simplified for regular WebGL
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show image after textures load
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    if (!rawMap || !depthMap) return { material: new THREE.MeshBasicMaterial(), uniforms: {} };

    const uPointer = new THREE.Uniform(new THREE.Vector2(0, 0));
    const uProgress = new THREE.Uniform(0);
    const uTime = new THREE.Uniform(0);

    // Create shader material with displacement and scanning effects
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: rawMap },
        uDepthMap: { value: depthMap },
        uPointer: uPointer,
        uProgress: uProgress,
        uTime: uTime,
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uDepthMap;
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform float uTime;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv;
          
          // Get depth value
          float depth = texture2D(uDepthMap, uv).r;
          
          // Create displacement based on pointer and depth
          vec2 displacement = uPointer * depth * 0.01;
          vec2 displacedUv = uv + displacement;
          
          // Sample the main texture
          vec4 color = texture2D(uTexture, displacedUv);
          
          // Create grid pattern
          float aspect = ${WIDTH.toFixed(1)} / ${HEIGHT.toFixed(1)};
          vec2 gridUv = vec2(uv.x * aspect, uv.y) * 120.0;
          vec2 gridId = floor(gridUv);
          vec2 gridPos = fract(gridUv) - 0.5;
          
          // Cell noise for brightness variation
          float brightness = noise(gridId * 0.5);
          
          // Distance from center of grid cell
          float dist = length(gridPos);
          float dot = smoothstep(0.5, 0.49, dist) * brightness;
          
          // Flow effect based on progress
          float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));
          
          // Red overlay mask
          vec3 mask = vec3(10.0, 0.0, 0.0) * dot * flow;
          
          // Screen blend the mask with the original color
          vec3 final = color.rgb + mask - (color.rgb * mask);
          
          // Add scanning line effect
          float scanLine = abs(uv.y - uProgress);
          float scanIntensity = 1.0 - smoothstep(0.0, 0.05, scanLine);
          final += vec3(1.0, 0.0, 0.0) * scanIntensity * 0.4;
          
          gl_FragColor = vec4(final, color.a);
        }
      `,
      transparent: true,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
        uTime,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock, pointer }) => {
    if (uniforms.uProgress) {
      uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    }
    if (uniforms.uTime) {
      uniforms.uTime.value = clock.getElapsedTime();
    }
    if (uniforms.uPointer) {
      uniforms.uPointer.value = pointer;
    }
    
    // Smooth appearance
    if (meshRef.current && 'material' in meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.opacity !== undefined) {
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          visible ? 1 : 0,
          0.07
        );
      }
    }
  });

  const scaleFactor = 0.40;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const HeroFuturistic = () => {
  const titleWords = 'Build Your Dreams'.split(' ');
  const subtitle = 'AI-powered creativity for the next generation.';
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    // Generate random delays for glitch effect on client side only
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

  return (
    <div className="h-screen">
      <div className="h-screen uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
          <div className="flex space-x-2 lg:space-x-6 overflow-hidden text-white">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? 'fade-in glitch-text' : ''}
                style={{ 
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`, 
                  opacity: index < visibleWords ? undefined : 0 
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold">
          <div
            className={subtitleVisible ? 'fade-in-subtitle' : ''}
            style={{ 
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`, 
              opacity: subtitleVisible ? undefined : 0 
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <button
        className="explore-btn pointer-events-auto"
        style={{ animationDelay: '2.2s' }}
      >
        Scroll to explore
        <span className="explore-arrow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <Canvas
        flat
        camera={{ position: [0, 0, 1] }}
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;