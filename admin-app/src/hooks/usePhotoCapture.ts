import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Verify magic bytes
async function verifyImageSignature(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer).slice(0, 4)

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true

  // WebP: 52 49 46 46 (Actually RIFF)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return true

  return false
}

// Compress image
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      // Resize if too large
      const MAX_WIDTH = 1920
      const MAX_HEIGHT = 1080
      let { width, height } = img

      if (width > MAX_WIDTH) {
        height = (height / width) * MAX_WIDTH
        width = MAX_WIDTH
      }
      if (height > MAX_HEIGHT) {
        width = (width / height) * MAX_HEIGHT
        height = MAX_HEIGHT
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.8) // 80% quality
    }
  })
}

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

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
          const url = URL.createObjectURL(file)
          setPhotos(prev => [...prev, url])
        }
      }, 'image/jpeg', 0.8)

      stopCamera()
    }
  }

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPhotoUrls: string[] = []

    for (const file of Array.from(files)) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`)
        continue
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name} (max 5MB)`)
        continue
      }

      // Verify actual file signature (magic bytes)
      const isValid = await verifyImageSignature(file)
      if (!isValid) {
        toast.error(`Corrupted or invalid image: ${file.name}`)
        continue
      }

      try {
        // Compress before storing
        const compressed = await compressImage(file)
        const url = URL.createObjectURL(compressed)
        newPhotoUrls.push(url)
      } catch (error) {
        console.error('Error processing image:', error)
        toast.error(`Failed to process image: ${file.name}`)
      }
    }

    if (newPhotoUrls.length > 0) {
      setPhotos(prev => [...prev, ...newPhotoUrls])
    }

    // Reset input value to allow selecting same files again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove photo with cleanup
  const removePhoto = (index: number) => {
    const urlToRemove = photos[index]
    if (urlToRemove && urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove)
    }
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Clear all photos with cleanup
  const clearPhotos = () => {
    photos.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    setPhotos([])
    stopCamera()
  }

  // Cleanup on unmount
  const photosRef = useRef<string[]>([])
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      photosRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

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
