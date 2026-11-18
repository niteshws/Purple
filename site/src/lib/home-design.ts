import { useSyncExternalStore } from 'react'

export type HomeDesign = '1' | '2'
const KEY = 'pu-home-design'
const listeners = new Set<() => void>()
let memory: HomeDesign = '1'

function read(): HomeDesign {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === '1' || saved === '2' ? saved : memory
  } catch {
    return memory
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      memory = event.newValue === '2' ? '2' : '1'
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function setHomeDesign(design: HomeDesign) {
  memory = design
  try {
    localStorage.setItem(KEY, design)
  } catch {
    // The selection also works for this visit when storage is unavailable.
  }
  listeners.forEach((listener) => listener())
}

export function useHomeDesign() {
  return useSyncExternalStore(subscribe, read, () => '1' as const)
}
