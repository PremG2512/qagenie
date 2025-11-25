import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domainUrl, email, apiKey } = await request.json()
    
    console.log('🔍 Direct JIRA Test Started...')
    console.log(`Domain: ${domainUrl}`)
    console.log(`Email: ${email}`)
    console.log(`Token: ${apiKey ? apiKey.substring(0, 6) + '...' : 'MISSING'}`)
    
    if (!domainUrl || !email || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        debug: { domainUrl: !!domainUrl, email: !!email, apiKey: !!apiKey }
      })
    }

    // Clean domain URL
    const cleanUrl = domainUrl.replace(/\/+$/, '')
    const testUrl = `${cleanUrl}/rest/api/2/myself`
    
    console.log(`📡 Testing URL: ${testUrl}`)
    
    // Create Basic Auth header
    const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64')
    const authHeader = `Basic ${credentials}`
    
    console.log(`🔐 Auth header created (length: ${authHeader.length})`)
    
    // Make the request using native fetch
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add a timeout
      signal: AbortSignal.timeout(15000)
    })
    
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ Error response:`, errorText)
      
      return NextResponse.json({
        success: false,
        message: `JIRA API Error: ${response.status} ${response.statusText}`,
        debug: {
          status: response.status,
          statusText: response.statusText,
          url: testUrl,
          errorBody: errorText
        }
      })
    }
    
    const data = await response.json()
    console.log(`✅ Success! User:`, data.displayName || data.name)
    
    return NextResponse.json({
      success: true,
      message: 'JIRA connection successful!',
      userInfo: {
        displayName: data.displayName || data.name,
        accountId: data.accountId,
        emailAddress: data.emailAddress,
        active: data.active,
        timeZone: data.timeZone
      },
      debug: {
        url: testUrl,
        status: response.status
      }
    })
    
  } catch (error: any) {
    console.error('🚨 JIRA Test Error:', error)
    
    let errorMessage = 'Unknown error'
    let errorType = 'unknown'
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - JIRA server took too long to respond'
      errorType = 'timeout'
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Network error - Cannot reach JIRA server'
      errorType = 'network'
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found - Check your JIRA URL'
      errorType = 'dns'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - JIRA server rejected connection'
      errorType = 'connection'
    } else {
      errorMessage = error.message || 'Unexpected error occurred'
      errorType = 'other'
    }
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      debug: {
        errorType,
        errorName: error.name,
        errorCode: error.code,
        errorMessage: error.message,
        stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
      }
    }, { status: 500 })
  }
}
