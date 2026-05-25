'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

export default function ThreeDCard({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Track position of the mouse relative to card bounds (-0.5 to 0.5)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Configure smooth physics for the tilt animation
  const springConfig = { damping: 20, stiffness: 220, mass: 0.6 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig)

  // Specular glare effect that follows the cursor
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const relativeX = (mouseX / width) - 0.5
    const relativeY = (mouseY / height) - 0.5

    x.set(relativeX)
    y.set(relativeY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative w-full h-full cursor-pointer"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d' 
        }}
        className="h-full w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 relative group"
      >
        {/* Dynamic Specular Gloss/Glare */}
        <motion.div
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)',
            left: glareX,
            top: glareY,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-80 h-80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full mix-blend-overlay z-10"
        />
        
        {/* Card Content Wrapper */}
        <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }} className="h-full w-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
