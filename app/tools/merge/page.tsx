'use client'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

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
  const [debugInfo, setDebugInfo] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

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
    setDebugInfo(`Added ${pdfFiles.length} file(s)`)
  }

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
    setDebugInfo('Starting merge in browser...')

    try {
      const mergedPdf = await PDFDocument.create()

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        setDebugInfo(`Processing file ${i + 1}/${files.length}: ${fileItem.name}`)
        
        const fileBuffer = await fileItem.file.arrayBuffer()
        const pdf = await PDFDocument.load(fileBuffer)
        const pages = await pdf.copyPages(mergedPdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      setDebugInfo('Saving merged PDF...')
      const mergedPdfBytes = await mergedPdf.save()
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
      setDebugInfo(`Merge successful! Total pages: ${mergedPdf.getPageCount()}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to merge PDFs'
      setError(message)
      setDebugInfo(`Error: ${message}`)
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
    setDebugInfo('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Merge PDF Files
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Combine multiple PDFs into one single document
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
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            style={{
              display: 'block',
              cursor: 'pointer',
              fontSize: '48px',
              marginBottom: '12px'
            }}
          >
            PDF
          </label>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Click to select PDF files
          </p>
          <p style={{ color: '#6b7280' }}>
            You can select multiple files
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Selected Files ({files.length})
            </h2>
            <div>
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827' }}>{fileItem.name}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{formatSize(fileItem.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handleMerge}
                disabled={isMerging || files.length < 2}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: isMerging || files.length < 2 ? 0.5 : 1
                }}
              >
                {isMerging ? 'Merging...' : 'Merge PDFs'}
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
        {mergedUrl && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px' }}>
              PDF Merged Successfully!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your files have been combined into one PDF
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
              Download Merged PDF
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
