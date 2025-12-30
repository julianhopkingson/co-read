'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider' // We might need to create this or use standard input
import getCroppedImg from '@/lib/cropImage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useLanguage } from '@/contexts/language-context'

interface ImageCropperProps {
    imageSrc: string
    isOpen: boolean
    onClose: () => void
    onCropComplete: (croppedImageBlob: Blob) => void
}

export function ImageCropper({ imageSrc, isOpen, onClose, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const { t } = useLanguage()

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    // Wrap the handler to match Slider's signature which returns number[]
    const handleSliderChange = (vals: number[]) => {
        setZoom(vals[0])
    }

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
                onClose()
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-zinc-200 shadow-2xl z-[100]">
                <DialogHeader>
                    <DialogTitle className="text-zinc-900 font-bold text-xl">{t('common.crop') || 'Crop Image'}</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-80 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="py-6 px-2 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-zinc-700 w-12">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={handleSliderChange}
                            className="flex-1 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-zinc-900 w-10 text-right">{Math.round(zoom * 10) / 10}x</span>
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-3 sm:gap-3">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-zinc-100 text-zinc-700 font-medium">
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md font-bold px-6">
                        {t('common.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
