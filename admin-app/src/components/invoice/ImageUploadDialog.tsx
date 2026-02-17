import { useState, useRef } from "react"
import { Camera, Upload, Loader2, X, FileImage, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ExtractedItem {
    description: string
    quantity: number
    rate: number
    selected: boolean
}

interface ImageUploadDialogProps {
    onItemsExtracted: (items: { description: string; quantity: number; rate: number }[]) => void
    trigger?: React.ReactNode
}

export function ImageUploadDialog({ onItemsExtracted, trigger }: ImageUploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([])
    const [step, setStep] = useState<'upload' | 'review'>('upload')
    const fileInputRef = useRef<HTMLInputElement>(null)

    /**
     * Resize image client-side to reduce payload for AI processing.
     * Max dimension 1024px, JPEG quality 0.7 — keeps text readable while
     * dramatically reducing base64 payload (often 10x smaller).
     */
    const resizeImage = (dataUrl: string, maxDim = 1024, quality = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                let { width, height } = img
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            }
            img.src = dataUrl
        })
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB')
            return
        }

        const reader = new FileReader()
        reader.onload = async (event) => {
            const result = event.target?.result as string
            setImagePreview(result)
            // Resize before storing for upload
            const resized = await resizeImage(result)
            setImageBase64(resized)
        }
        reader.readAsDataURL(file)
    }

    const handleExtract = async () => {
        if (!imageBase64) return

        setIsProcessing(true)
        try {
            const response = await api.extractItemsFromImage(imageBase64)

            if (response.success && response.data && response.data.length > 0) {
                setExtractedItems(
                    response.data.map((item: any) => ({
                        ...item,
                        selected: true,
                    }))
                )
                setStep('review')
                toast.success(`Found ${response.data.length} item(s)`)
            } else {
                toast.error('Could not extract items from image. Try a clearer photo.')
            }
        } catch (error: any) {
            console.error('OCR extraction failed:', error)
            const msg = error.message || 'Failed to process image'
            if (msg.includes('timed out') || msg.includes('504') || msg.includes('timeout')) {
                toast.error('AI service timed out. Try a smaller or clearer image, or add items manually.')
            } else {
                toast.error(msg)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleItemSelection = (index: number) => {
        setExtractedItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, selected: !item.selected } : item
            )
        )
    }

    const updateItemField = (index: number, field: keyof ExtractedItem, value: any) => {
        setExtractedItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        )
    }

    const handleAddItems = () => {
        const selectedItems = extractedItems
            .filter((item) => item.selected)
            .map(({ description, quantity, rate }) => ({
                description,
                quantity,
                rate,
            }))

        if (selectedItems.length === 0) {
            toast.error('Please select at least one item')
            return
        }

        onItemsExtracted(selectedItems)
        toast.success(`Added ${selectedItems.length} item(s)`)
        handleClose()
    }

    const handleClose = () => {
        setOpen(false)
        setImagePreview(null)
        setImageBase64(null)
        setExtractedItems([])
        setStep('upload')
        setIsProcessing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                        <Camera className="h-4 w-4" />
                        Upload Image
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileImage className="h-5 w-5 text-blue-600" />
                        {step === 'upload' ? 'Upload Image to Extract Items' : 'Review Extracted Items'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload'
                            ? 'Upload a photo of an invoice, bill, or parts list to automatically extract items.'
                            : 'Review and edit the extracted items before adding them.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="space-y-4">
                        {/* Upload Area */}
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg object-contain"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setImagePreview(null)
                                            setImageBase64(null)
                                            if (fileInputRef.current) fileInputRef.current.value = ''
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, JPEG up to 10MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium">Tips for best results:</p>
                                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                                        <li>Ensure the image is clear and well-lit</li>
                                        <li>Items should show description, quantity, and rate</li>
                                        <li>You can edit extracted values before adding</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-3">
                        {/* Small preview */}
                        {imagePreview && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                <img
                                    src={imagePreview}
                                    alt="Source"
                                    className="h-12 w-12 rounded object-cover"
                                />
                                <span className="text-xs text-gray-500">
                                    {extractedItems.length} item(s) extracted
                                </span>
                            </div>
                        )}

                        {/* Items list */}
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                            {extractedItems.map((item, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-3 transition-colors ${
                                        item.selected
                                            ? 'border-blue-200 bg-blue-50/30'
                                            : 'border-gray-200 bg-gray-50 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleItemSelection(index)}
                                            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                item.selected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                        >
                                            {item.selected && <Check className="h-3 w-3" />}
                                        </button>

                                        <div className="flex-1 space-y-2">
                                            <div>
                                                <Label className="text-xs text-gray-500">Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItemField(index, 'description', e.target.value)}
                                                    className="text-sm h-8"
                                                    disabled={!item.selected}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs text-gray-500">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemField(index, 'quantity', Number(e.target.value) || 1)}
                                                        className="text-sm h-8"
                                                        disabled={!item.selected}
                                                        min={1}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Rate (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.rate}
                                                        onChange={(e) => updateItemField(index, 'rate', Number(e.target.value) || 0)}
                                                        className="text-sm h-8"
                                                        disabled={!item.selected}
                                                        min={0}
                                                    />
                                                </div>
                                            </div>
                                            {item.selected && (
                                                <div className="text-xs text-gray-500 text-right">
                                                    Amount: <span className="font-semibold text-gray-900">₹{(item.quantity * item.rate).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <span className="text-gray-500">
                                {extractedItems.filter((i) => i.selected).length} of {extractedItems.length} selected
                            </span>
                            <span className="font-semibold">
                                Total: ₹{extractedItems
                                    .filter((i) => i.selected)
                                    .reduce((sum, i) => sum + i.quantity * i.rate, 0)
                                    .toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 'upload' ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExtract}
                                disabled={!imageBase64 || isProcessing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="h-4 w-4 mr-2" />
                                        Extract Items
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleAddItems}
                                disabled={extractedItems.filter((i) => i.selected).length === 0}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Add {extractedItems.filter((i) => i.selected).length} Item(s)
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
