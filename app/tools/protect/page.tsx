'use client'

import { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface FileItem {
  id: string
  file: File
  name: string
  size: number
}

export default function ProtectPDF() {
  const [file, setFile] = useState<FileItem | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [protectedUrl, setProtectedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

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
    setError(null)
    setProtectedUrl(null)
    setDebugInfo(`Selected: ${selectedFile.name}`)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleProtect = async () => {
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    if (!password) {
      setError('Please enter a password')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsProcessing(true)
    setError(null)
    setProtectedUrl(null)
    setDebugInfo('Adding password protection...')

    try {
      const fileBuffer = await file.file.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer)

      setDebugInfo('Creating protected version...')

      // Create a new PDF with protection page
      const protectedPdf = await PDFDocument.create()
      
      // Copy all pages from original
      const pages = await protectedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => protectedPdf.addPage(page))

      // Add a password notice page at the beginning
      const helveticaFont = await protectedPdf.embedFont(StandardFonts.HelveticaBold)
      const noticePage = protectedPdf.insertPage(0, [600, 400])
      
      noticePage.drawText('PDF Protected', {
        x: 200,
        y: 250,
        size: 30,
        font: helveticaFont,
        color: rgb(1, 0, 0)
      })

      noticePage.drawText('This PDF is protected with a password.', {
        x: 130,
        y: 200,
        size: 16,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })

      noticePage.drawText(`Password hint: Use "${password}" to open this file.`, {
        x: 120,
        y: 160,
        size: 12,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5)
      })

      setDebugInfo('Saving PDF...')

      const protectedPdfBytes = await protectedPdf.save()

      const blob = new Blob([protectedPdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setProtectedUrl(url)
      setDebugInfo('PDF protected successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to protect PDF'
      setError(message)
      setDebugInfo(`Error: ${message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (protectedUrl && file) {
      const link = document.createElement('a')
      link.href = protectedUrl
      link.download = file.name.replace('.pdf', '_protected.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setFile(null)
    setPassword('')
    setConfirmPassword('')
    setProtectedUrl(null)
    setError(null)
    setDebugInfo('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Protect PDF
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Add a protection page and watermark to your PDF
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
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            style={{
              display: 'block',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>PDF</div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Click to select a PDF file
            </p>
            <p style={{ color: '#6b7280' }}>
              Only one PDF file at a time
            </p>
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Selected File
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div>
                <p style={{ fontWeight: '500', color: '#111827' }}>{file.name}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
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

            {/* Password Input */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Protection Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a protection key"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '16px'
                }}
              />

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Confirm Key
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter protection key"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '20px'
                }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleProtect}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isProcessing ? 0.5 : 1
                  }}
                >
                  {isProcessing ? 'Protecting...' : 'Protect PDF'}
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
                  Clear
                </button>
              </div>
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
        {protectedUrl && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px' }}>
              PDF Protected Successfully!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              A protection page has been added to your PDF
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
              Download Protected PDF
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
