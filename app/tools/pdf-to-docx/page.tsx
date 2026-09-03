'use client'

import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, TextRun } from 'docx'

// Point pdf.js at its worker bundle — this pattern works with Next.js/webpack
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

    // Group text items into lines by Y position, then order left-to-right within each line
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

    // Top of page first (PDF y-coordinates increase upward)
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

      // Insert a page break after the last line of every page except the final one
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
  const [file,
