'use client'

import React, { useState } from 'react'
import { CheckCircle, XCircle, Loader, User, Clock, Shield } from 'lucide-react'

interface JiraTestResult {
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

interface JiraTestComponentProps {
  domainUrl: string
  email: string
  apiKey: string
  onTestComplete?: (result: JiraTestResult) => void
}

export default function JiraTestComponent({ 
  domainUrl, 
  email, 
  apiKey, 
  onTestComplete 
}: JiraTestComponentProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<JiraTestResult | null>(null)

  const handleTest = async () => {
    if (!domainUrl || !email || !apiKey) {
      const result: JiraTestResult = {
        success: false,
        message: 'Please fill in all JIRA fields (Domain URL, Email, and API Token)',
      }
      setTestResult(result)
      onTestComplete?.(result)
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      // Use the API endpoint instead of direct client-side call
      const response = await fetch('/api/jira-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domainUrl,
          email,
          apiKey
        })
      })

      const result = await response.json()
      setTestResult(result)
      onTestComplete?.(result)
    } catch (error) {
      const result: JiraTestResult = {
        success: false,
        message: 'Connection test failed',
        error: {
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }
      setTestResult(result)
      onTestComplete?.(result)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={isTesting || !domainUrl || !email || !apiKey}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isTesting ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            <span>Testing Connection...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Test JIRA Connection</span>
          </>
        )}
      </button>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h4 className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
              </h4>
              
              <p className={`text-sm mt-1 ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>

              {/* Success Details */}
              {testResult.success && testResult.userInfo && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <User className="h-4 w-4" />
                    <span className="font-medium">User:</span>
                    <span>{testResult.userInfo.displayName}</span>
                    {testResult.userInfo.active && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                        Active
                      </span>
                    )}
                  </div>
                  
                  {testResult.userInfo.emailAddress && (
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Email:</span>
                      <span>{testResult.userInfo.emailAddress}</span>
                    </div>
                  )}
                  
                  {testResult.userInfo.timeZone && (
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Timezone:</span>
                      <span>{testResult.userInfo.timeZone}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-green-600 mt-2">
                    Account ID: {testResult.userInfo.accountId}
                  </div>
                </div>
              )}

              {/* Error Details */}
              {!testResult.success && testResult.error && (
                <div className="mt-3">
                  {testResult.error.status && (
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Status:</span> {testResult.error.status} - {testResult.error.statusText}
                    </div>
                  )}
                  
                  {testResult.error.details && (
                    <div className="text-sm text-red-600 mt-1 p-2 bg-red-100 rounded border">
                      <span className="font-medium">Details:</span> {testResult.error.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
