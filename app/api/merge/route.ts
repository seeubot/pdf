import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    console.log(`Merging ${files.length} PDF files`)

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each file
    for (const file of files) {
      try {
        console.log(`Processing: ${file.name}, Size: ${file.size}`)
        
        const fileBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(fileBuffer)
        const pages = await pdf.copyPages(mergedPdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
        
        console.log(`Successfully added ${pages.length} pages from ${file.name}`)
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError)
        throw new Error(`Failed to process ${file.name}`)
      }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    const buffer = Buffer.from(mergedPdfBytes)

    console.log(`Successfully merged ${files.length} files`)

    // Return the merged PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to merge PDFs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
