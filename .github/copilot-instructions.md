# Copilot Instructions for BuilderQA Suite

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack Next.js TypeScript application called "BuilderQA Suite" that integrates with JIRA and OpenAI APIs to automatically generate manual test cases based on user stories.

## Tech Stack
- Frontend: Next.js 14+ with App Router, TypeScript, React
- Styling: Tailwind CSS with clean, professional white background design
- Backend: Next.js API routes
- Database: MySQL with Prisma ORM
- Integrations: JIRA REST API, OpenAI API

## Key Features
1. **Configuration Management**: Store and test JIRA and OpenAI API credentials
2. **Test Case Generation**: Fetch JIRA user stories and generate test cases using OpenAI
3. **Export Capabilities**: Download generated test cases as CSV/Excel

## Coding Guidelines
- Use TypeScript interfaces for all API responses and data structures
- Implement proper error handling with user-friendly messages
- Use React hooks and modern patterns
- Follow Next.js App Router conventions
- Use Prisma for all database operations
- Implement loading states and form validation
- Use Tailwind CSS classes for styling with professional, clean design
- Include proper CORS and security headers

## Database Schema
- jira_config: Store JIRA API credentials and connection details
- openai_config: Store OpenAI API key and model configuration
- generated_testcases: Store generated test cases for future reference

## API Integration Patterns
- Always validate API credentials before storing
- Implement connection testing endpoints
- Use environment variables for sensitive data
- Handle API rate limits and errors gracefully
