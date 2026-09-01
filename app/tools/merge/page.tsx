'use client'

import { useState } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'

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
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return
    processFiles(selectedFiles)
  }

  const processFiles = (selectedFiles: FileList) => {
    const pdfFiles: FileItem[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      if (file.type === 'application/pdf') {
        pdfFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          name: file.name,
          size: file.size
        })
      }
    }

    if (pdfFiles.length === 0) {
      setError('Please select PDF files only')
      return
    }

    setFiles(prev => [...prev, ...pdfFiles])
    setError(null)
    setMergedUrl(null)
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
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }

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
      setError('Please select at least 2 PDF files to merge')
      return
    }

    // Release any previous merged blob before creating a new one
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
    }

    setIsMerging(true)
    setError(null)
    setMergedUrl(null)

    try {
      const mergedPdf = await PDFDocument.create()

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        const fileBuffer = await fileItem.file.arrayBuffer()

        let pdf: PDFDocument
        try {
          pdf = await PDFDocument.load(fileBuffer)
        } catch (loadErr) {
          const msg = loadErr instanceof Error ? loadErr.message.toLowerCase() : ''
          if (msg.includes('encrypt')) {
            throw new Error(
              `"${fileItem.name}" is password-protected. Please remove the password before merging.`
            )
          }
          throw new Error(`"${fileItem.name}" could not be read. It may be corrupted or not a valid PDF.`)
        }

        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to merge PDFs'
      setError(message)
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
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
    }
    setFiles([])
    setMergedUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Merge PDF Files</h1>
          <p className="text-lg text-gray-600">Combine multiple PDFs into one document</p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pdf-upload')?.click()}
          className={`border-[3px] border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-xl'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <div className="text-6xl mb-4 text-blue-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop PDF files here' : 'Drag and drop PDF files here'}
          </p>
          <p className="text-gray-500 mb-3">or click to browse</p>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Multiple PDF files supported
          </span>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {files.length} {files.length === 1 ? 'File' : 'Files'}
              </h2>
              <span className="text-sm text-gray-500">Total: {formatSize(files.reduce((acc, f) => acc + f.size, 0))}</span>
            </div>

            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate" title={fileItem.name}>
                        {fileItem.name}
                      </p>
                      <p className="text-sm text-gray-500">{formatSize(fileItem.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-white rounded-lg transition disabled:opacity-30"
                      title="Move up"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="p-2 hover:bg-white rounded-lg transition disabled:opacity-30"
                      title="Move down"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Remove"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleMerge}
                disabled={isMerging || files.length < 2}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMerging ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Merging...
                  </span>
                ) : (
                  'Merge PDFs'
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
        {mergedUrl && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">PDFs Merged</h2>
            <p className="text-gray-600 mb-6">{files.length} files combined into one PDF</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 hover:shadow-xl transition"
            >
              Download Merged PDF
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
