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
  const [debugInfo, setDebugInfo] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

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
    setDebugInfo(`Added ${imageFiles.length} image(s)`)
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
    setDebugInfo('Creating PDF from images...')

    try {
      const pdf = await PDFDocument.create()

      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        setDebugInfo(`Processing image ${i + 1}/${images.length}: ${image.name}`)

        const imageBytes = await image.file.arrayBuffer()
        
        let embeddedImage
        if (image.file.type === 'image/png') {
          embeddedImage = await pdf.embedPng(imageBytes)
        } else {
          embeddedImage = await pdf.embedJpg(imageBytes)
        }

        // Get image dimensions
        const imageDims = embeddedImage.scale(1)

        // Create a page with the same dimensions as the image
        const page = pdf.addPage([imageDims.width, imageDims.height])
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imageDims.width,
          height: imageDims.height
        })
      }

      setDebugInfo('Saving PDF...')
      const pdfBytes = await pdf.save()
      
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setDebugInfo(`PDF created successfully with ${images.length} page(s)!`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert images to PDF'
      setError(message)
      setDebugInfo(`Error: ${message}`)
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
    setDebugInfo('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Image to PDF Converter
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Convert JPG, PNG, and WebP images to PDF
          </p>
        </div>

        {/* File Upload */}
        <div style={{
          border: '3px dashed #d1d5db',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'white',
          marginBottom: '24px'
        }}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            style={{
              display: 'block',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>IMG</div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Click to select images
            </p>
            <p style={{ color: '#6b7280' }}>
              JPG, PNG, or WebP format
            </p>
          </label>
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Selected Images ({images.length})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '8px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={image.preview}
                    alt={image.name}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px'
                  }}>
                    {image.name}
                  </p>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                    {formatSize(image.size)}
                  </p>
                  <button
                    onClick={() => removeImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: isProcessing ? 0.5 : 1
                }}
              >
                {isProcessing ? 'Converting...' : 'Convert to PDF'}
              </button>
              <button
                onClick={clearAll}
                style={{
                  padding: '14px 20px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            color: '#1e40af'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Status:</p>
            <p>{debugInfo}</p>
          </div>
        )}

        {/* Result */}
        {pdfUrl && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px' }}>
              PDF Created Successfully!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your images have been converted to PDF
            </p>
            <button
              onClick={handleDownload}
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
