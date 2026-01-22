import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

function FloatingShape({ geo, color, emissive, position, scale = 1, spin = 0.35 }) {
  const ref = useRef(null)

  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * spin
    ref.current.rotation.y += dt * spin * 0.8
  })

  return (
    <Float speed={1.4} rotationIntensity={0.65} floatIntensity={1.25}>
      <mesh ref={ref} geometry={geo} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.7}
          transparent
          opacity={0.52}
          roughness={0.35}
          metalness={0.75}
          wireframe
        />
      </mesh>
    </Float>
  )
}

function Scene({ variant }) {
  const shapes = useMemo(() => {
    const icosa = new THREE.IcosahedronGeometry(1.1, 0)
    const octa = new THREE.OctahedronGeometry(1.0, 0)
    const box = new THREE.BoxGeometry(1.2, 1.2, 1.2)
    const torus = new THREE.TorusKnotGeometry(0.7, 0.22, 90, 10)

    const base = variant === 'vendor' ? 0.92 : 1.0

    return [
      { geo: icosa, color: '#fbbf24', emissive: '#f59e0b', position: [-3.2, 1.6, -4.6], scale: 0.85 * base, spin: 0.35 },
      { geo: octa, color: '#34d399', emissive: '#10b981', position: [3.5, 1.2, -5.2], scale: 0.78 * base, spin: 0.32 },
      // Keep palette tight (amber/emerald/blue/violet). Avoid strong red which hurts readability.
      { geo: box, color: '#38bdf8', emissive: '#3b82f6', position: [-2.2, -1.7, -3.8], scale: 0.65 * base, spin: 0.45 },
      { geo: torus, color: '#a78bfa', emissive: '#8b5cf6', position: [2.1, -1.2, -4.4], scale: 0.58 * base, spin: 0.42 },
      { geo: octa, color: '#60a5fa', emissive: '#3b82f6', position: [0.2, 2.3, -6.0], scale: 0.55 * base, spin: 0.28 },
      { geo: icosa, color: '#fbbf24', emissive: '#f59e0b', position: [0.0, -2.4, -6.2], scale: 0.48 * base, spin: 0.3 },
    ]
  }, [variant])

  return (
    <>
      <color attach="background" args={['transparent']} />
      <fog attach="fog" args={['#000000', 6.5, 16]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 6, 6]} intensity={1.05} />
      <pointLight position={[-6, -2, 4]} intensity={0.7} color={'#f59e0b'} />
      <pointLight position={[5, 1, 3]} intensity={0.55} color={'#10b981'} />

      <group>
        {shapes.map((s, idx) => (
          <FloatingShape key={idx} {...s} />
        ))}
      </group>
    </>
  )
}

function Arena3DBackgroundBase({ variant = 'landing', className = '' }) {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion) return null

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, position: [0, 0, 8] }}
      >
        <Scene variant={variant} />
      </Canvas>
    </div>
  )
}

const Arena3DBackground = memo(Arena3DBackgroundBase)
export default Arena3DBackground
