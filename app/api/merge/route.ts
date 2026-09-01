import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log('=== MERGE API CALLED ===')
  
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    console.log(`Number of files received: ${files.length}`)

    if (files.length < 2) {
      console.log('ERROR: Less than 2 files')
      return NextResponse.json(
        { error: 'Please upload at least 2 PDF files' },
        { status: 400 }
      )
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`Processing file ${i + 1}: ${file.name} (${file.size} bytes)`)
      
      try {
        const fileBuffer = await file.arrayBuffer()
        console.log(`Buffer size: ${fileBuffer.byteLength}`)
        
        const pdf = await PDFDocument.load(fileBuffer, { 
          ignoreEncryption: true,
          updateMetadata: false 
        })
        
        console.log(`Loaded PDF with ${pdf.getPageCount()} pages`)
        
        const pages = await pdf.copyPages(mergedPdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
        
        console.log(`Successfully added ${pages.length} pages`)
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError)
        return NextResponse.json(
          { 
            error: `Failed to process "${file.name}"`,
            details: fileError instanceof Error ? fileError.message : 'Unknown error'
          },
          { status: 400 }
        )
      }
    }

    const mergedPdfBytes = await mergedPdf.save()
    const buffer = Buffer.from(mergedPdfBytes)

    console.log(`Merge successful. Output size: ${buffer.length} bytes`)

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
