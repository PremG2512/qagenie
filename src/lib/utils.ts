import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateTestCaseId(storyId: string, index: number): string {
  return `TC-${storyId}-${(index + 1).toString().padStart(3, '0')}`
}

export function downloadCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0])
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let value = row[header]
        
        // Convert to string if not already
        if (value === null || value === undefined) {
          value = ''
        } else {
          value = String(value)
        }
        
        // Clean up line breaks and format for CSV
        value = value
          .replace(/\r\n/g, ' | ') // Replace Windows line breaks
          .replace(/\n/g, ' | ')   // Replace Unix line breaks
          .replace(/\r/g, ' | ')   // Replace Mac line breaks
        
        // Always wrap in quotes to handle commas, quotes, and other special characters
        return `"${value.replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  // Add BOM for proper Excel encoding
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link) // Ensure link is in DOM
  link.click()
  document.body.removeChild(link) // Clean up
  window.URL.revokeObjectURL(url)
}

export function downloadExcel(data: any[], filename: string, sheetName: string = 'Test Cases') {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Auto-size columns
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length))
  }))
  worksheet['!cols'] = colWidths
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  // Write the file
  XLSX.writeFile(workbook, filename)
}
