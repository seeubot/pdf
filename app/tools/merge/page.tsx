'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

interface FileItem {
  id: string
  file: File
  name: string
  size: number
}

export default function MergePDF() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [mergedUrl, setMergedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length === 0) {
      setError('Please upload PDF files only')
      return
    }

    const newFiles = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size
    }))

    setFiles(prev => [...prev, ...newFiles])
    setError(null)
    setMergedUrl(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setMergedUrl(null)
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= newFiles.length) return
    
    const temp = newFiles[index]
    newFiles[index] = newFiles[newIndex]
    newFiles[newIndex] = temp
    
    setFiles(newFiles)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge')
      return
    }

    setIsMerging(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach(fileItem => {
        formData.append('files', fileItem.file)
      })

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to merge PDFs')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
    } catch (err) {
      setError('Failed to merge PDFs. Please try again.')
      console.error(err)
    } finally {
      setIsMerging(false)
    }
  }

  const handleDownload = () => {
    if (mergedUrl) {
      const link = document.createElement('a')
      link.href = mergedUrl
      link.download = 'merged.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setFiles([])
    setMergedUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Merge PDF Files</h1>
          <p className="text-xl text-gray-600">Combine multiple PDFs into one single document</p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">PDF</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {isDragActive ? 'Drop PDF files here' : 'Drag and drop PDF files here'}
          </p>
          <p className="text-gray-500">or click to select files</p>
          <p className="text-sm text-gray-400 mt-2">Maximum file size: 10MB per file</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selected Files ({files.length})
            </h2>
            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">PDF</span>
                    <div>
                      <p className="font-medium text-gray-900">{fileItem.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(fileItem.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      Up
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      Down
                    </button>
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleMerge}
                disabled={isMerging || files.length < 2}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isMerging ? 'Merging...' : 'Merge PDFs'}
              </button>
              <button
                onClick={clearAll}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {mergedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-2">PDF Merged Successfully!</h2>
            <p className="text-gray-600 mb-4">Your files have been combined into one PDF</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Download Merged PDF
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Merge PDF Files</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload your PDF files by dragging and dropping them or clicking to select</li>
            <li>Arrange the files in the order you want them merged</li>
            <li>Click the "Merge PDFs" button</li>
            <li>Download your merged PDF file</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
