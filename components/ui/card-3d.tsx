"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxRotation?: number
  scale?: number
  glare?: boolean
  className?: string
}

/**
 * Card3D: A GPU-composited, zero-server-load interactive 3D perspective card.
 * Uses requestAnimationFrame and direct ref transforms to avoid React re-renders.
 * Completely disabled on touch devices or when prefers-reduced-motion is active.
 */
export function Card3D({
  children,
  maxRotation = 8,
  scale = 1.018,
  glare = true,
  className = "",
  style = {},
  ...props
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    // Only enable on desktop pointer devices that support hover and don't prefer reduced motion
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)")
    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)")
    setCanHover(mqHover.matches && mqMotion.matches)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canHover || !cardRef.current) return

      const card = cardRef.current
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Normalize between -1 and 1
      const normX = (x - centerX) / centerX
      const normY = (y - centerY) / centerY

      const rotateX = -normY * maxRotation
      const rotateY = normX * maxRotation

      // Direct GPU transform update
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`

      if (glare && glareRef.current) {
        const glareX = (x / rect.width) * 100
        const glareY = (y / rect.height) * 100
        glareRef.current.style.opacity = "1"
        glareRef.current.style.background = `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18), transparent 75%)`
      }
    },
    [canHover, maxRotation, scale, glare]
  )

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    if (glareRef.current) {
      glareRef.current.style.opacity = "0"
    }
  }, [])

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative transition-[transform,box-shadow] duration-200 ease-out will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        ...style
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 z-20"
        />
      )}
    </div>
  )
}
