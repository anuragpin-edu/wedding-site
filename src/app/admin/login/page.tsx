import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin — Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-3xl font-semibold text-maroon">
          Admin
        </h1>
        <p className="mb-6 text-center text-sm text-foreground/60">
          Anurag &amp; Thanmai — wedding dashboard
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
