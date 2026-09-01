'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles)
    
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
    setMergedUrl(null)
    setDebugInfo('Starting merge...')

    try {
      const formData = new FormData()
      
      files.forEach(fileItem => {
        formData.append('files', fileItem.file, fileItem.name)
        console.log('Adding file:', fileItem.name, fileItem.size)
      })

      setDebugInfo(`Sending ${files.length} files to server...`)

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData
      })

      setDebugInfo(`Server response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Server error:', errorData)
        throw new Error(errorData?.details || errorData?.error || 'Failed to merge PDFs')
      }

      const blob = await response.blob()
      console.log('Received blob:', blob.size, 'bytes')
      
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
      setDebugInfo('Merge successful!')
    } catch (err) {
      console.error('Merge error:', err)
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs')
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    setDebugInfo(null)
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
          <div className="text-6xl mb-4 font-bold text-gray-400">PDF</div>
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
                    <span className="text-2xl font-bold text-red-500">PDF</span>
                    <div>
                      <p className="font-medium text-gray-900">{fileItem.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(fileItem.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    Remove
                  </button>
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

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
            <p className="font-semibold">Debug Info:</p>
            <p>{debugInfo}</p>
          </div>
        )}

        {/* Result */}
        {mergedUrl && (
          <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-2">PDF Merged Successfully!</h2>
            <p className="text-gray-600 mb-4">Your files have been combined into one PDF</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Download Merged PDF
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
