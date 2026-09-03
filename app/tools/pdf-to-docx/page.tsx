'use client'

import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, TextRun } from 'docx'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

interface FileItem {
  id: string
  file: File
  name: string
  size: number
}

interface ExtractedTextItem {
  str: string
  x: number
  width: number
}

async function extractPagesText(fileBuffer: ArrayBuffer): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: fileBuffer })
  const pdfDocument = await loadingTask.promise
  const pageTexts: string[] = []

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const textContent = await page.getTextContent()

    const lines: { y: number; items: ExtractedTextItem[] }[] = []

    for (const raw of textContent.items) {
      const item = raw as any
      if (!item.str || !item.str.trim()) continue

      const x = item.transform[4]
      const y = item.transform[5]
      const width = item.width ?? 0

      let line = lines.find(l => Math.abs(l.y - y) < 3)
      if (!line) {
        line = { y, items: [] }
        lines.push(line)
      }
      line.items.push({ str: item.str, x, width })
    }

    lines.sort((a, b) => b.y - a.y)

    const pageLines = lines.map(line => {
      const sorted = [...line.items].sort((a, b) => a.x - b.x)
      let text = ''
      let lastEnd: number | null = null
      for (const item of sorted) {
        if (lastEnd !== null && item.x - lastEnd > 1) text += ' '
        text += item.str
        lastEnd = item.x + item.width
      }
      return text
    })

    pageTexts.push(pageLines.join('\n'))
  }

  return pageTexts
}

function buildDocx(pageTexts: string[]): Promise<Blob> {
  const children: Paragraph[] = []

  pageTexts.forEach((pageText, pageIndex) => {
    const lines = pageText.split('\n')

    lines.forEach((line, lineIndex) => {
      const isLastLineOfPage = lineIndex === lines.length - 1
      const isLastPage = pageIndex === pageTexts.length - 1

      children.push(
        new Paragraph({
          children: [new TextRun(line || ' ')],
          pageBreakBefore: false
        })
      )

      if (isLastLineOfPage && !isLastPage) {
        children.push(
          new Paragraph({
            children: [new TextRun('')],
            pageBreakBefore: true
          })
        )
      }
    })

    if (lines.length === 0 || (lines.length === 1 && !lines[0])) {
      children.push(new Paragraph({ children: [new TextRun('[No extractable text on this page]')] }))
    }
  })

  const doc = new Document({
    sections: [{ properties: {}, children }]
  })

  return Packer.toBlob(doc)
}

export default function PDFToDocx() {
  const [file, setFile] = useState<FileItem | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [docxUrl, setDocxUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setDocxUrl(null)

    try {
      const fileBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: fileBuffer })
      const pdfDocument = await loadingTask.promise
      setTotalPages(pdfDocument.numPages)
    } catch (err) {
      setError('Failed to read PDF file')
    }
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

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    setIsProcessing(true)
    setError(null)
    setDocxUrl(null)

    try {
      const fileBuffer = await file.file.arrayBuffer()
      const pageTexts = await extractPagesText(fileBuffer)
      const blob = await buildDocx(pageTexts)
      const url = URL.createObjectURL(blob)
      setDocxUrl(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert PDF to DOCX'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (docxUrl && file) {
      const link = document.createElement('a')
      link.href = docxUrl
      link.download = file.name.replace('.pdf', '.docx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setFile(null)
    setTotalPages(0)
    setDocxUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PDF to DOCX</h1>
          <p className="text-lg text-gray-400">Convert your PDF to a Word document</p>
        </div>

        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-upload')?.click()}
            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-950/50 scale-102'
                : 'border-gray-700 bg-gray-900 hover:border-blue-400 hover:shadow-xl'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="pdf-upload"
            />
            <div className="text-6xl mb-4 text-blue-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white mb-2">
              {isDragging ? 'Drop PDF here' : 'Drag and drop PDF here'}
            </p>
            <p className="text-gray-400 mb-3">or click to browse</p>
            <span className="inline-block px-4 py-2 bg-blue-950 text-blue-400 rounded-full text-sm font-medium">
              PDF to Word document
            </span>
          </div>
        )}

        {file && (
          <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {formatSize(file.size)} - {totalPages} pages
                  </p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="p-2 hover:bg-red-950 rounded-lg transition"
                title="Remove"
              >
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Converting...' : 'Convert to DOCX'}
            </button>
          </div>
        )}

        {docxUrl && (
          <div className="mt-8 bg-green-950 border-2 border-green-600 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Conversion Complete</h2>
            <p className="text-gray-400 mb-6">Your PDF has been converted to DOCX</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 hover:shadow-xl transition"
            >
              Download DOCX
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-950 border border-red-800 rounded-xl p-4 flex items-center gap-3">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
