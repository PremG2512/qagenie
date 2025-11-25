import { NextRequest, NextResponse } from 'next/server'
import { saveOpenAiConfig, getOpenAiConfig } from '@/lib/file-storage'
import { ApiResponse, OpenAiConfig } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<OpenAiConfig>>> {
  try {
    const config = getOpenAiConfig()

    if (!config) {
      return NextResponse.json({
        success: true,
        data: undefined,
        message: 'No OpenAI configuration found'
      })
    }

    // Don't return the API key in the response for security
    const safeConfig: OpenAiConfig = {
      id: config.id,
      apiKey: '***', // Masked for security
      modelName: config.modelName,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: safeConfig
    })
  } catch (error) {
    console.error('Error fetching OpenAI config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch OpenAI configuration'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<OpenAiConfig>>> {
  try {
    const body = await request.json()
    const { apiKey, modelName } = body

    if (!apiKey || !modelName) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key and model name are required'
        },
        { status: 400 }
      )
    }

    // Save config using file storage
    const config = saveOpenAiConfig({
      apiKey,
      modelName
    })

    // Return config without API key
    const safeConfig: OpenAiConfig = {
      id: config.id,
      apiKey: '***',
      modelName: config.modelName,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: safeConfig,
      message: 'OpenAI configuration saved successfully'
    })
  } catch (error) {
    console.error('Error saving OpenAI config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save OpenAI configuration'
      },
      { status: 500 }
    )
  }
}
