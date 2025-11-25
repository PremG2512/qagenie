import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { ConnectionTestResult } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<ConnectionTestResult>> {
  try {
    const body = await request.json()
    const { apiKey, modelName } = body

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'API key is required'
        },
        { status: 400 }
      )
    }

    // Test OpenAI API with a simple completion request
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelName || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Reply with "OK" if you can see this message.'
          }
        ],
        max_tokens: 10,
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    )

    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'OpenAI connection successful',
        details: {
          model: response.data.model,
          response: response.data.choices[0].message?.content
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'OpenAI connection failed - Invalid response'
      })
    }
  } catch (error: any) {
    console.error('OpenAI connection test error:', error)
    
    let errorMessage = 'OpenAI connection failed'
    
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          errorMessage = 'Authentication failed - Check your API key'
          break
        case 403:
          errorMessage = 'Access forbidden - Check your API key permissions'
          break
        case 429:
          errorMessage = 'Rate limit exceeded - Try again later'
          break
        case 400:
          const errorData = error.response.data
          if (errorData?.error?.code === 'model_not_found') {
            errorMessage = `Model '${error.response.data.error.param}' not found - Check your model name`
          } else {
            errorMessage = `Bad request - ${errorData?.error?.message || 'Invalid request'}`
          }
          break
        default:
          errorMessage = `OpenAI connection failed - ${error.response.status}: ${error.response.statusText}`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - Check your internet connection'
    } else {
      errorMessage = error.message || 'Unknown error occurred'
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      { status: 500 }
    )
  }
}
