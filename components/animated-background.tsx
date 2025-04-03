"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Função que desenha o gradiente com cores mais vibrantes no topo e mais suaves embaixo
    const drawGradientBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)

      if (theme === "dark") {
        // Dark theme - mais vibrante no topo, mais suave embaixo
        gradient.addColorStop(0, "#ff6600") // Laranja vibrante no topo
        gradient.addColorStop(0.7, "#cc5500") // Transição
        gradient.addColorStop(1, "#994400") // Laranja mais escuro e menos saturado embaixo
      } else {
        // Light theme - mais vibrante no topo, mais suave embaixo
        gradient.addColorStop(0, "#ff8c1a") // Laranja vibrante no topo
        gradient.addColorStop(0.6, "#ffaa4d") // Transição
        gradient.addColorStop(1, "#ffd9b3") // Laranja pálido e suave embaixo
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = () => {
      drawGradientBackground()
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

