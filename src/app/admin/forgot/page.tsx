import type { Metadata } from "next";
import ForgotForm from "@/components/admin/ForgotForm";

export const metadata: Metadata = {
  title: "Admin — Reset password",
  robots: { index: false, follow: false },
};

export default function ForgotPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-3xl font-semibold text-maroon">
          Reset password
        </h1>
        <p className="mb-6 text-center text-sm text-foreground/60">
          We&apos;ll email you a link to set a new password.
        </p>
        <ForgotForm />
      </div>
    </div>
  );
}
