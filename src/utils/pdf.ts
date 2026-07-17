import { PDFDocument } from 'pdf-lib'

/**
 * Reads a PDF file in the browser and returns its total page count.
 * Returns null when the file cannot be parsed (corrupt/protected PDFs)
 * so the upload flow is never blocked by page counting.
 */
export const getPdfPageCount = async (file: File): Promise<number | null> => {
  try {
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    return doc.getPageCount()
  } catch {
    return null
  }
}
