import { createNeonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    sessionDataTtl: 86400, // 24h — avoids cookie-refresh errors in Server Components
  },
});

export type AuthSession = Awaited<ReturnType<typeof auth.getSession>>["data"];

export async function getSession(): Promise<AuthSession> {
  try {
    const { data } = await auth.getSession();
    return data;
  } catch {
    // Next.js 16 blocks cookie writes in Server Components; return null when the
    // session data cache is expired so the app degrades gracefully instead of crashing.
    return null;
  }
}

export async function requireSession(
  redirectTo = "/auth/sign-in",
): Promise<NonNullable<AuthSession>> {
  const session = await getSession();
  if (!session?.user) {
    redirect(redirectTo);
  }
  return session;
}
