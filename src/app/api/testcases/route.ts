import { NextRequest, NextResponse } from 'next/server'
import { getTestCases } from '@/lib/file-storage'
import { ApiResponse, GeneratedTestcase } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<GeneratedTestcase[]>>> {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const allTestCases = getTestCases(storyId || undefined)
    
    // Apply pagination
    const testCases = allTestCases
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA // Descending order
      })
      .slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: testCases,
      message: `Found ${testCases.length} test cases`
    })
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test cases'
      },
      { status: 500 }
    )
  }
}
