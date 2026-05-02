# Merit Gacha (ศาลพระภูมิศักดิ์สิทธิ์ Gacha)

A humorous, Thai-culture-inspired web application where users pray for wishes by submitting text requests and offering images. An AI deity evaluates the worthiness of offerings and responds with sarcastic or funny judgments in a gacha-style tier system.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Theme)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Storage**: Supabase Storage
- **AI Service**: Google AI Studio (Gemini Vision API)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Google AI Studio API key

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd merit-gacha
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.template` to `.env.local`
   - Fill in your Supabase credentials from [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)
   - Add your Google AI Studio API key from [AI Studio](https://aistudio.google.com/app/apikey)

```bash
cp .env.local.template .env.local
# Edit .env.local with your actual credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required environment variables (see `.env.local.template`):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GOOGLE_AI_API_KEY`: Your Google AI Studio API key
- `NEXT_PUBLIC_APP_URL`: Your application URL (default: http://localhost:3000)

## Project Structure

```
merit-gacha/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility functions and services
├── public/                 # Static assets
├── .env.local             # Environment variables (gitignored)
├── .env.local.template    # Environment variables template
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Features

- 🙏 Submit prayers with wishes and offering images
- 🎰 AI-powered gacha tier evaluation (SSR, SR, R, เกลือ)
- 🔐 Google OAuth authentication
- 📜 Prayer history tracking
- 🌙 Dark theme with Thai cultural aesthetics
- 🇹🇭 Full Thai language support

## License

MIT
