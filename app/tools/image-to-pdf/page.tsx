'use client'

import { useState } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'

interface ImageItem {
  id: string
  file: File
  name: string
  size: number
  preview: string
}

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return
    processFiles(selectedFiles)
  }

  const processFiles = (selectedFiles: FileList) => {
    const imageFiles: ImageItem[] = []
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
        imageFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          name: file.name,
          size: file.size,
          preview: URL.createObjectURL(file)
        })
      }
    }

    if (imageFiles.length === 0) {
      setError('Please select image files (JPG, PNG, or WebP)')
      return
    }

    setImages(prev => [...prev, ...imageFiles])
    setError(null)
    setPdfUrl(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    setPdfUrl(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please select at least one image')
      return
    }

    setIsProcessing(true)
    setError(null)
    setPdfUrl(null)

    try {
      const pdf = await PDFDocument.create()

      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const imageBytes = await image.file.arrayBuffer()
        
        let embeddedImage
        if (image.file.type === 'image/png') {
          embeddedImage = await pdf.embedPng(imageBytes)
        } else {
          embeddedImage = await pdf.embedJpg(imageBytes)
        }

        const imageDims = embeddedImage.scale(1)
        const page = pdf.addPage([imageDims.width, imageDims.height])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imageDims.width,
          height: imageDims.height
        })
      }

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert images to PDF'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = 'images.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setImages([])
    setPdfUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Image to PDF</h1>
          <p className="text-lg text-gray-600">Convert your images into a beautiful PDF document</p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload')?.click()}
          className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-purple-500 bg-purple-50 scale-102'
              : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-xl'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
          </p>
          <p className="text-gray-500 mb-3">or click to browse</p>
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            JPG • PNG • WebP
          </span>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </h2>
              <span className="text-sm text-gray-500">Total: {formatSize(images.reduce((acc, img) => acc + img.size, 0))}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Converting...
                  </span>
                ) : (
                  'Convert to PDF'
                )}
              </button>
              <button
                onClick={clearAll}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {pdfUrl && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">PDF Created!</h2>
            <p className="text-gray-600 mb-6">{images.length} images converted to PDF</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 hover:shadow-xl transition"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
