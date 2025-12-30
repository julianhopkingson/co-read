# Co-Read 📚

A mobile-first Progressive Web App (PWA) for shared reading and community discussion.

## Features

### 📖 EPUB Reading
- Upload and read EPUB books directly in the browser
- Adjustable font size and reading progress tracking
- Book cover extraction and display

### 💬 Community Discussion
- Create posts and discussions about books
- Comment and like system
- Book-linked discussion threads

### 👤 User Profiles
- Customizable avatar with image cropping
- Nickname and profile management
- Reading history tracking

### 🔐 Authentication
- Secure login with NextAuth.js
- Role-based access control (User/Admin)
- Admin panel for user management

### 🌐 Internationalization
- Multi-language support (English/中文)
- Dynamic language switching

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **EPUB Parsing**: epub.js
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed sample data (optional)
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-auth-secret"
```

## Project Structure

```
co-read/
├── app/
│   ├── (dashboard)/     # Main app pages (books, discuss, profile)
│   ├── admin/           # Admin panel
│   ├── reader/          # EPUB reader
│   └── api/             # API routes
├── components/          # React components
├── lib/                 # Utility functions & server actions
├── prisma/              # Database schema & migrations
├── locales/             # i18n translation files
└── public/              # Static assets
```

## License

MIT
