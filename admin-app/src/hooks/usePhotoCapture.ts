import { useState, useRef } from 'react'

export function usePhotoCapture() {
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Start camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      // Fallback to file input
      fileInputRef.current?.click()
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  // Capture photo from video
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPhotos(prev => [...prev, photoUrl])
      stopCamera()
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (result) {
            setPhotos(prev => [...prev, result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Clear all photos
  const clearPhotos = () => {
    setPhotos([])
    stopCamera()
  }

  return {
    photos,
    isCapturing,
    fileInputRef,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileSelect,
    removePhoto,
    clearPhotos
  }
}
