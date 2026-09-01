import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length < 2) {
      return NextResponse.json(
        { error: 'Please upload at least 2 PDF files' },
        { status: 400 }
      )
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each file
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer)
      const pages = await pdf.copyPages(mergedPdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()

    // Convert Uint8Array to Buffer
    const buffer = Buffer.from(mergedPdfBytes)

    // Return the merged PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"'
      }
    })
  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json(
      { error: 'Failed to merge PDFs' },
      { status: 500 }
    )
  }
}
