import { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in types for NextAuth

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      position?: string | null;
      team?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null;
    position?: string | null;
    team?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    position?: string | null;
    team?: string | null;
  }
}
