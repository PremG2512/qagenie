import axios from 'axios'
import * as mammoth from 'mammoth'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Extract readable text from PDF buffer
 * Uses simple string extraction to find readable content
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log(`📄 Processing PDF buffer of ${buffer.length} bytes`)
  
  const pdfHeader = buffer.toString('ascii', 0, 20)
  console.log(`📄 PDF header: "${pdfHeader}"`)
  
  try {
    // Enhanced PDF text extraction - multiple approaches
    const pdfContent = buffer.toString('latin1')
    
    // Method 1: Look for text between PDF text operators
    const textOperators = [
      /\(([^)]+)\)/g,  // Text in parentheses
      /BT[\s\S]*?ET/g, // Between text blocks
      /Tj\s*$/gm,      // Text show operators
    ]
    
    let extractedStrings: string[] = []
    
    // Extract text from parentheses (most common PDF text format)
    const parenMatches = pdfContent.match(/\(([^)]+)\)/g) || []
    parenMatches.forEach(match => {
      const text = match.slice(1, -1).replace(/\\[()]/g, '').trim()
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        extractedStrings.push(text)
      }
    })
    
    // Method 2: Look for readable ASCII strings (enhanced)
    const asciiMatches = pdfContent.match(/[A-Za-z][A-Za-z0-9\s.,!?:;-]{3,50}/g) || []
    asciiMatches.forEach(text => {
      const cleanText = text.trim()
      if (cleanText.length > 3 && 
          /[A-Za-z]{2,}/.test(cleanText) && 
          !cleanText.match(/^(obj|endobj|stream|endstream|xref|trailer)$/)) {
        extractedStrings.push(cleanText)
      }
    })
    
    // Method 3: Look for common user story keywords
    const userStoryPatterns = [
      /As\s+a[^.]+\./gi,
      /I\s+want[^.]+\./gi,  
      /So\s+that[^.]+\./gi,
      /Given[^.]+\./gi,
      /When[^.]+\./gi,
      /Then[^.]+\./gi,
      /User\s+Story[^.]*\./gi,
      /Login[^.]*\./gi,
      /Search[^.]*\./gi,
      /Feature[^.]*\./gi,
      /Scenario[^.]*\./gi
    ]
    
    userStoryPatterns.forEach(pattern => {
      const matches = pdfContent.match(pattern) || []
      matches.forEach(match => {
        const cleanMatch = match.replace(/[^\w\s.,!?:-]/g, '').trim()
        if (cleanMatch.length > 5) {
          extractedStrings.push(cleanMatch)
        }
      })
    })
    
    // Remove duplicates and filter
    const uniqueStrings = [...new Set(extractedStrings)]
      .filter(str => str.length > 2)
      .filter(str => !str.match(/^[0-9\s.]+$/))
      .filter(str => !str.match(/^(PDF|obj|endobj|stream|BaseFont|Helvetica)$/i))
      .slice(0, 30)
    
    console.log(`📄 Extracted ${uniqueStrings.length} meaningful text strings`)
    console.log(`📄 Sample strings: ${JSON.stringify(uniqueStrings.slice(0, 5))}`)
    
    if (uniqueStrings.length > 0) {
      const content = `PDF TEXT CONTENT (${buffer.length} bytes):
${uniqueStrings.join('\n')}

--- Raw PDF Analysis ---
File Header: ${pdfHeader}
Extracted Strings: ${uniqueStrings.length}
Content Type: ${uniqueStrings.some(s => s.toLowerCase().includes('login')) ? 'Login-related' : 
                uniqueStrings.some(s => s.toLowerCase().includes('search')) ? 'Search-related' : 'General'}

--- END PDF CONTENT ---`
      return content
    }
    
    // Fallback: return basic info
    return `PDF FILE (${buffer.length} bytes):
Header: ${pdfHeader}
Type: ReportLab Generated PDF
Note: No readable user story content extracted - may be image-based or encoded PDF

Raw content sample: ${pdfContent.substring(0, 200).replace(/[^\x20-\x7E]/g, '.')}`
    
  } catch (error) {
    console.error(`📄 PDF extraction error:`, error)
    return `PDF processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

async function extractComplexPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log(`📄 PDF downloaded successfully: ${buffer.length} bytes`)
    
    // Extract readable strings from PDF buffer
    const pdfContent = buffer.toString('binary')
    const readableStrings: string[] = []
    
    // Find text between common PDF text markers
    const textPatterns = [
      /\(([^)]+)\)/g,  // Text in parentheses (common PDF text format)
      /\/([A-Za-z][A-Za-z0-9]*)/g,  // PDF object names
      /BT[\s\S]+?ET/g,  // Between BT (Begin Text) and ET (End Text)
      /Tj\s+(.+?)$/gm,  // Text positioning commands
      /TJ\s+(.+?)$/gm   // Text array commands
    ]
    
    // Extract strings that look like readable text
    const allText = pdfContent.match(/[\x20-\x7E]{4,}/g) || []
    const meaningfulText = allText
      .filter(text => text.length > 3)
      .filter(text => /[a-zA-Z]/.test(text))  // Must contain letters
      .filter(text => !text.match(/^[0-9\.\s]+$/))  // Not just numbers
      .slice(0, 20)  // Take first 20 meaningful strings
    
    const hexPreview = buffer.toString('hex').substring(0, 200) + '...'
    
    return `📄 PDF FILE CONTENT ANALYSIS
==========================================

🔍 File Size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)

