'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SoundName =
  | 'card_play'
  | 'card_attack'
  | 'card_skill'
  | 'card_power'
  | 'enemy_hit'
  | 'player_hit'
  | 'block_gain'
  | 'heal'
  | 'gold_gain'
  | 'turn_start'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'boss_appear'
  | 'shop_buy'
  | 'card_draw'
  | 'potion_use'
  | 'relic_gain'
  | 'button_click'
  | 'card_exhaust'
  | 'poison_tick'
  | 'level_up'

const STORAGE_KEY = 'deck-dungeon-sound'

function createOscSound(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  duration: number,
  volume: number = 0.3,
  freqEnd?: number,
  delay: number = 0,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), ctx.currentTime + delay + duration)
  }
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

function createNoise(
  ctx: AudioContext,
  duration: number,
  volume: number = 0.15,
  delay: number = 0,
  filterFreq?: number,
) {
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

  if (filterFreq) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = filterFreq
    source.connect(filter)
    filter.connect(gain)
  } else {
    source.connect(gain)
  }
  gain.connect(ctx.destination)
  source.start(ctx.currentTime + delay)
  source.stop(ctx.currentTime + delay + duration)
}

function playSound(ctx: AudioContext, name: SoundName) {
  switch (name) {
    case 'card_play':
    case 'card_draw':
      createOscSound(ctx, 'sine', 600, 0.08, 0.15)
      createOscSound(ctx, 'sine', 900, 0.06, 0.1, undefined, 0.03)
      break

    case 'card_attack':
      createNoise(ctx, 0.15, 0.2, 0, 3000)
      createOscSound(ctx, 'sawtooth', 200, 0.12, 0.15, 80)
      break

    case 'card_skill':
      createOscSound(ctx, 'sine', 400, 0.15, 0.15, 800)
      createOscSound(ctx, 'sine', 600, 0.1, 0.1, 1000, 0.05)
      break

    case 'card_power':
      createOscSound(ctx, 'sine', 300, 0.3, 0.15, 600)
      createOscSound(ctx, 'triangle', 450, 0.25, 0.1, 900, 0.1)
      createOscSound(ctx, 'sine', 600, 0.2, 0.08, 1200, 0.2)
      break

    case 'enemy_hit':
      createNoise(ctx, 0.1, 0.25, 0, 2000)
      createOscSound(ctx, 'square', 150, 0.1, 0.12, 60)
      break

    case 'player_hit':
      createOscSound(ctx, 'sawtooth', 100, 0.2, 0.2, 40)
      createNoise(ctx, 0.12, 0.2, 0, 1500)
      break

    case 'block_gain':
      createOscSound(ctx, 'triangle', 300, 0.1, 0.15, 500)
      createOscSound(ctx, 'sine', 500, 0.08, 0.1, undefined, 0.05)
      break

    case 'heal':
      createOscSound(ctx, 'sine', 400, 0.15, 0.15, 600)
      createOscSound(ctx, 'sine', 600, 0.15, 0.12, 800, 0.1)
      createOscSound(ctx, 'sine', 800, 0.2, 0.1, 1000, 0.2)
      break

    case 'gold_gain':
      createOscSound(ctx, 'sine', 800, 0.08, 0.12)
      createOscSound(ctx, 'sine', 1200, 0.08, 0.1, undefined, 0.06)
      createOscSound(ctx, 'sine', 1600, 0.1, 0.08, undefined, 0.12)
      break

    case 'turn_start':
      createOscSound(ctx, 'sine', 500, 0.12, 0.12, 700)
      break

    case 'enemy_turn':
      createOscSound(ctx, 'sine', 400, 0.15, 0.1, 250)
      break

    case 'victory':
      createOscSound(ctx, 'sine', 500, 0.2, 0.15)
      createOscSound(ctx, 'sine', 630, 0.2, 0.15, undefined, 0.15)
      createOscSound(ctx, 'sine', 750, 0.2, 0.15, undefined, 0.3)
      createOscSound(ctx, 'sine', 1000, 0.4, 0.2, undefined, 0.45)
      break

    case 'defeat':
      createOscSound(ctx, 'sine', 400, 0.3, 0.15, 200)
      createOscSound(ctx, 'sine', 300, 0.3, 0.12, 150, 0.25)
      createOscSound(ctx, 'sine', 200, 0.5, 0.1, 80, 0.5)
      break

    case 'boss_appear':
      createOscSound(ctx, 'sawtooth', 80, 0.5, 0.15, 60)
      createOscSound(ctx, 'sine', 120, 0.4, 0.1, 80, 0.2)
      createNoise(ctx, 0.3, 0.1, 0.1, 800)
      break

    case 'shop_buy':
      createOscSound(ctx, 'sine', 600, 0.08, 0.12)
      createOscSound(ctx, 'sine', 900, 0.08, 0.1, undefined, 0.05)
      createOscSound(ctx, 'sine', 1200, 0.12, 0.1, undefined, 0.1)
      break

    case 'potion_use':
      createOscSound(ctx, 'sine', 300, 0.2, 0.12, 800)
      createNoise(ctx, 0.15, 0.08, 0.1, 4000)
      break

    case 'relic_gain':
      createOscSound(ctx, 'sine', 600, 0.15, 0.15, 900)
      createOscSound(ctx, 'triangle', 800, 0.2, 0.12, 1200, 0.1)
      createOscSound(ctx, 'sine', 1000, 0.3, 0.1, 1500, 0.2)
      break

    case 'button_click':
      createOscSound(ctx, 'sine', 700, 0.05, 0.1)
      break

    case 'card_exhaust':
      createNoise(ctx, 0.2, 0.12, 0, 1000)
      createOscSound(ctx, 'sine', 300, 0.15, 0.08, 100)
      break

    case 'poison_tick':
      createOscSound(ctx, 'sawtooth', 150, 0.15, 0.1, 80)
      createNoise(ctx, 0.08, 0.08, 0.05, 2000)
      break

    case 'level_up':
      createOscSound(ctx, 'sine', 500, 0.15, 0.15, 700)
      createOscSound(ctx, 'sine', 700, 0.15, 0.12, 900, 0.12)
      createOscSound(ctx, 'sine', 900, 0.2, 0.12, 1200, 0.24)
      break
  }
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [muted, setMuted] = useState(true) // default muted until loaded

  useEffect(() => {
    // Load preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setMuted(stored === 'muted')
    } catch {
      setMuted(false)
    }
  }, [])

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return
      try {
        const ctx = getCtx()
        playSound(ctx, name)
      } catch {
        // Silently fail
      }
    },
    [muted, getCtx],
  )

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'muted' : 'on')
      } catch {}
      // If unmuting, init audio context (needs user gesture)
      if (!next) {
        try { getCtx() } catch {}
      }
      return next
    })
  }, [getCtx])

  return { play, muted, toggle }
}
