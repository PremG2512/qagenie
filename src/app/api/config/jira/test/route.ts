import { NextRequest, NextResponse } from 'next/server'
import { testJiraConnection } from '@/lib/jira-test'
import { ConnectionTestResult } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<ConnectionTestResult>> {
  try {
    const body = await request.json()
    const { domainUrl, apiKey, email } = body

    if (!domainUrl || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Domain URL and API key are required'
        },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email address is required for JIRA Cloud authentication'
        },
        { status: 400 }
      )
    }

    // Use our unified JIRA test function
    const result = await testJiraConnection(domainUrl, email, apiKey)
    
    // Convert JiraTestResult to ConnectionTestResult format
    const connectionResult: ConnectionTestResult = {
      success: result.success,
      message: result.message,
      details: result.userInfo ? {
        user: result.userInfo.displayName,
        accountId: result.userInfo.accountId,
        email: result.userInfo.emailAddress,
        active: result.userInfo.active,
        timeZone: result.userInfo.timeZone
      } : undefined
    }

    return NextResponse.json(connectionResult)
    
  } catch (error: any) {
    console.error('JIRA connection test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'JIRA connection test failed'
      },
      { status: 500 }
    )
  }
}
