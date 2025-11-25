import { NextRequest, NextResponse } from 'next/server'
import { saveJiraConfig, getJiraConfig } from '@/lib/file-storage'
import { ApiResponse, JiraConfig } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<JiraConfig>>> {
  try {
    const config = getJiraConfig()

    if (!config) {
      return NextResponse.json({
        success: true,
        data: undefined,
        message: 'No JIRA configuration found'
      })
    }

    // Don't return the API key in the response for security
    const safeConfig: JiraConfig = {
      id: config.id,
      domainUrl: config.domainUrl,
      apiKey: '***', // Masked for security
      email: config.email || undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: safeConfig
    })
  } catch (error) {
    console.error('Error fetching JIRA config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch JIRA configuration'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<JiraConfig>>> {
  try {
    const body = await request.json()
    const { domainUrl, apiKey, email } = body

    if (!domainUrl || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain URL and API key are required'
        },
        { status: 400 }
      )
    }

    // Save config using file storage
    const config = saveJiraConfig({
      domainUrl,
      apiKey,
      email: email || undefined
    })

    // Return config without API key
    const safeConfig: JiraConfig = {
      id: config.id,
      domainUrl: config.domainUrl,
      apiKey: '***',
      email: config.email || undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: safeConfig,
      message: 'JIRA configuration saved successfully'
    })
  } catch (error) {
    console.error('Error saving JIRA config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save JIRA configuration'
      },
      { status: 500 }
    )
  }
}
