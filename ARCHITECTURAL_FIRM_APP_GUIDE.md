# Architectural Firm Web App - Complete Development Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [Database Models](#database-models)
6. [API Architecture](#api-architecture)
7. [Frontend Components](#frontend-components)
8. [Layout System](#layout-system)
9. [State Management](#state-management)
10. [Key Code Patterns](#key-code-patterns)
11. [Development Setup](#development-setup)
12. [Deployment](#deployment)

---

## Project Overview

This is a comprehensive web application for an architectural firm called "Weave Collaboration Partners" that includes:

### Core Features

- **Public Website**: Marketing site with portfolio, team, and contact information
- **Authentication System**: Multi-role user management (owner, admin, manager, employee)
- **Admin Dashboard**: Complete CMS for managing content, team, jobs, tasks, and analytics
- **Employee Dashboard**: Task management, time tracking, leave requests, and notifications
- **Task Management**: Kanban board, project-based tasks with comments and attachments
- **Time Tracking**: Clock in/out system with overtime calculation
- **Leave Management**: Request and approval system with leave credits
- **Calendar System**: Events, meetings, deadlines, and holidays
- **Notification System**: Real-time notifications for various activities
- **Content Management**: Dynamic content editing for the public website

### User Roles

- **Owner**: Full system access
- **Admin**: Content management, user management, analytics
- **Manager**: Team management, task assignment, leave approval
- **Employee**: Task execution, time logging, leave requests

---

## Tech Stack & Dependencies

### Core Framework

```json
{
  "next": "^15.4.1",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "^5"
}
```

### Authentication & Security

```json
{
  "next-auth": "^4.24.11",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "@next-auth/mongodb-adapter": "^1.1.3"
}
```

### Database & ORM

```json
{
  "mongodb": "^5.9.2",
  "mongoose": "^8.16.3"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^4",
  "@headlessui/react": "^2.2.4",
  "@heroicons/react": "^2.2.0",
  "framer-motion": "^12.23.6",
  "lucide-react": "^0.525.0"
}
```

### Forms & Validation

```json
{
  "react-hook-form": "^7.60.0",
  "@hookform/resolvers": "^5.1.1",
  "zod": "^4.0.5"
}
```

### Utilities

```json
{
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "axios": "^1.10.0",
  "react-hot-toast": "^2.5.2"
}
```

### File Upload & Media

```json
{
  "cloudinary": "^2.7.0",
  "formidable": "^3.5.4"
}
```

### Drag & Drop

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## Project Structure

```
architectural-firm-weaveCP/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (site)/                   # Public website routes
│   │   ├── dashboard/                # Admin dashboard routes
│   │   ├── employee-dashboard/       # Employee dashboard routes
│   │   ├── api/                      # API routes
│   │   ├── login/                    # Authentication pages
│   │   └── register/                 # Registration pages
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # UI components
│   │   ├── layout/                   # Layout components
│   │   └── providers/                # Context providers
│   ├── lib/                          # Utility libraries
│   ├── models/                       # Mongoose models
│   ├── types/                        # TypeScript type definitions
│   └── utils/                        # Helper functions
├── public/                           # Static assets
└── package.json                      # Dependencies
```

---

## Authentication System

### Configuration (`src/lib/auth.ts`)

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Email/password authentication
    }),
    GoogleProvider({
      // Google OAuth (restricted to registered users)
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token
    },
    async session({ session, token }) {
      // Add user data to session
    },
  },
};
```

### Key Features

- **Multi-provider**: Email/password + Google OAuth
- **Role-based**: Supports owner, admin, manager, employee roles
- **Email confirmation**: Required before login
- **JWT sessions**: Secure token-based sessions
- **Protected routes**: Automatic role-based access control

### Usage in Components

```typescript
import { useSession } from "next-auth/react";

export default function ProtectedComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;
  if (!session) return <LoginPrompt />;

  return <Dashboard user={session.user} />;
}
```

---

## Database Models

### User Model (`src/models/User.ts`)

```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  role: "owner" | "admin" | "employee" | "manager";
  team?: "production" | "management" | "admin";
  position?: string;
  image?: string;
  isEmailConfirmed: boolean;
  emailConfirmationToken: string;
}
```

### Task Model (`src/models/Task.ts`)

```typescript
interface ITask {
  name: string;
  projectId: mongoose.Types.ObjectId;
  description?: string;
  assignees: mongoose.Types.ObjectId[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: Date;
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
}
```

### TimeLog Model (`src/models/TimeLog.ts`)

```typescript
interface ITimeLog {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  overtimeReason?: string;
  billable?: boolean;
  hourlyRate?: number;
  notes?: string;
}
```

### Additional Models

- **Leave**: Leave requests with approval workflow
- **LeaveCredit**: Annual leave allocation tracking
- **Event**: Calendar events and meetings
- **Project**: Project organization
- **Content**: Dynamic website content
- **Job**: Job postings and applications
- **Notification**: System notifications

---

## API Architecture

### Route Structure

```
/api/
├── auth/[...nextauth]/route.ts       # NextAuth configuration
├── users/[id]/route.ts               # User CRUD operations
├── tasks/[id]/route.ts               # Task management
├── timelogs/[id]/route.ts            # Time tracking
├── leaves/[id]/route.ts              # Leave management
├── events/[id]/route.ts              # Calendar events
├── projects/[id]/route.ts            # Project management
├── content/[id]/route.ts             # Content management
├── notifications/[id]/route.ts       # Notifications
└── upload/route.ts                   # File uploads
```

### API Pattern Example

```typescript
// src/app/api/tasks/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const tasks = await Task.find(filter);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Role-based access control
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const task = await Task.create(body);
  return NextResponse.json(task, { status: 201 });
}
```

### Key Features

- **Authentication**: All routes protected with NextAuth
- **Role-based access**: Different permissions per user role
- **MongoDB integration**: Mongoose models for data operations
- **Error handling**: Consistent error responses
- **Type safety**: Full TypeScript support

---

## Frontend Components

### UI Components (`src/components/ui/`)

#### Button Component

```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({ variant = "primary", size = "md", loading, children, ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  return (
    <button className={cn(baseClasses, variantClasses[variant])} disabled={loading} {...props}>
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

#### Form Components

```typescript
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### Layout Components

#### Dashboard Layout

```typescript
// src/components/layout/DashboardLayout.tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-[#f7f9fb]">
      <aside className="w-72 bg-blue-900">{/* Sidebar with navigation */}</aside>
      <main className="flex-1">
        <header className="h-20 bg-white">{/* Header with user info and notifications */}</header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
```

### Specialized Components

#### Kanban Board

```typescript
// src/components/ui/KanbanBoard.tsx
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onTaskMove(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-6">
        {["todo", "in-progress", "done", "completed"].map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 capitalize">{status}</h3>
            <SortableContext items={tasks.filter((t) => t.status === status)}>
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <SortableTaskCard key={task._id} task={task} />
                ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
```

---

## Layout System

### Route Groups

- `(site)`: Public website with marketing content
- `dashboard`: Admin/manager dashboard
- `employee-dashboard`: Employee-specific dashboard

### Layout Hierarchy

```
RootLayout (AuthProvider, Toaster)
├── (site)/layout.tsx (Navbar, Footer)
├── dashboard/layout.tsx (DashboardLayout)
└── employee-dashboard/layout.tsx (EmployeeDashboardLayout)
```

### Responsive Design

- **Mobile-first**: Tailwind CSS responsive utilities
- **Sidebar**: Collapsible on mobile devices
- **Grid system**: Flexible layouts for different screen sizes
- **Typography**: Consistent font scaling

---

## State Management

### Client-Side State

```typescript
// React hooks for local state
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Server State

```typescript
// API utilities for server state
// src/utils/api.ts
export const getTasks = async () => {
  const response = await axios.get("/api/tasks");
  return response.data;
};

export const createTask = async (taskData: CreateTaskData) => {
  const response = await axios.post("/api/tasks", taskData);
  return response.data;
};
```

### Form State

```typescript
// React Hook Form for form management
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  assignees: z.array(z.string()).min(1, "At least one assignee required"),
});

export default function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    // Handle form submission
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>;
}
```

---

## Key Code Patterns

### 1. Protected Route Pattern

```typescript
// Check authentication and role in page components
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.replace("/dashboard");
      }
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loading />;
  if (!session) return null;

  return <AdminContent />;
}
```

### 2. API Error Handling

```typescript
// Consistent error handling across API calls
const handleApiCall = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiCall();
    setData(response.data);
  } catch (err: any) {
    setError(err.response?.data?.error || "An error occurred");
    toast.error(err.response?.data?.error || "An error occurred");
  } finally {
    setLoading(false);
  }
};
```

### 3. Loading States

```typescript
// Consistent loading patterns
if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### 4. Conditional Rendering

```typescript
// Role-based component rendering
const canEdit = session?.user?.role === "admin" || session?.user?.role === "manager";

{
  canEdit && (
    <button onClick={handleEdit} className="btn-primary">
      Edit
    </button>
  );
}
```

### 5. Form Validation

```typescript
// Zod schema validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "employee", "manager"]),
});

type UserFormData = z.infer<typeof userSchema>;
```

---

## Development Setup

### 1. Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/architectural-firm

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (for notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Installation

```bash
npm install
npm run dev
```

### 3. Database Setup

```bash
# MongoDB should be running locally or use MongoDB Atlas
# The app will automatically create collections on first use
```

### 4. Initial User Creation

```javascript
// Create first admin user via MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@weavecp.com",
  password: "$2a$10$hashedPassword", // Use bcrypt to hash
  role: "admin",
  isEmailConfirmed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

## Deployment

### 1. Build Process

```bash
npm run build
npm start
```

### 2. Environment Setup

- Set production environment variables
- Configure MongoDB Atlas connection
- Set up Cloudinary for file uploads
- Configure email service

### 3. Platform Deployment

- **Vercel**: Automatic deployment from Git
- **Netlify**: Build and deploy
- **AWS**: EC2 or ECS deployment
- **Docker**: Containerized deployment

### 4. Performance Optimization

- **Image optimization**: Next.js Image component
- **Code splitting**: Automatic with Next.js
- **Caching**: API response caching
- **CDN**: Static asset delivery

---

## Best Practices Implemented

### 1. Type Safety

- Full TypeScript implementation
- Strict type checking
- Interface definitions for all data structures

### 2. Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization

### 3. Performance

- Server-side rendering where appropriate
- Image optimization
- Lazy loading of components
- Efficient database queries

### 4. User Experience

- Responsive design
- Loading states
- Error handling
- Toast notifications
- Intuitive navigation

### 5. Code Organization

- Modular component structure
- Separation of concerns
- Consistent naming conventions
- Reusable utilities

---

## Common Development Tasks

### Adding a New Feature

1. Define TypeScript interfaces in `src/types/`
2. Create Mongoose model in `src/models/`
3. Implement API routes in `src/app/api/`
4. Create UI components in `src/components/ui/`
5. Add pages in appropriate dashboard
6. Update navigation and permissions

### Database Schema Changes

1. Update Mongoose model
2. Create migration script if needed
3. Update TypeScript interfaces
4. Test API endpoints
5. Update frontend components

### Adding New User Role

1. Update User model enum
2. Modify authentication logic
3. Update role-based access control
4. Add role-specific navigation
5. Test all permission levels

---

This documentation provides a comprehensive overview of your architectural firm web application. The codebase follows modern React/Next.js patterns with TypeScript, ensuring type safety and maintainability. The modular architecture makes it easy to extend and modify features as needed.
