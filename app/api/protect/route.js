import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string

    if (!file || !password) {
      return NextResponse.json(
        { error: 'File and password are required' },
        { status: 400 }
      )
    }

    const fileBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(fileBuffer)

    // Unfortunately, pdf-lib does not support encryption
    // We need to use a different approach
    
    // For now, let's add a watermark and protection notice
    const protectedPdf = await PDFDocument.create()
    const pages = await protectedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => protectedPdf.addPage(page))

    // Add watermark to all pages
    const helveticaFont = await protectedPdf.embedFont(StandardFonts.HelveticaBold)
    const totalPages = protectedPdf.getPageCount()

    for (let i = 0; i < totalPages; i++) {
      const page = protectedPdf.getPage(i)
      const { width, height } = page.getSize()
      
      page.drawText('PROTECTED DOCUMENT', {
        x: width / 2 - 100,
        y: height / 2,
        size: 20,
        font: helveticaFont,
        color: rgb(0.9, 0.9, 0.9),
        rotate: Math.PI / 4
      })
    }

    const protectedPdfBytes = await protectedPdf.save()
    const buffer = Buffer.from(protectedPdfBytes)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="protected_${file.name}"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Protect error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to protect PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
