'use client'

import React, { useState } from 'react'
import { TestTube2, Download, Loader, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { TestCaseType, GeneratedTestcase, TestCaseGenerationRequest } from '@/types'
import { downloadCSV, downloadExcel } from '@/lib/utils'

const testCaseTypes: TestCaseType[] = [
  'Positive', 'Negative', 'API', 'UI', 'Performance', 'Security', 'Integration', 'E2E'
]

export default function TestCaseBuilder() {
  const [storyIds, setStoryIds] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<TestCaseType[]>(['Positive', 'Negative'])
  const [testCases, setTestCases] = useState<GeneratedTestcase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [includeAttachments, setIncludeAttachments] = useState(true)

  const handleTypeToggle = (type: TestCaseType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleGenerate = async () => {
    if (!storyIds.trim()) {
      toast.error('Please enter at least one Story ID')
      return
    }

    if (selectedTypes.length === 0) {
      toast.error('Please select at least one test case type')
      return
    }

    const storyIdList = storyIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0)

    if (storyIdList.length === 0) {
      toast.error('Please enter valid Story IDs')
      return
    }

    setIsLoading(true)
    
    try {
      const request: TestCaseGenerationRequest = {
        storyIds: storyIdList,
        testCaseTypes: selectedTypes,
        includeAttachments: includeAttachments
      }

      const response = await fetch('/api/testcases/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (data.success) {
        setTestCases(data.data)
        toast.success(`Generated ${data.data.length} test cases successfully!`)
      } else {
        toast.error(data.error || 'Failed to generate test cases')
      }
    } catch (error) {
      console.error('Error generating test cases:', error)
      toast.error('Failed to generate test cases. Please check your configurations.')
    } finally {
      setIsLoading(false)
    }
  }

  const prepareDownloadData = () => {
    return testCases.map((tc, index) => ({
      'Test Case ID': tc.testCaseId,
      'Story ID': tc.storyId,
      'Test Case Name': tc.name,
      'Description': tc.description,
      'Type': tc.type,
      'Priority': 'Medium', // Default priority
      'Steps': tc.steps,
      'Expected Result': tc.expectedResult,
      'Preconditions': '', // Empty for manual entry
      'Test Data': '', // Empty for manual entry
      'Status': 'Draft', // Default status
      'Created At': tc.createdAt ? new Date(tc.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      'Created By': 'BuilderQA Suite',
      'Notes': 'Auto-generated test case'
    }))
  }

  const handleDownloadCSV = () => {
    if (testCases.length === 0) {
      toast.error('No test cases to download')
      return
    }

    const csvData = prepareDownloadData()
    downloadCSV(csvData, `test-cases-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('CSV file downloaded successfully!')
  }

  const handleDownloadExcel = () => {
    if (testCases.length === 0) {
      toast.error('No test cases to download')
      return
    }

    const excelData = prepareDownloadData()
    downloadExcel(excelData, `test-cases-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Excel file downloaded successfully!')
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <TestTube2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Test Case Builder</h1>
        </div>
        <p className="text-gray-600">
          Generate manual test cases automatically from JIRA User Stories using AI
        </p>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Test Cases</h2>
        
        {/* Story IDs Input */}
        <div className="mb-6">
          <label htmlFor="story-ids" className="block text-sm font-medium text-gray-700 mb-2">
            Story IDs
          </label>
          <textarea
            id="story-ids"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter Story IDs separated by commas (e.g., PROJ-101, PROJ-102, PROJ-103)"
            value={storyIds}
            onChange={(e) => setStoryIds(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter one or multiple JIRA Story IDs separated by commas
          </p>
        </div>

        {/* Test Case Types */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Test Case Types
          </label>
          <div className="flex flex-wrap gap-2">
            {testCaseTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedTypes.includes(type)
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Selected: {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Attachment Processing Option */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="include-attachments"
              checked={includeAttachments}
              onChange={(e) => setIncludeAttachments(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include-attachments" className="text-sm font-medium text-gray-700">
              Process JIRA attachments and include in test case generation
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500 ml-7">
            When enabled, JIRA attachments (PDFs, Word docs, images, etc.) will be downloaded and their content analyzed to create more comprehensive test cases. This may increase processing time.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Generating Test Cases...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Fetch & Generate Test Cases</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {testCases.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Generated Test Cases</h2>
                <p className="text-gray-600 mt-1">{testCases.length} test cases generated</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Story ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {testCase.testCaseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.storyId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">{testCase.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        testCase.type === 'Positive' ? 'bg-green-100 text-green-800' :
                        testCase.type === 'Negative' ? 'bg-red-100 text-red-800' :
                        testCase.type === 'API' ? 'bg-blue-100 text-blue-800' :
                        testCase.type === 'UI' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {testCase.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      <div className="line-clamp-3">{testCase.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      <div className="line-clamp-3 whitespace-pre-line">{testCase.steps}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      <div className="line-clamp-3">{testCase.expectedResult}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
