'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Database, Brain, CheckCircle, XCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { JiraConfig, OpenAiConfig, ConnectionTestResult } from '@/types'
import JiraTestComponent from './JiraTestComponent'
import { JiraTestResult } from '@/lib/jira-test'

export default function ConfigurationPage() {
  const [jiraConfig, setJiraConfig] = useState<JiraConfig>({
    domainUrl: '',
    apiKey: '',
    email: ''
  })
  const [openaiConfig, setOpenaiConfig] = useState<OpenAiConfig>({
    apiKey: '',
    modelName: 'gpt-4'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testingOpenai, setTestingOpenai] = useState(false)

  // Load existing configurations on component mount
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      // Load JIRA config
      const jiraResponse = await fetch('/api/config/jira')
      if (jiraResponse.ok) {
        const jiraData = await jiraResponse.json()
        if (jiraData.success && jiraData.data) {
          setJiraConfig(jiraData.data)
        }
      }

      // Load OpenAI config
      const openaiResponse = await fetch('/api/config/openai')
      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json()
        if (openaiData.success && openaiData.data) {
          setOpenaiConfig(openaiData.data)
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error)
    }
  }

  const saveJiraConfig = async () => {
    if (!jiraConfig.domainUrl || !jiraConfig.apiKey || !jiraConfig.email) {
      toast.error('Please fill in all required JIRA fields (Domain URL, API Key, and Email)')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/config/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jiraConfig),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('JIRA configuration saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save JIRA configuration')
      }
    } catch (error) {
      console.error('Error saving JIRA config:', error)
      toast.error('Failed to save JIRA configuration')
    } finally {
      setIsLoading(false)
    }
  }



  const saveOpenaiConfig = async () => {
    if (!openaiConfig.apiKey || !openaiConfig.modelName) {
      toast.error('Please fill in all required OpenAI fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/config/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiConfig),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('OpenAI configuration saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save OpenAI configuration')
      }
    } catch (error) {
      console.error('Error saving OpenAI config:', error)
      toast.error('Failed to save OpenAI configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const testOpenaiConnection = async () => {
    if (!openaiConfig.apiKey) {
      toast.error('Please fill in OpenAI API key first')
      return
    }

    setTestingOpenai(true)
    try {
      const response = await fetch('/api/config/openai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiConfig),
      })

      const data: ConnectionTestResult = await response.json()
      if (data.success) {
        toast.success('OpenAI connection successful!')
      } else {
        toast.error(data.message || 'OpenAI connection failed')
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error)
      toast.error('Failed to test OpenAI connection')
    } finally {
      setTestingOpenai(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configurations</h1>
        </div>
        <p className="text-gray-600">
          Configure your JIRA and OpenAI settings for test case generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JIRA Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">JIRA Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="jira-domain" className="block text-sm font-medium text-gray-700 mb-2">
                JIRA Domain URL <span className="text-red-500">*</span>
              </label>
              <input
                id="jira-domain"
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-company.atlassian.net"
                value={jiraConfig.domainUrl}
                onChange={(e) => setJiraConfig({ ...jiraConfig, domainUrl: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="jira-token" className="block text-sm font-medium text-gray-700 mb-2">
                JIRA API Token <span className="text-red-500">*</span>
              </label>
              <input
                id="jira-token"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your JIRA API token"
                value={jiraConfig.apiKey}
                onChange={(e) => setJiraConfig({ ...jiraConfig, apiKey: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="jira-email" className="block text-sm font-medium text-gray-700 mb-2">
                JIRA Email <span className="text-red-500">*</span>
              </label>
              <input
                id="jira-email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@company.com"
                value={jiraConfig.email}
                onChange={(e) => setJiraConfig({ ...jiraConfig, email: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={saveJiraConfig}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <JiraTestComponent
                domainUrl={jiraConfig.domainUrl}
                email={jiraConfig.email || ''}
                apiKey={jiraConfig.apiKey}
                onTestComplete={(result: JiraTestResult) => {
                  if (result.success) {
                    toast.success('JIRA connection successful!')
                  } else {
                    toast.error(result.message)
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* OpenAI Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">OpenAI Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key <span className="text-red-500">*</span>
              </label>
              <input
                id="openai-key"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-..."
                value={openaiConfig.apiKey}
                onChange={(e) => setOpenaiConfig({ ...openaiConfig, apiKey: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="openai-model" className="block text-sm font-medium text-gray-700 mb-2">
                Model Name <span className="text-red-500">*</span>
              </label>
              <select
                id="openai-model"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={openaiConfig.modelName}
                onChange={(e) => setOpenaiConfig({ ...openaiConfig, modelName: e.target.value })}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={saveOpenaiConfig}
                disabled={isLoading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <button
                onClick={testOpenaiConnection}
                disabled={testingOpenai}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {testingOpenai ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Setup Instructions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">JIRA Cloud Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Go to JIRA → Account Settings → Security</li>
              <li>Create an API token</li>
              <li>Copy your JIRA domain URL (e.g., https://company.atlassian.net)</li>
              <li>Enter your JIRA email address (required for Cloud authentication)</li>
              <li>Test the connection before saving</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900 mb-2">OpenAI Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Sign up at OpenAI Platform</li>
              <li>Generate an API key</li>
              <li>Choose your preferred model</li>
              <li>Ensure sufficient API credits</li>
              <li>Test the connection before saving</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