📊 File Header Analysis:
- PDF Version: ${buffer.toString('ascii', 0, 8)}
- File Type: ${buffer.toString('ascii', 1, 4) === 'PDF' ? 'Valid PDF' : 'Unknown'}
- Generator: ${pdfContent.includes('ReportLab') ? 'ReportLab' : 'Unknown'}

� EXTRACTED READABLE STRINGS:
${meaningfulText.length > 0 ? meaningfulText.map((text, i) => `${i + 1}. "${text}"`).join('\n') : 'No clear text strings found'}

� Raw Binary Data (Hex Preview):
${hexPreview}

📝 Content Summary:
This PDF contains ${meaningfulText.length} readable text strings extracted from the binary content.
${meaningfulText.length > 0 ? 'Some readable content was found and is displayed above.' : 'No clear readable text was extracted.'}

💡 Extracted Text Hints:
${meaningfulText.slice(0, 5).join(' | ')}

🎯 POTENTIAL PDF CONTENT:
${meaningfulText.filter(t => t.length > 10).slice(0, 3).join('\n')}`
    
  } catch (error) {
    console.error('Error processing PDF:', error)
    return `[PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}]`
  }
}

export interface JiraAttachment {
  id: string
  filename: string
  size: number
  mimeType: string
  content: string
  created: string
  author: string
}

export interface AttachmentProcessResult {
  attachments: JiraAttachment[]
  combinedText: string
  success: boolean
  errors: string[]
}

/**
 * Fetch all attachments from a JIRA issue and extract text content
 */
export async function fetchAndProcessJiraAttachments(
  jiraConfig: any,
  issueId: string
): Promise<AttachmentProcessResult> {
  const result: AttachmentProcessResult = {
    attachments: [],
    combinedText: '',
    success: true,
    errors: []
  }

  try {
    // First, get the issue with attachment information
    const cleanDomainUrl = jiraConfig.domainUrl.replace(/\/+$/, '')
    const issueUrl = `${cleanDomainUrl}/rest/api/2/issue/${issueId}?fields=attachment`
    
    const authHeader = Buffer.from(`${jiraConfig.email}:${jiraConfig.apiKey}`).toString('base64')

    console.log(`🔍 Fetching attachments for issue: ${issueId}`)
    
    const issueResponse = await axios.get(issueUrl, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    })

    const attachments = issueResponse.data.fields?.attachment || []
    
    if (attachments.length === 0) {
      console.log(`📎 No attachments found for issue: ${issueId}`)
      return result
    }

    console.log(`📎 Found ${attachments.length} attachments for issue: ${issueId}`)

    // Process each attachment
    for (const attachment of attachments) {
      try {
        const attachmentResult = await processAttachment(jiraConfig, attachment)
        if (attachmentResult) {
          result.attachments.push(attachmentResult)
          
          // Add to combined text if content was extracted
          if (attachmentResult.content) {
            result.combinedText += `\n\n--- Attachment: ${attachmentResult.filename} ---\n`
            result.combinedText += attachmentResult.content
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process attachment ${attachment.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        result.errors.push(errorMsg)
      }
    }

    console.log(`✅ Successfully processed ${result.attachments.length} attachments`)
    
  } catch (error) {
    const errorMsg = `Failed to fetch attachments: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`❌ ${errorMsg}`)
    result.errors.push(errorMsg)
    result.success = false
  }

  return result
}

/**
 * Process a single JIRA attachment and extract text content
 */
async function processAttachment(
  jiraConfig: any,
  attachment: any
): Promise<JiraAttachment | null> {
  try {
    const authHeader = Buffer.from(`${jiraConfig.email}:${jiraConfig.apiKey}`).toString('base64')
    
    // Download the attachment
    console.log(`📥 Downloading attachment: ${attachment.filename} (${attachment.size} bytes)`)
    
    const downloadResponse = await axios.get(attachment.content, {
      headers: {
        'Authorization': `Basic ${authHeader}`
      },
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout for downloads
      maxContentLength: 10 * 1024 * 1024 // 10MB max
    })

    const buffer = Buffer.from(downloadResponse.data)
    
    // Extract text based on file type
    const extractedText = await extractTextFromBuffer(buffer, attachment.filename, attachment.mimeType)
    
    return {
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size,
      mimeType: attachment.mimeType,
      content: extractedText,
      created: attachment.created,
      author: attachment.author?.displayName || 'Unknown'
    }
    
  } catch (error) {
    console.error(`❌ Error processing attachment ${attachment.filename}:`, error)
    return null
  }
}

