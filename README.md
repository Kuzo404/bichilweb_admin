# BichilWeb Admin Panel

Next.js admin dashboard for managing BichilGlobus website content.

## Features

- **Products** — Financial products with loan calculator configuration
- **News** — Articles with categories and media uploads
- **Services** — Service pages with rich content blocks
- **Hero Slider** — Homepage banner management
- **CTA Slider** — Call-to-action sections
- **Floating Menu** — Quick-access navigation
- **Header/Footer** — Site-wide navigation configuration
- **Branches** — Branch office locations
- **HR** — Career/recruitment management
- **App Download** — Mobile app promotion
- **Exchange Rates** — Currency rate settings
- **Analytics** — Page view tracking dashboard
- **Page Builder** — Drag-and-drop content blocks (MN/EN)

## Setup

1. **Install Dependencies**:
    ```bash
    npm install
    ```

2. **Environment Variables**:
    ```bash
    cp .env.example .env.local
    ```
    Edit `.env.local` with your API URLs and credentials.

3. **Run Development Server**:
    ```bash
    npm run dev    # Starts on port 3001
    ```

## Tech Stack

- Next.js (App Router, Turbopack)
- Tailwind CSS
- Axios (API communication with Django backend)
- AWS S3 (media uploads)
