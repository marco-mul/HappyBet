"use server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email address must be provided." };
  }

  const name = formData.get("name") as string;
  const existing = await db.user.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    return { error: "This name is already taken." };
  }

  const { error } = await auth.signUp.email({
    email,
    name,
    password: formData.get("password") as string,
  });
  if (error) {
    return { error: error.message || "Failed to create account" };
  }
  redirect("/dashboard");
}
