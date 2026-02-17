'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSound } from './useSound'

type SoundContextType = ReturnType<typeof useSound>

const SoundContext = createContext<SoundContextType>({
  play: () => {},
  muted: false,
  toggle: () => {},
})

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound()
  return <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>
}

export function useSoundContext() {
  return useContext(SoundContext)
}
