import { NextRequest, NextResponse } from 'next/server'
import { testJiraConnection } from '@/lib/jira-test'

export async function POST(request: NextRequest) {
  try {
    const { domainUrl, email, apiKey } = await request.json()

    if (!domainUrl || !email || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: domainUrl, email, and apiKey'
      }, { status: 400 })
    }

    console.log(`🔍 [API] Testing JIRA connection for: ${email}@${domainUrl}`)

    const result = await testJiraConnection(domainUrl, email, apiKey)
    
    console.log(`✅ [API] JIRA test result:`, result.success ? 'SUCCESS' : 'FAILED')
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ [API] JIRA test error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error during JIRA connection test',
      error: {
        details: error instanceof Error ? error.message : 'Unknown server error'
      }
    }, { status: 500 })
  }
}
