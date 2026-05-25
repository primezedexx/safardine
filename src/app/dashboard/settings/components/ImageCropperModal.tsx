'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Loader2 } from 'lucide-react'

// Helper function to create a canvas and crop the image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string = 'cropped.jpeg'
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      resolve(file)
    }, 'image/jpeg')
  })
}

interface ImageCropperModalProps {
  imageSrc: string
  aspectRatio: number
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
  isUploading?: boolean
}

export default function ImageCropperModal({ 
  imageSrc, 
  aspectRatio, 
  onCropComplete, 
  onCancel,
  isUploading = false
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
      alert("Failed to crop image")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        onClick={() => { if (!isUploading) onCancel() }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />

      <div className="relative bg-white border border-[#EEEEEE] rounded-[24px] p-6 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 flex flex-col animate-scaleUp">
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F1F1] mb-4">
          <h3 className="text-[18px] font-bold text-[#111827]">Crop Image</h3>
          <button 
            onClick={onCancel}
            disabled={isUploading}
            className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[300px] sm:h-[400px] bg-black rounded-[12px] overflow-hidden mb-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value))
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 text-[13px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-[8px] shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Crop & Save'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
