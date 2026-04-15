import { createNeonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export type AuthSession = Awaited<ReturnType<typeof auth.getSession>>["data"];

export async function getSession(): Promise<AuthSession> {
  const { data } = await auth.getSession();
  return data;
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
