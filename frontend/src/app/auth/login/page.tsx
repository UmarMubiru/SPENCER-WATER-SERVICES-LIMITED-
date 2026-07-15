"use client";

import BrandPanel from "@/components/auth/BrandPanel";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <BrandPanel />
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
