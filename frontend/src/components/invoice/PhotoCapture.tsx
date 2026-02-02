import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePhotoCapture } from '@/hooks/usePhotoCapture'

interface PhotoCaptureProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
}

export default function PhotoCapture({ photos, onPhotosChange }: PhotoCaptureProps) {
  const {
    isCapturing,
    fileInputRef,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileSelect,
    removePhoto,
    clearPhotos
  } = usePhotoCapture()

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
    removePhoto(index)
  }

  const handleClearPhotos = () => {
    onPhotosChange([])
    clearPhotos()
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Damage Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Camera/Video View */}
        {isCapturing && (
          <div className="mb-4 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 object-cover rounded-lg bg-black"
            />
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <Button
                size="sm"
                onClick={capturePhoto}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-1" />
                Capture
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={stopCamera}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    width="100"
                    height="96"
                    loading="lazy"
                    alt={`Damage photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {photos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPhotos}
                className="mt-2"
              >
                Clear All Photos
              </Button>
            )}
          </div>
        )}

        {/* Capture Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={startCamera}
            disabled={isCapturing}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-1" />
            Take Photo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Instructions */}
        {photos.length === 0 && !isCapturing && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>
                Take photos of vehicle damage for documentation. 
                Photos will be attached to the invoice.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
