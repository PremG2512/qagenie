'use client'

import React, { useState } from 'react'
import { Bug, Play, CheckCircle, XCircle, Loader } from 'lucide-react'

interface DebugResult {
  success: boolean
  message: string
  userInfo?: any
  debug?: any
}

export default function DebugJiraTest() {
  const [domainUrl, setDomainUrl] = useState('')
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<DebugResult | null>(null)

  const handleTest = async () => {
    setIsTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug/jira-test', {
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

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        debug: { clientError: true }
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bug className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Direct JIRA API Test</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JIRA Domain URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourcompany.atlassian.net"
              value={domainUrl}
              onChange={(e) => setDomainUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Token
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your JIRA API token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <button
            onClick={handleTest}
            disabled={isTesting || !domainUrl || !email || !apiKey}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isTesting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Run Debug Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`mt-6 p-6 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Test Successful! 🎉' : 'Test Failed ❌'}
              </h3>
              
              <p className={`text-sm mt-1 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>

              {/* User Info */}
              {result.success && result.userInfo && (
                <div className="mt-4 p-3 bg-green-100 rounded border">
                  <h4 className="font-medium text-green-800 mb-2">👤 User Information:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Name:</strong> {result.userInfo.displayName}</div>
                    <div><strong>Account ID:</strong> {result.userInfo.accountId}</div>
                    {result.userInfo.emailAddress && (
                      <div><strong>Email:</strong> {result.userInfo.emailAddress}</div>
                    )}
                    <div><strong>Active:</strong> {result.userInfo.active ? 'Yes' : 'No'}</div>
                    {result.userInfo.timeZone && (
                      <div><strong>Timezone:</strong> {result.userInfo.timeZone}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Debug Info */}
              {result.debug && (
                <div className="mt-4 p-3 bg-gray-100 rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">🔍 Debug Information:</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-60">
                    {JSON.stringify(result.debug, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Debug Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This test bypasses the component and calls JIRA directly</li>
          <li>• Check the browser console and terminal for detailed logs</li>
          <li>• Use your actual JIRA credentials that worked in terminal</li>
          <li>• Look at the debug information for specific error details</li>
        </ul>
      </div>
    </div>
  )
}
