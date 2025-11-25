'use client'

import React, { useState } from 'react'
import { Bug, Play, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function AttachmentTestPage() {
  const [storyId, setStoryId] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    if (!storyId.trim()) {
      alert('Please enter a Story ID')
      return
    }

    setIsTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-attachments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storyId: storyId.trim() })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JIRA Attachment Test</h1>
          <p className="text-gray-600">Test JIRA API attachment fetching and processing</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bug className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Test Story Attachments</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter JIRA Story ID (e.g., SCRUM-1)"
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
              />
            </div>

            <button
              onClick={handleTest}
              disabled={isTesting || !storyId.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isTesting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Testing Attachments...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Test Attachment Fetching</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-6 rounded-lg border ${
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
                  {result.success ? 'Test Results' : 'Test Failed'}
                </h3>
                
                {!result.success && (
                  <p className="text-sm mt-1 text-red-700">{result.message}</p>
                )}

                {result.success && result.data && (
                  <div className="mt-4 space-y-4">
                    {/* Basic Issue Info */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">📋 Basic Issue Info</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Key:</strong> {result.data.basicIssueInfo.key}</div>
                        <div><strong>Summary:</strong> {result.data.basicIssueInfo.summary}</div>
                        <div><strong>Raw Attachments Found:</strong> {result.data.basicIssueInfo.rawAttachmentCount}</div>
                      </div>
                      
                      {result.data.basicIssueInfo.rawAttachments.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-800 mb-2">Raw Attachment Details:</h5>
                          {result.data.basicIssueInfo.rawAttachments.map((att: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-2 rounded mb-2 text-xs">
                              <div><strong>Filename:</strong> {att.filename}</div>
                              <div><strong>Size:</strong> {att.size} bytes</div>
                              <div><strong>Type:</strong> {att.mimeType}</div>
                              <div><strong>Author:</strong> {att.author}</div>
                              <div><strong>Created:</strong> {att.created}</div>
                              <div><strong>Content URL:</strong> <code className="bg-gray-200 px-1 rounded">{att.contentUrl}</code></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Attachment Processing Results */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">🔄 Attachment Processing Results</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Processing Success:</strong> {result.data.attachmentProcessing.success ? 'Yes' : 'No'}</div>
                        <div><strong>Processed Count:</strong> {result.data.attachmentProcessing.processedCount}</div>
                        <div><strong>Combined Text Length:</strong> {result.data.attachmentProcessing.combinedTextLength}</div>
                        <div><strong>Errors:</strong> {result.data.attachmentProcessing.errors.length}</div>
                      </div>
                      
                      {result.data.attachmentProcessing.errors.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-red-800 mb-2">Errors:</h5>
                          {result.data.attachmentProcessing.errors.map((error: string, index: number) => (
                            <div key={index} className="bg-red-50 p-2 rounded mb-1 text-xs text-red-700">
                              {error}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {result.data.attachmentProcessing.attachments.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-800 mb-2">Processed Attachments:</h5>
                          {result.data.attachmentProcessing.attachments.map((att: any, index: number) => (
                            <div key={index} className="bg-blue-50 p-2 rounded mb-2 text-xs">
                              <div><strong>Filename:</strong> {att.filename}</div>
                              <div><strong>Content Length:</strong> {att.contentLength} characters</div>
                              <div><strong>Content Preview:</strong></div>
                              <div className="bg-white p-1 rounded mt-1 font-mono text-xs">
                                {att.contentPreview}...
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw Debug Info */}
                {result.success && (
                  <div className="mt-4 p-3 bg-gray-100 rounded border">
                    <h4 className="font-medium text-gray-800 mb-2">🔍 Raw Debug Data:</h4>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-60">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
