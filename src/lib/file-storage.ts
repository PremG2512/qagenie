import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { JiraConfig, OpenAiConfig, GeneratedTestcase } from '@/types'

const DATA_DIR = join(process.cwd(), 'data')
const JIRA_CONFIG_FILE = join(DATA_DIR, 'jira-config.json')
const OPENAI_CONFIG_FILE = join(DATA_DIR, 'openai-config.json')
const TESTCASES_FILE = join(DATA_DIR, 'testcases.json')

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// JIRA Config Storage
export function saveJiraConfig(config: JiraConfig): JiraConfig {
  const configWithMetadata = {
    ...config,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  writeFileSync(JIRA_CONFIG_FILE, JSON.stringify(configWithMetadata, null, 2))
  return configWithMetadata
}

export function getJiraConfig(): JiraConfig | null {
  if (!existsSync(JIRA_CONFIG_FILE)) {
    return null
  }
  try {
    const data = readFileSync(JIRA_CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

// OpenAI Config Storage
export function saveOpenAiConfig(config: OpenAiConfig): OpenAiConfig {
  const configWithMetadata = {
    ...config,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  writeFileSync(OPENAI_CONFIG_FILE, JSON.stringify(configWithMetadata, null, 2))
  return configWithMetadata
}

export function getOpenAiConfig(): OpenAiConfig | null {
  if (!existsSync(OPENAI_CONFIG_FILE)) {
    return null
  }
  try {
    const data = readFileSync(OPENAI_CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

// Test Cases Storage
export function saveTestCases(testCases: GeneratedTestcase[]): GeneratedTestcase[] {
  const existingTestCases = getTestCases()
  const testCasesWithMetadata = testCases.map((tc, index) => ({
    ...tc,
    id: existingTestCases.length + index + 1,
    createdAt: new Date()
  }))
  
  const allTestCases = [...existingTestCases, ...testCasesWithMetadata]
  writeFileSync(TESTCASES_FILE, JSON.stringify(allTestCases, null, 2))
  return testCasesWithMetadata
}

export function getTestCases(storyId?: string): GeneratedTestcase[] {
  if (!existsSync(TESTCASES_FILE)) {
    return []
  }
  try {
    const data = readFileSync(TESTCASES_FILE, 'utf-8')
    const allTestCases: GeneratedTestcase[] = JSON.parse(data)
    
    if (storyId) {
      return allTestCases.filter(tc => tc.storyId === storyId)
    }
    
    return allTestCases
  } catch {
    return []
  }
}
