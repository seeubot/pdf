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
    console.log(`Files:`, files.map(f => ({ name: f.name, size: f.size, type: f.type })))

    if (files.length < 2) {
      console.log('ERROR: Less than 2 files')
      return NextResponse.json(
        { error: 'Please upload at least 2 PDF files' },
        { status: 400 }
      )
    }

    // Create a new PDF document
    console.log('Creating new PDF document...')
    const mergedPdf = await PDFDocument.create()
    console.log('PDF document created successfully')

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`\n--- Processing file ${i + 1}/${files.length}: ${file.name} ---`)
      console.log(`File size: ${file.size} bytes`)
      console.log(`File type: ${file.type}`)
      
      try {
        console.log(`Reading file buffer...`)
        const fileBuffer = await file.arrayBuffer()
        console.log(`Buffer size: ${fileBuffer.byteLength} bytes`)
        
        console.log(`Loading PDF document...`)
        const pdf = await PDFDocument.load(fileBuffer, { 
          ignoreEncryption: false,
          updateMetadata: false 
        })
        console.log(`PDF loaded. Pages: ${pdf.getPageCount()}`)
        
        console.log(`Copying pages...`)
        const pageIndices = pdf.getPageIndices()
        console.log(`Page indices: ${pageIndices}`)
        
        const pages = await pdf.copyPages(mergedPdf, pageIndices)
        console.log(`Copied ${pages.length} pages`)
        
        console.log(`Adding pages to merged PDF...`)
        pages.forEach((page, idx) => {
          mergedPdf.addPage(page)
          console.log(`  Added page ${idx + 1}`)
        })
        
        console.log(`Successfully processed ${file.name}`)
      } catch (fileError) {
        console.error(`ERROR processing ${file.name}:`, fileError)
        
        // Check if it's an encrypted PDF
        if (fileError instanceof Error) {
          console.error(`Error name: ${fileError.name}`)
          console.error(`Error message: ${fileError.message}`)
          console.error(`Error stack: ${fileError.stack}`)
          
          if (fileError.message.includes('encrypted') || fileError.message.includes('password')) {
            return NextResponse.json(
              { 
                error: `The PDF "${file.name}" is password-protected or encrypted. Please remove the password and try again.`,
                details: fileError.message
              },
              { status: 400 }
            )
          }
        }
        
        return NextResponse.json(
          { 
            error: `Failed to process "${file.name}". The file might be corrupted or invalid.`,
            details: fileError instanceof Error ? fileError.message : 'Unknown error'
          },
          { status: 400 }
        )
      }
    }

    console.log('\n--- All files processed. Saving merged PDF... ---')
    const mergedPdfBytes = await mergedPdf.save()
    console.log(`Merged PDF size: ${mergedPdfBytes.length} bytes`)
    
    const buffer = Buffer.from(mergedPdfBytes)
    console.log(`Buffer created: ${buffer.length} bytes`)

    console.log('=== MERGE SUCCESSFUL ===')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('=== MERGE FAILED ===')
    console.error('Error:', error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        error: 'Failed to merge PDFs',
        details: error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
