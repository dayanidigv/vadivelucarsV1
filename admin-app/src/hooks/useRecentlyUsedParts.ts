import { useState, useEffect } from 'react'

import type { Part } from '@/types'

interface RecentPart extends Part {
  price: number // Required for recent parts context
  lastUsed: Date
}

export function useRecentlyUsedParts() {
  const [recentParts, setRecentParts] = useState<RecentPart[]>([])

  // Load recently used parts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyUsedParts')
    if (stored) {
      try {
        const parts = JSON.parse(stored)
        // Sort by last used date and take top 10
        const sorted = parts
          .sort((a: RecentPart, b: RecentPart) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
          .slice(0, 10)
        setRecentParts(sorted)
      } catch (error) {
        console.error('Error loading recently used parts:', error)
      }
    }
  }, [])

  // Add part to recently used
  const addRecentPart = (part: Part) => {
    const newPart: RecentPart = {
      ...part,
      price: part.default_rate || part.price || 0,
      lastUsed: new Date()
    }

    setRecentParts(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== newPart.id)
      // Add to beginning and keep only top 10
      const updated = [newPart, ...filtered].slice(0, 10)

      // Save to localStorage
      localStorage.setItem('recentlyUsedParts', JSON.stringify(updated))

      return updated
    })
  }

  // Clear recently used parts
  const clearRecentParts = () => {
    setRecentParts([])
    localStorage.removeItem('recentlyUsedParts')
  }

  return {
    recentParts,
    addRecentPart,
    clearRecentParts
  }
}
