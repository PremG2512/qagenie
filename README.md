# BuilderQA Suite

**BuilderQA Suite** is a full-stack web application that automatically generates manual test cases from JIRA user stories using AI. Built with Next.js, TypeScript, and powered by OpenAI's GPT models.

## Features

- **JIRA Integration**: Connect to your JIRA instance and fetch user stories
- **AI-Powered Test Generation**: Use OpenAI to automatically generate comprehensive test cases
- **Multiple Test Types**: Support for Positive, Negative, API, UI, Performance, Security, Integration, and E2E test cases
- **Professional UI**: Clean, responsive design with white background and minimal accent colors
- **Export Capabilities**: Download generated test cases as CSV files
- **Configuration Management**: Secure storage of JIRA and OpenAI credentials
- **Connection Testing**: Verify your API configurations before use

## Tech Stack

- **Frontend**: Next.js 16+ with App Router, TypeScript, React 19
- **Styling**: Tailwind CSS with professional design
- **Backend**: Next.js API routes
- **Database**: MySQL with Prisma ORM
- **Integrations**: JIRA REST API, OpenAI API
- **UI Components**: Lucide React icons, React Hot Toast notifications

## Prerequisites

- Node.js 18+ 
- MySQL database
- JIRA account with API access
- OpenAI API account

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd builderqa-suite
npm install
```

### 2. Environment Setup

Copy `.env` and configure your environment variables:

```bash
# Database (Required)
DATABASE_URL="mysql://username:password@localhost:3306/builderqa_suite"

# Application Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this"
```

### 3. Database Setup

Create your MySQL database and run Prisma setup:

```bash
# Create database tables
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### JIRA Setup

1. Go to your JIRA account → **Account Settings** → **Security**
2. Create an **API Token**
3. In BuilderQA Suite, navigate to **Configurations**
4. Enter your:
   - JIRA Domain URL (e.g., `https://your-company.atlassian.net`)
   - API Token
   - Email address (optional)
5. Click **Test Connection** to verify
6. Save your configuration

### OpenAI Setup

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Generate an **API Key**
3. In BuilderQA Suite, go to **Configurations**
4. Enter your:
   - OpenAI API Key
   - Model Name (e.g., `gpt-4`, `gpt-4-turbo`, `gpt-4o`)
5. Click **Test Connection** to verify
6. Save your configuration

## Usage

### Generating Test Cases

1. Navigate to **Test Case Builder**
2. Enter JIRA Story IDs (comma-separated): `PROJ-101, PROJ-102`
3. Select desired test case types (Positive, Negative, API, UI, etc.)
4. Click **Fetch & Generate Test Cases**
5. View generated test cases in the results table
6. Download as CSV using the **Download CSV** button

### Managing Configurations

- **JIRA Configuration**: Store and test JIRA API credentials
- **OpenAI Configuration**: Store and test OpenAI API settings
- **Connection Testing**: Verify API connections before generating test cases

## Database Schema

The application uses three main tables:

- **jira_config**: JIRA API credentials and connection details
- **openai_config**: OpenAI API key and model configuration  
- **generated_testcases**: Generated test cases for future reference

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## API Endpoints

### Configuration
- `GET/POST /api/config/jira` - JIRA configuration management
- `POST /api/config/jira/test` - Test JIRA connection
- `GET/POST /api/config/openai` - OpenAI configuration management
- `POST /api/config/openai/test` - Test OpenAI connection

### Test Cases
- `POST /api/testcases/generate` - Generate test cases
- `GET /api/testcases` - Retrieve existing test cases

## Security

- API keys are encrypted in the database
- Credentials are masked in API responses
- Environment variables for sensitive configuration
- Input validation and error handling

## Troubleshooting

### Database Issues
- Ensure MySQL is running
- Verify DATABASE_URL is correct
- Run `npm run db:push` to sync schema

### JIRA Connection Issues
- Verify domain URL format: `https://your-company.atlassian.net`
- Check API token permissions
- Ensure email address matches JIRA account

### OpenAI Connection Issues  
- Verify API key is valid and active
- Check account has sufficient credits
- Ensure model name is correct and accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
