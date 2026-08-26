# 🏠 ijara.uz - Platform for Renting Real Estate in Uzbekistan

![ijara.uz Banner](https://ijara.uz/banner.jpg)

**ijara.uz** is a modern platform for searching and renting real estate in Uzbekistan. The service provides users with a convenient catalog of apartments and houses with advanced filtering capabilities, integration with interactive maps, and a personal account for managing listings.

## 🌟 Features

### 🔍 **Search & Catalog**
- Advanced filtering by price, number of rooms, area, and location
- Integration with interactive maps (Leaflet + clustering)
- Detailed information about each property with photo galleries
- Search with debounce for better UX

### 🏢 **User Experience**
- Personal account with favorites and listing management
- Adding and editing property listings
- Skeleton loaders for smooth loading
- Responsive design for all devices
- Dark/light theme support

### 🔒 **Security**
- JWT authentication with HttpOnly cookies
- Row-Level Security (RLS) in PostgreSQL
- Rate limiting for API endpoints
- Input sanitization to prevent XSS attacks
- Secure file uploads with validation
- Content Security Policy (CSP) headers
- Cloudflare Turnstile captcha integration

## 🛠 Tech Stack

### **Frontend**
- [Next.js 14+](https://nextjs.org/) (App Router)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [React Query](https://tanstack.com/query/latest) for data fetching
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form validation
- [Lucide React](https://lucide.dev/) for icons

### **Backend & Security**
- [PostgreSQL](https://www.postgresql.org/) with Row-Level Security (RLS)
- [Axios](https://axios-http.com/) with interceptors (Refresh Token)
- [JSON Web Tokens](https://jwt.io/) (JWT) with HttpOnly cookies
- [Upstash Redis](https://upstash.com/) for rate limiting
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) for captcha
- [DOMPurify](https://github.com/cure53/DOMPurify) for XSS protection
- Security headers (CSP, HSTS, X-Frame-Options)

### **Infrastructure**
- [Vercel](https://vercel.com/) for hosting
- [Cloudflare](https://www.cloudflare.com/) for CDN and security
- [Docker](https://www.docker.com/) for local development

## 🏗 Project Structure

```
ijara.uz/
├── app/
│   └── [locale]/                  # Internationalization support
│       ├── (auth)/                # Route Group for auth pages
│       │   ├── login/
│       │   ├── register/
│       │   ├── forgot-password/
│       │   └── reset-password/
│       │
│       ├── (main)/                # Route Group for main pages
│       │   ├── catalog/
│       │   │   ├── [id]/         # Apartment detail page
│       │   │   ├── components/   # Catalog-specific components
│       │   │   ├── hooks/        # Catalog-specific hooks
│       │   │   └── schemas/      # Zod schemas for catalog
│       │   │
│       │   ├── add-listing/
│       │   ├── profile/
│       │   ├── favorites/
│       │   └── about/
│       │
│       ├── error.tsx              # Error boundary
│       ├── not-found.tsx          # 404 page
│       ├── layout.tsx             # Root layout
│       └── page.tsx               # Home page
│
├── components/
│   ├── layout/                    # Layout components (Header, Footer)
│   ├── map/                       # Map components
│   ├── ui/                       # Shared UI components
│   └── ...
│
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Authentication logic
│   ├── db.ts                     # Database client with RLS
│   ├── security.ts               # Security utilities
│   ├── ratelimit.ts              # Rate limiting
│   └── ...
│
├── migrations/                   # Database migrations
├── public/                       # Static assets
├── styles/                       # Global styles
├── types/                        # TypeScript types
└── ...
```

### **Route Groups**
- `(auth)` - Authentication pages (login, register, password reset)
- `(main)` - Main application pages (catalog, profile, add-listing)

### **Colocation Principle**
Each page has its own isolated structure with:
- `page.tsx` - Main page component
- `components/` - Page-specific UI components
- `hooks/` - Page-specific custom hooks
- `schemas/` - Zod validation schemas

## 🔐 Security Implementation

### **Authentication & Session Management**
- JWT tokens stored in **HttpOnly, Secure, SameSite cookies**
- **Refresh token rotation** with automatic token refresh
- **Middleware** for protected routes with token verification
- **Rate limiting** (5 requests/minute for auth endpoints)

### **Input Validation & Sanitization**
- **Zod schemas** for strict input validation
- **DOMPurify** for XSS protection in text fields
- **File upload validation** (type, size, content)
- **SQL injection prevention** with parameterized queries

### **Database Security**
- **PostgreSQL Row-Level Security (RLS)** policies
- **UUIDs** instead of sequential IDs
- **Secure context** for database queries
- **Indexing** for performance and security

### **Infrastructure Security**
- **Cloudflare WAF** for DDoS and bot protection
- **Cloudflare Turnstile** for captcha
- **Security headers** (CSP, HSTS, X-Frame-Options)
- **Rate limiting** with Redis
- **Environment variables** for sensitive data

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ (recommended: 20.x)
- PostgreSQL 13+
- Redis (for rate limiting)
- Docker (optional, for local development)

### **Installation**

1. Clone the repository:
```bash
 git clone https://github.com/your-username/ijara.uz.git
 cd ijara.uz
```

2. Install dependencies:
```bash
 npm install
```

3. Set up environment variables:
```bash
 cp .env.local.example .env.local
```

4. Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgres://user:password@localhost:5432/ijara"

# JWT
JWT_SECRET="your-strong-secret-key"
JWT_REFRESH_SECRET="your-strong-refresh-secret-key"
PEPPER="your-password-pepper"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="https://ijara.uz"

# Cloudflare
CLOUDFLARE_TURNSTILE_SITE_KEY="your-site-key"
CLOUDFLARE_TURNSTILE_SECRET_KEY="your-secret-key"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# CSP Reporting
CSP_REPORT_URI="https://your-report-collector.com"
```

5. Run database migrations:
```bash
 npm run migrate
```

6. Start the development server:
```bash
 npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Setup (Optional)

1. Build and start containers:
```bash
 docker-compose up -d
```

2. Run migrations:
```bash
 docker-compose exec app npm run migrate
```

## 📜 License

This project is licensed under the **MIT License**.

## 📧 Contact

For questions or support, please contact:
- **Email**: support@ijara.uz
- **GitHub**: [@your-username](https://github.com/your-username)

---

🏠 **Happy renting with ijara.uz!**