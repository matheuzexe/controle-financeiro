"use client"

import { useState, useEffect } from "react"

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Função para verificar se a tela é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar no carregamento inicial
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

