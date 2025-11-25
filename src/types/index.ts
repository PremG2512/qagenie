export interface JiraConfig {
  id?: number
  domainUrl: string
  apiKey: string
  email?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface OpenAiConfig {
  id?: number
  apiKey: string
  modelName: string
  createdAt?: Date
  updatedAt?: Date
}

export interface GeneratedTestcase {
  id?: number
  storyId: string
  testCaseId: string
  name: string
  description: string
  type: TestCaseType
  steps: string
  expectedResult: string
  createdAt?: Date
}

export type TestCaseType = 'Positive' | 'Negative' | 'API' | 'UI' | 'Performance' | 'Security' | 'Integration' | 'E2E'

export interface JiraStory {
  id: string
  key: string
  summary: string
  description: string
  acceptanceCriteria?: string
  status: string
  assignee?: string
}

export interface TestCaseGenerationRequest {
  storyIds: string[]
  testCaseTypes: TestCaseType[]
  includeAttachments?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: any
}
