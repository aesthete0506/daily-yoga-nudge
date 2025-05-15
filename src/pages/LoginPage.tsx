
import React from 'react';
import { Logo } from "@/components/Logo";
import EmailLogin from "@/components/EmailLogin";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col yoga-gradient">
      <header className="w-full py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <EmailLogin />
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
