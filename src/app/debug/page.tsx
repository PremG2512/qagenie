import DebugJiraTest from '@/components/DebugJiraTest'
import AppLayout from '@/components/AppLayout'

export default function DebugPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 JIRA Debug Test</h1>
        <p className="text-gray-600 mb-8">
          Direct JIRA API testing with detailed debugging information
        </p>
        <DebugJiraTest />
      </div>
    </AppLayout>
  )
}
