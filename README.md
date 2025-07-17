# Architectural Firm Website

A modern, full-stack web application for an architectural firm built with Next.js 14, MongoDB, and Tailwind CSS.

---

## 🚀 Current Capabilities (Backend & API)

### Authentication & Authorization

- NextAuth.js session-based authentication
- Role-based access: `admin`, `manager`, `employee`
- All sensitive endpoints protected by role and session

### User & Team Management

- User registration, login, email confirmation
- User model supports `role`, `team` (production, management, admin), and `position`
- API: List, update users and team members (admin/manager only)

### Content Management (CMS)

- Section-based content (home, about, process, why-choose-us, team, portfolio, careers, etc.)
- Full CRUD API for content (admin only for create/update/delete)

### Job Postings

- Job model: title, description, requirements, responsibilities, location, type, salary, isActive
- Full CRUD API for jobs (admin only for create/update/delete)

### Time Logs

- TimeLog model: user, date, timeIn, timeOut, totalHours, notes
- Full CRUD API for time logs (admin/manager or owner for update/delete)

### Image Management (Cloudinary)

- Upload images to Cloudinary (admin/manager only)
- List and delete images from Cloudinary (admin/manager only)

### Notifications

- API for user/admin notifications (get, create, mark as read, delete)

### Strict TypeScript & API Utilities

- All backend and API utilities are strictly typed (no `any`)
- `src/utils/api.ts` provides type-safe functions for all backend endpoints
- Ready for frontend integration (swap out mock data when ready)

---

## 🛠 Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form

### Backend

- Next.js API Routes
- MongoDB + Mongoose
- NextAuth.js
- bcryptjs
- Cloudinary

### Utilities

- ESLint, Prettier, TypeScript
- Strictly typed API utility (`src/utils/api.ts`)

---

## 📁 Project Structure (Key Folders)

```
src/
├── app/         # Next.js App Router pages & API routes
├── components/  # Reusable UI components
├── lib/         # Utility functions and configurations
├── models/      # MongoDB schemas
├── types/       # TypeScript type definitions
├── utils/       # API and axios utilities
```

---

## 🧑‍💻 Development Status & Room for Improvement

- **Frontend currently uses mock data** for all content, team, jobs, etc. (for rapid prototyping)
- **Backend is fully CMS-ready**: all endpoints, models, and utilities are production-grade and type-safe
- **Next steps:**
  - Connect frontend components to API endpoints (replace mock data)
  - Build admin UI for content, team, job, and image management
  - Add password reset, analytics, advanced search, and reporting endpoints as needed
  - Expand Cloudinary image resource typing as needed
  - Add public portfolio endpoints if required

---

## 📚 API Coverage Summary

| Area          | Endpoints Implemented    | Access Control      |
| ------------- | ------------------------ | ------------------- |
| Users/Team    | GET, PATCH               | Admin/Manager       |
| Content (CMS) | GET, POST, PATCH, DELETE | Public/Admin        |
| Jobs          | GET, POST, PATCH, DELETE | Public/Admin        |
| Time Logs     | GET, POST, PATCH, DELETE | Admin/Manager/Owner |
| Images        | GET, POST, DELETE        | Admin/Manager       |
| Notifications | GET, POST, PATCH, DELETE | User/Admin          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd architectural-firm
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Update `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/architectural-firm
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📝 Notes

- This app is **in progress**. The backend is production-ready, but the frontend is still using mock data for all content and management features.
- All new features should use strict typing and follow the established API/utilities pattern.
- For improvements, see the "Room for Improvement" section above.

---
