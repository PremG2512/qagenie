import { NextRequest, NextResponse } from 'next/server'
import { fetchAndProcessJiraAttachments } from '@/lib/jira-attachments'
import { getJiraConfig } from '@/lib/file-storage'

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json()

    if (!storyId) {
      return NextResponse.json({
        success: false,
        message: 'Story ID is required'
      }, { status: 400 })
    }

    console.log(`🧪 [TEST] Starting attachment test for story: ${storyId}`)

    // Get JIRA configuration
    const jiraConfig = getJiraConfig()
    if (!jiraConfig) {
      return NextResponse.json({
        success: false,
        message: 'JIRA configuration not found. Please configure JIRA settings first.'
      }, { status: 400 })
    }

    console.log(`🧪 [TEST] JIRA Config found - Domain: ${jiraConfig.domainUrl}`)

    // First, let's check if we can fetch the basic issue info
    const cleanDomainUrl = jiraConfig.domainUrl.replace(/\/+$/, '')
    const basicIssueUrl = `${cleanDomainUrl}/rest/api/2/issue/${storyId}?fields=key,summary,attachment`
    
    const authHeader = Buffer.from(`${jiraConfig.email}:${jiraConfig.apiKey}`).toString('base64')

    console.log(`🧪 [TEST] Fetching basic issue info from: ${basicIssueUrl}`)

    const axios = require('axios')
    const basicResponse = await axios.get(basicIssueUrl, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    })

    console.log(`🧪 [TEST] Basic issue response status: ${basicResponse.status}`)
    console.log(`🧪 [TEST] Issue key: ${basicResponse.data.key}`)
    console.log(`🧪 [TEST] Issue summary: ${basicResponse.data.fields.summary}`)
    
    const attachments = basicResponse.data.fields?.attachment || []
    console.log(`🧪 [TEST] Raw attachments array length: ${attachments.length}`)
    
    if (attachments.length > 0) {
      console.log(`🧪 [TEST] Attachment details:`)
      attachments.forEach((att: any, index: number) => {
        console.log(`  ${index + 1}. ${att.filename} (${att.size} bytes, ${att.mimeType})`)
        console.log(`     - ID: ${att.id}`)
        console.log(`     - Content URL: ${att.content}`)
        console.log(`     - Author: ${att.author?.displayName}`)
        console.log(`     - Created: ${att.created}`)
      })
    }

    // Now test the full attachment processing
    console.log(`🧪 [TEST] Starting full attachment processing...`)
    const attachmentResult = await fetchAndProcessJiraAttachments(jiraConfig, storyId)

    console.log(`🧪 [TEST] Attachment processing complete`)
    console.log(`🧪 [TEST] Success: ${attachmentResult.success}`)
    console.log(`🧪 [TEST] Processed attachments: ${attachmentResult.attachments.length}`)
    console.log(`🧪 [TEST] Errors: ${attachmentResult.errors.length}`)

    // Print detailed content for each attachment
    console.log(`\n📄 [CONTENT] Detailed attachment content:`)
    console.log(`=${'='.repeat(80)}`)
    attachmentResult.attachments.forEach((att, index) => {
      console.log(`\n📎 Attachment ${index + 1}: ${att.filename}`)
      console.log(`📊 Size: ${att.size} bytes | Type: ${att.mimeType}`)
      console.log(`📝 Content Length: ${att.content.length} characters`)
      console.log(`${'-'.repeat(60)}`)
      console.log(att.content)
      console.log(`${'-'.repeat(60)}`)
    })

    // Print combined text
    console.log(`\n🔗 [COMBINED] All attachments combined:`)
    console.log(`=${'='.repeat(80)}`)
    console.log(attachmentResult.combinedText)
    console.log(`=${'='.repeat(80)}\n`)

    return NextResponse.json({
      success: true,
      data: {
        storyId,
        basicIssueInfo: {
          key: basicResponse.data.key,
          summary: basicResponse.data.fields.summary,
          rawAttachmentCount: attachments.length,
          rawAttachments: attachments.map((att: any) => ({
            id: att.id,
            filename: att.filename,
            size: att.size,
            mimeType: att.mimeType,
            author: att.author?.displayName,
            created: att.created,
            contentUrl: att.content
          }))
        },
        attachmentProcessing: {
          success: attachmentResult.success,
          processedCount: attachmentResult.attachments.length,
          errors: attachmentResult.errors,
          combinedText: attachmentResult.combinedText,
          combinedTextLength: attachmentResult.combinedText.length,
          attachments: attachmentResult.attachments.map(att => ({
            filename: att.filename,
            size: att.size,
            mimeType: att.mimeType,
            contentLength: att.content.length,
            contentPreview: att.content.substring(0, 200),
            fullContent: att.content
          }))
        }
      }
    })

  } catch (error) {
    console.error('🧪 [TEST] Error during attachment test:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Attachment test failed',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}
