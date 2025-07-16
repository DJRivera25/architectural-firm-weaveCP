# Architectural Firm Website

A modern, full-stack web application for an architectural firm built with Next.js 14, MongoDB, and Tailwind CSS.

## 🚀 Features

### Core Features

- **Responsive Design**: Modern, mobile-first design with Tailwind CSS
- **Authentication**: Secure login system with NextAuth.js
- **Role-based Access**: Admin and Employee roles with different permissions
- **CMS**: Content Management System for managing website content
- **Employee Time Tracking**: Clock in/out system for employees
- **Job Applications**: Career page with application submission
- **Portfolio Management**: Showcase architectural projects

### Pages & Sections

- **Home**: Hero section, about preview, process overview, portfolio showcase
- **About Us**: Company information and team details
- **Our Process**: Step-by-step design process
- **Why Choose Us**: Company benefits and unique selling points
- **Our Team**: Team member profiles
- **Our Work**: Portfolio of completed projects
- **Careers**: Job listings and application forms
- **Admin Dashboard**: Content management and analytics
- **Employee Dashboard**: Time tracking and personal information

## 🛠 Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form handling and validation

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database with Mongoose ODM
- **NextAuth.js**: Authentication and session management
- **bcryptjs**: Password hashing
- **Cloudinary**: Image upload and management

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # Employee dashboard
│   ├── about/             # About page
│   ├── process/           # Process page
│   ├── portfolio/         # Portfolio page
│   ├── careers/           # Careers page
│   └── login/             # Login page
├── components/            # Reusable UI components
│   ├── providers/         # Context providers
│   ├── ui/               # Basic UI components
│   └── forms/            # Form components
├── lib/                  # Utility functions and configurations
├── models/               # MongoDB schemas
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

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

## 📊 Database Models

### User

- Authentication and role management
- Admin and Employee roles
- Profile information

### Content

- CMS content management
- Section-based organization
- Image and text content

### Job

- Career opportunities
- Job descriptions and requirements
- Salary information

### Application

- Job applications
- Resume and cover letter storage
- Application status tracking

### TimeLog

- Employee time tracking
- Clock in/out records
- Hours calculation

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to CMS, user management, and analytics
- **Employee**: Access to dashboard and time tracking

### Security Features

- Password hashing with bcryptjs
- JWT-based sessions
- Role-based route protection
- CSRF protection

## 🎨 UI/UX Features

### Design System

- Consistent color palette and typography
- Responsive grid system
- Interactive hover states
- Smooth transitions and animations

### Components

- Reusable UI components
- Form validation
- Loading states
- Error handling
- Toast notifications

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Netlify
- Railway
- DigitalOcean App Platform

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Code Style

- ESLint configuration for code quality
- Prettier for consistent formatting
- TypeScript for type safety

## 📈 Performance

### Optimizations

- Next.js Image optimization
- Code splitting and lazy loading
- MongoDB connection pooling
- Caching strategies
- Bundle size optimization

## 🔒 Security

### Best Practices

- Environment variable protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates & Maintenance

### Regular Maintenance

- Dependency updates
- Security patches
- Performance monitoring
- Database backups

### Future Enhancements

- Real-time notifications
- Advanced analytics
- Multi-language support
- Mobile app integration
- Advanced CMS features

---

**Built with ❤️ using Next.js, MongoDB, and Tailwind CSS**

## 🛠️ Challenges & Solutions

### 1. TypeScript Global Mongoose Cache

**Challenge:**
TypeScript error when attaching a custom property to the global object for Mongoose connection caching.

**Solution:**
Created a `MongooseCache` interface and declared `global.mongooseCache` in a `global.d.ts` file for type safety.

---

### 2. NextAuth User Role Type

**Challenge:**
TypeScript error: `Property 'role' does not exist on type 'User'`.

**Solution:**
Augmented NextAuth types in `src/types/next-auth.d.ts` to include `role` on `User`, `Session`, and `JWT`.

---

### 3. Default vs Named Exports

**Challenge:**
React error: "Element type is invalid..." due to incorrect import/export of components.

**Solution:**
Ensured all components use `export default` and are imported as default imports.

---

### 6. Next.js/Framer Motion Client Component Boundary Error

**Challenge:**
Build failed with: `It's currently unsupported to use "export *" in a client boundary. Please use named exports instead.` This happened when using `framer-motion` in components without marking them as client components in a Next.js 15+ App Router project.

**Solution:**
Added `'use client'` to the top of every component that uses `framer-motion` (e.g., `AboutPreview`, `ProcessPreview`, `PortfolioPreview`, `ContactCTA`, `HeroSection`). This ensures these components are treated as client components, resolving the error and allowing use of client-only libraries.

---
