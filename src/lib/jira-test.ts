import axios from 'axios'

export interface JiraTestResult {
  success: boolean
  message: string
  userInfo?: {
    displayName: string
    accountId: string
    emailAddress?: string
    active: boolean
    timeZone?: string
  }
  error?: {
    status?: number
    statusText?: string
    details?: string
  }
}

export async function testJiraConnection(
  domainUrl: string, 
  email: string, 
  apiToken: string
): Promise<JiraTestResult> {
  try {
    // Clean up domain URL
    const cleanDomainUrl = domainUrl.replace(/\/+$/, '')
    const testUrl = `${cleanDomainUrl}/rest/api/2/myself`
    
    // Create auth header
    const authHeader = Buffer.from(`${email}:${apiToken}`).toString('base64')
    
    console.log(`🔍 Testing JIRA connection to: ${testUrl}`)
    
    const response = await axios.get(testUrl, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    })
    
    if (response.status === 200) {
      return {
        success: true,
        message: 'JIRA connection successful!',
        userInfo: {
          displayName: response.data.displayName || response.data.name,
          accountId: response.data.accountId,
          emailAddress: response.data.emailAddress,
          active: response.data.active,
          timeZone: response.data.timeZone
        }
      }
    } else {
      return {
        success: false,
        message: `Unexpected response status: ${response.status}`,
        error: {
          status: response.status,
          statusText: response.statusText
        }
      }
    }
    
  } catch (error: any) {
    console.error('JIRA connection test error:', error)
    
    let errorMessage = 'JIRA connection failed'
    let errorDetails = ''
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const statusText = error.response.statusText
      
      switch (status) {
        case 401:
          errorMessage = 'Authentication failed - Check your email and API token'
          errorDetails = 'Verify your email address and ensure your API token is valid and not expired'
          break
        case 403:
          errorMessage = 'Access forbidden - Check your permissions'
          errorDetails = 'Your account may not have sufficient permissions to access JIRA API'
          break
        case 404:
          errorMessage = 'JIRA instance not found - Check your domain URL'
          errorDetails = 'Ensure your domain URL is correct (e.g., https://company.atlassian.net)'
          break
        case 429:
          errorMessage = 'Rate limit exceeded - Try again later'
          errorDetails = 'JIRA API rate limit reached, please wait before trying again'
          break
        default:
          errorMessage = `JIRA connection failed - ${status}: ${statusText}`
          errorDetails = error.response.data?.errorMessages?.[0] || 'Unknown server error'
      }
      
      return {
        success: false,
        message: errorMessage,
        error: {
          status,
          statusText,
          details: errorDetails
        }
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - Check your domain URL and internet connection'
      errorDetails = 'Unable to reach JIRA server, verify your domain URL and network connection'
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found - Check your JIRA URL'
      errorDetails = 'The domain URL could not be resolved, verify it is correct'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout - JIRA server not responding'
      errorDetails = 'The request timed out, JIRA server may be slow or unreachable'
    } else {
      errorMessage = error.message || 'Unknown error occurred'
      errorDetails = 'An unexpected error occurred during the connection test'
    }
    
    return {
      success: false,
      message: errorMessage,
      error: {
        details: errorDetails
      }
    }
  }
}
