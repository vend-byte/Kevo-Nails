import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-brand-black text-white">
          <p className="text-sm text-white/50">Loading…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
