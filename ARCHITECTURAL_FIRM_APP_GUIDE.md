# Architectural Firm Web App – Comprehensive Documentation

---

## 1. Project Overview

A modern, full-stack web application for an architectural firm, built with Next.js 14, MongoDB, and Tailwind CSS. The app supports:

- A public marketing site (services, about, team, contact, etc.)
- A CMS/admin dashboard for content, team, project, and job management
- An employee dashboard for time tracking, tasks, leaves, and profile management

---

## 2. Requirements

### 2.1 Technical Requirements

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Next.js** 14 (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Framer Motion** (animations)
- **React Hook Form** (forms)
- **NextAuth.js** (authentication)
- **Cloudinary** (image uploads)
- **ESLint/Prettier** (code quality)

### 2.2 Functional Requirements

- **Authentication**: Role-based (admin, manager, employee)
- **User Management**: Registration, login, email confirmation, password reset
- **Content Management**: CRUD for all main site sections (hero, about, process, team, portfolio, etc.)
- **Team/Employee Management**: CRUD for users, teams, roles
- **Project & Task Management**: CRUD for projects, tasks, Kanban board, assignments
- **Job Postings**: CRUD for job listings
- **Time Tracking**: Clock in/out, time logs, analytics
- **Leave Management**: Request, approve/reject, leave types
- **Notifications**: User/admin notifications
- **Image Management**: Upload, list, delete (Cloudinary)
- **Analytics**: Dashboard stats, productivity, trends

### 2.3 Non-Functional Requirements

- **Security**: All sensitive endpoints protected by session/role
- **Performance**: Fast, responsive UI (Tailwind, Next.js SSR/ISR)
- **Accessibility**: Semantic HTML, keyboard navigation
- **Scalability**: Modular code, scalable DB models
- **Maintainability**: Strict typing, clear folder structure, reusable components

---

## 3. Feature Breakdown

### 3.1 Public Site

- Home, About, Process, Why Weave, Team, Services, Portfolio, Contact
- Service detail pages (before/after, features, related projects)
- Contact form (email via API)
- Responsive, animated UI

### 3.2 CMS/Admin Dashboard

- **Dashboard**: Org-wide stats (tasks, employees, leaves, productivity, recent activity)
- **Content Management**: Section-based (hero, about, why weave, process, portfolio, team, etc.), publish/draft/unpublished, add/edit/remove
- **Projects**: CRUD, stats (active, completed, on-hold, budget, progress)
- **Tasks**: CRUD, assign to users, due dates, priorities, Kanban board, attachments, comments
- **Jobs**: CRUD, stats (active/inactive, applications, salary, type/location)
- **Team**: CRUD, stats (teams, members, managers, team sizes)
- **Leaves**: Review/approve/reject, stats (pending, approved, rejected, by type)
- **Time Tracking**: View/filter logs, stats (total/average/overtime hours)
- **Calendar**: Events, leaves, add/edit events
- **Notifications**: (UI present, backend to be confirmed)
- **Settings/Profile**: Change password, profile info

### 3.3 Employee Dashboard

- **Dashboard**: Personalized stats (tasks, hours, leaves, productivity, streaks, deadlines, overtime)
- **Tasks**: View/manage assigned tasks, Kanban board
- **Leaves**: Request, view status/history, stats
- **Time Logs**: Clock in/out, view/filter logs, stats
- **Calendar**: Team events, personal leaves
- **Profile**: Manage info, update image, position, team

---

## 4. Current Limitations & TODOs

### 4.1 General

- [ ] **Frontend uses mock data** for most content, team, jobs, etc. (needs API integration)
- [ ] **Notifications**: UI present, backend logic may need review/expansion
- [ ] **Analytics/Reporting**: Basic stats present, advanced analytics/reporting endpoints can be added
- [ ] **Accessibility**: Needs full audit for WCAG compliance

### 4.2 CMS/Admin Dashboard

- [ ] **Content Management**: Add rich text/image editing, drag-and-drop reordering
- [ ] **Project Management**: Replace mock project stats with real data
- [ ] **Task Management**: Add task comments, attachments, edit modal (see TODO in LeaveRequestCard)
- [ ] **Job Applications**: Add application management (view, approve, reject)
- [ ] **Image Management**: Expand Cloudinary resource typing, add bulk actions
- [ ] **User/Team Management**: Add invite by email, bulk import/export
- [ ] **Settings**: Add more org-wide settings (branding, notifications, etc.)

### 4.3 Employee Dashboard

- [ ] **Attendance/Payroll**: Sidebar links present, features not yet implemented
- [ ] **Leave Edit Modal**: TODO in LeaveRequestCard (implement edit modal for leave requests)
- [ ] **Performance Analytics**: Add more detailed personal analytics
- [ ] **Notifications**: Ensure employees receive relevant notifications

### 4.4 Public Site

- [ ] **Portfolio**: Add real project data, case studies
- [ ] **SEO**: Add meta tags, sitemap, robots.txt
- [ ] **Contact Form**: Add spam protection (honeypot, captcha)

---

## 5. Suggestions & Enhancements

- **API Integration**: Replace all mock data with real API calls in frontend components
- **Rich Content Editing**: Integrate a WYSIWYG editor for CMS sections
- **Advanced Search**: Add search/filter for all major tables (users, projects, tasks, jobs)
- **Bulk Actions**: Enable bulk edit/delete for users, projects, tasks, images
- **Role Management**: Allow custom roles/permissions
- **Audit Logs**: Track changes to critical data (users, content, projects)
- **Mobile App**: Consider React Native for field staff
- **Testing**: Add unit/integration tests (Jest, React Testing Library)
- **CI/CD**: Set up automated deployment pipeline
- **Documentation**: Keep this guide and README up to date with all changes

---

## 6. Onboarding & Development Notes

### 6.1 Getting Started

- See `README.md` for setup instructions
- Use `.env.example` to configure environment variables
- Run `npm run dev` to start the app locally

### 6.2 Development Best Practices

- Use strict TypeScript for all new code
- Keep API and model typings in sync
- Use reusable components and hooks
- Write clear, descriptive commit messages
- Document all new features and endpoints

### 6.3 Folder Structure

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

## 7. References

- [README.md](./README.md) – Quickstart, tech stack, API summary
- [src/types/](./src/types/) – TypeScript interfaces
- [src/models/](./src/models/) – Mongoose schemas
- [src/utils/api.ts](./src/utils/api.ts) – API utilities

---

_Keep this document updated as the project evolves!_