/**
 * Extract text from different file types
 */
async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  try {
    const lowerFilename = filename.toLowerCase()
    
    // PDF files
    if (mimeType === 'application/pdf' || lowerFilename.endsWith('.pdf')) {
      console.log(`📄 Extracting text from PDF: ${filename}`)
      try {
        const extractedText = await extractPdfText(buffer)
        console.log(`📄 Successfully extracted ${extractedText.length} characters from PDF: ${filename}`)
        return extractedText
      } catch (pdfError) {
        console.error(`Error extracting PDF text: ${pdfError}`)
        return `[PDF File: ${filename} - Error extracting text: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}]`
      }
    }
    
    // Microsoft Word documents
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        lowerFilename.endsWith('.docx')) {
      console.log(`📝 Extracting text from Word document: ${filename}`)
      const result = await mammoth.extractRawText({ buffer })
      return result.value.trim()
    }
    
    // Plain text files
    if (mimeType?.startsWith('text/') || 
        lowerFilename.endsWith('.txt') || 
        lowerFilename.endsWith('.md') || 
        lowerFilename.endsWith('.csv')) {
      console.log(`📄 Reading text file: ${filename}`)
      return buffer.toString('utf-8').trim()
    }
    
    // JSON files
    if (mimeType === 'application/json' || lowerFilename.endsWith('.json')) {
      console.log(`📊 Reading JSON file: ${filename}`)
      try {
        const jsonContent = JSON.parse(buffer.toString('utf-8'))
        return JSON.stringify(jsonContent, null, 2)
      } catch {
        return buffer.toString('utf-8').trim()
      }
    }
    
    // HTML files
    if (mimeType === 'text/html' || lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) {
      console.log(`🌐 Reading HTML file: ${filename}`)
      // Simple HTML tag removal (for basic cases)
      const text = buffer.toString('utf-8')
      return text.replace(/<[^>]*>/g, '').trim()
    }
    
    // Try to detect file type if not obvious
    const detectedType = await fileTypeFromBuffer(buffer)
    if (detectedType) {
      console.log(`🔍 Detected file type: ${detectedType.mime} for ${filename}`)
      
      // Handle detected PDF
      if (detectedType.mime === 'application/pdf') {
        try {
          const extractedText = await extractPdfText(buffer)
          console.log(`📄 Successfully extracted ${extractedText.length} characters from detected PDF: ${filename}`)
          return extractedText
        } catch (pdfError) {
          console.error(`Error extracting detected PDF text: ${pdfError}`)
          return `[PDF File detected - Error extracting text: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}]`
        }
      }
    }
    
    // For other file types, try reading as text (might work for some formats)
    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000)) // First 1KB only
    if (isPrintableText(text)) {
      console.log(`📄 Reading as text file: ${filename}`)
      return buffer.toString('utf-8').trim()
    }
    
    console.log(`⚠️  Unsupported file type for text extraction: ${filename} (${mimeType})`)
    return `[${filename} - ${mimeType} - ${buffer.length} bytes - Content not readable as text]`
    
  } catch (error) {
    console.error(`❌ Error extracting text from ${filename}:`, error)
    return `[Error extracting text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}]`
  }
}

/**
 * Check if text contains mostly printable characters
 */
function isPrintableText(text: string): boolean {
  const printableRegex = /^[\x20-\x7E\s]*$/
  const printableRatio = (text.match(printableRegex)?.[0]?.length || 0) / text.length
  return printableRatio > 0.8 // 80% printable characters
}

/**
 * Format attachment information for display
 */
export function formatAttachmentSummary(result: AttachmentProcessResult): string {
  if (result.attachments.length === 0) {
    return 'No attachments found.'
  }
  
  let summary = `\n\n=== ATTACHMENTS (${result.attachments.length}) ===\n`
  
  result.attachments.forEach((attachment, index) => {
    summary += `\n${index + 1}. ${attachment.filename}`
    summary += `\n   - Size: ${formatFileSize(attachment.size)}`
    summary += `\n   - Type: ${attachment.mimeType}`
    summary += `\n   - Author: ${attachment.author}`
    summary += `\n   - Created: ${new Date(attachment.created).toLocaleString()}`
    
    if (attachment.content && attachment.content.length > 0) {
      const contentPreview = attachment.content.length > 200 
        ? attachment.content.substring(0, 200) + '...'
        : attachment.content
      summary += `\n   - Content Preview: ${contentPreview.replace(/\n/g, ' ')}`
    }
    summary += '\n'
  })
  
  if (result.errors.length > 0) {
    summary += `\nErrors encountered:\n`
    result.errors.forEach(error => summary += `- ${error}\n`)
  }
  
  return summary
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
