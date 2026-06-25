import type { Metadata } from "next";
import { Suspense } from "react";
import ResetForm from "@/components/admin/ResetForm";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-3xl font-semibold text-maroon">
          Set a new password
        </h1>
        <p className="mb-6 text-center text-sm text-foreground/60">
          Choose a new password for your admin account.
        </p>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
