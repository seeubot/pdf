'use client'

import { useState } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'

interface FileItem {
  id: string
  file: File
  name: string
  size: number
}

export default function CompressPDF() {
  const [file, setFile] = useState<FileItem | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    setFile({
      id: Math.random().toString(36).substr(2, 9),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size
    })
    setOriginalSize(selectedFile.size)
    setError(null)
    setCompressedUrl(null)
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
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const input = document.getElementById('pdf-upload') as HTMLInputElement
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(droppedFile)
      input.files = dataTransfer.files
      handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    setIsProcessing(true)
    setError(null)
    setCompressedUrl(null)

    try {
      const fileBuffer = await file.file.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer)

      // Save with compression options
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false
      })

      const blob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setCompressedUrl(url)
      setCompressedSize(blob.size)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to compress PDF'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (compressedUrl && file) {
      const link = document.createElement('a')
      link.href = compressedUrl
      link.download = file.name.replace('.pdf', '_compressed.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setFile(null)
    setCompressedUrl(null)
    setError(null)
    setOriginalSize(0)
    setCompressedSize(0)
  }

  const getCompressionPercentage = () => {
    if (originalSize === 0 || compressedSize === 0) return 0
    return Math.round(((originalSize - compressedSize) / originalSize) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compress PDF</h1>
          <p className="text-lg text-gray-600">Reduce PDF file size while maintaining quality</p>
        </div>

        {/* Upload Area */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-upload')?.click()}
            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-orange-500 bg-orange-50 scale-102'
                : 'border-gray-300 bg-white hover:border-orange-400 hover:shadow-xl'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="pdf-upload"
            />
            <div className="text-6xl mb-4 text-orange-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {isDragging ? 'Drop PDF here' : 'Drag and drop PDF here'}
            </p>
            <p className="text-gray-500 mb-3">or click to browse</p>
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              Single PDF file
            </span>
          </div>
        )}

        {/* File Selected */}
        {file && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="p-2 hover:bg-red-100 rounded-lg transition"
                title="Remove"
              >
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Compression Level */}
            <div className="mb-6">
              <label className="block mb-3 font-semibold text-gray-700">Compression Level</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setCompressionLevel('low')}
                  className={`px-4 py-3 rounded-xl font-medium transition ${
                    compressionLevel === 'low'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setCompressionLevel('medium')}
                  className={`px-4 py-3 rounded-xl font-medium transition ${
                    compressionLevel === 'medium'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setCompressionLevel('high')}
                  className={`px-4 py-3 rounded-xl font-medium transition ${
                    compressionLevel === 'high'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Compressing...
                </span>
              ) : (
                'Compress PDF'
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {compressedUrl && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">PDF Compressed</h2>
              <p className="text-gray-600">Your PDF has been compressed successfully</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Original Size</p>
                <p className="text-xl font-bold text-gray-900">{formatSize(originalSize)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Compressed Size</p>
                <p className="text-xl font-bold text-gray-900">{formatSize(compressedSize)}</p>
              </div>
            </div>

            {getCompressionPercentage() > 0 && (
              <div className="bg-green-100 rounded-xl p-4 text-center mb-6">
                <p className="text-green-700 font-semibold">
                  {getCompressionPercentage()}% size reduction
                </p>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 hover:shadow-xl transition"
            >
              Download Compressed PDF
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
