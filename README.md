# Recruiting Copilot

An agentic AI recruiting assistant that shortlists candidates, explains rankings, designs interview panels, schedules interviews, nudges pipeline owners, and exports audits.

## 🚀 Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Vercel AI SDK (agents & tools)
- **Database**: Supabase (Postgres + pgvector + Storage)
- **AI**: OpenAI GPT-4 (configurable for other providers)
- **Deployment**: Vercel (with cron jobs)

## ✨ Features

### 🤖 AI-Powered Workflows
- **Job Description Architect**: Transform hiring ideas into structured JDs
- **Resume Parser**: Extract structured data from resume text
- **Vector Search**: Find best-matching candidates using embeddings
- **Candidate Explanations**: AI-generated fit analysis with evidence
- **Interview Panel Design**: Optimal interviewer selection and question generation
- **Automated Nudges**: Smart pipeline health monitoring

### 📊 Core Functionality
- **Jobs Management**: Create, edit, and manage job openings
- **Candidate Database**: Upload, parse, and search candidate profiles
- **AI Shortlisting**: Rank candidates with detailed explanations
- **Interview Scheduling**: Design panels and find available slots
- **Pipeline Operations**: Monitor SLAs and automated notifications
- **Audit & Export**: Complete data export with audit trails

## 🏗 Architecture

```
recruiting-copilot/
├─ app/                        # Next.js App Router
│  ├─ api/hr-agent/           # Main orchestrator
│  ├─ api/tools/              # Individual AI tools
│  └─ [pages]/                # UI pages
├─ lib/                       # Core utilities
│  ├─ ai.ts                   # Vercel AI SDK setup
│  ├─ schemas.ts              # Zod validation schemas
│  ├─ vector.ts               # pgvector operations
│  └─ [adapters]/             # External service adapters
├─ components/                # React components
└─ supabase/                  # Database schema & migrations
```

## 🚀 Quickstart

### 1. Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- OpenAI API key

### 2. Setup Database
1. Create a new Supabase project
2. Enable the `vector` extension in the SQL editor:
   ```sql
   create extension vector;
   ```
3. Run the migration:
   ```bash
   # Copy and run the SQL from supabase/migrations/001_init.sql
   ```
4. (Optional) Load sample data:
   ```bash
   # Run supabase/seed/sample_data.sql
   ```

### 3. Environment Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your environment variables:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   ```

### 4. Install & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Usage Flow

1. **Create Jobs**: Use `/jobs/new` to generate professional job descriptions
2. **Add Candidates**: Upload resumes via `/candidates/upload` 
3. **Generate Shortlists**: Use `/shortlist` to find and rank top matches
4. **Schedule Interviews**: Design panels and book slots via `/schedule`
5. **Monitor Pipeline**: Track health and send nudges via `/ops`
6. **Export Data**: Download audit trails via `/audit`

## 🛠 API Tools

The application includes these AI-powered tools:

| Tool | Purpose | Input | Output |
|------|---------|-------|---------|
| `create-or-update-job` | Create job with embedding | Job data | Job record + ID |
| `parse-resume` | Extract structured data | Resume text | Candidate profile |
| `vector-search` | Find matching candidates | Job ID | Ranked candidates |
| `explain-candidate` | Generate fit analysis | Job + Candidate | Detailed explanation |
| `design-panel` | Create interview panel | Job + Candidate | Optimal panel |
| `find-slot` | Calendar availability | Attendees + duration | Available slots |
| `export-audit` | Data export | Date range | Audit logs |

## 🔧 Configuration

### AI Models
The app uses OpenAI by default but supports other providers via Vercel AI SDK:

```typescript
// lib/ai.ts
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

export const models = {
  small: openai('gpt-4o-mini'),
  normal: anthropic('claude-3-sonnet-20240229'), // Alternative
}
```

### Vector Search
Powered by pgvector with cosine similarity:
- Embeddings: OpenAI `text-embedding-3-large` (3072 dimensions)
- Index: IVFFlat with 100 lists
- Search function: `search_candidates(job_uuid, limit)`

### Security & Privacy
- **PII Redaction**: Automatic masking via `lib/redact.ts`
- **Audit Logging**: All actions logged to `audit_logs` table
- **Service Keys**: Server-side only, never exposed to client

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy! The cron job will be automatically configured.

### Self-Hosted
1. Build the application:
   ```bash
   npm run build
   ```
2. Set up cron jobs for automated nudges (see `vercel.json`)

## 📈 Monitoring

The app includes comprehensive logging:
- **Audit Logs**: All user actions and system events
- **Prompt Logs**: AI usage, token counts, and costs
- **Pipeline Metrics**: Candidate flow and bottlenecks

Export data via the `/audit` page for analysis.

## 🔮 Extension Ideas

- **ATS Integration**: Connect to Lever, Greenhouse, or other ATS
- **Calendar Integration**: Real Google/Outlook calendar booking
- **Email Automation**: Automated candidate communications
- **Video Interviews**: Integration with Zoom/Teams
- **Background Checks**: Automated verification workflows
- **Analytics Dashboard**: Advanced pipeline insights

## 📜 License

MIT License - feel free to use this as a starting point for your own recruiting tools!

## 🤝 Contributing

This is a demo/starter project, but contributions are welcome:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## 🆘 Support

For questions or issues:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review the `.cursorrules` for development guidelines
3. Ensure your Supabase setup matches the schema in `supabase/migrations/`

---

**Happy hiring! 🎉**
