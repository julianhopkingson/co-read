'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from "@/contexts/language-context";
import { AppBrandName } from "@/components/T";
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useConfirmDialog } from '@/components/ConfirmDialog';

function SimpleLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">{children}</label>
}

export default function Home() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/books';
  const [error, dispatch] = useActionState(authenticate, undefined);
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { alert } = useConfirmDialog();

  // Controlled form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Show error dialog when error timestamp changes (new error occurred)
  useEffect(() => {
    if (error?.key) {
      alert(t(error.key as any));
      // Clear password only, keep username
      setPassword('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error?.ts]); // Only trigger on new timestamp

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Title */}
      <h1 className="font-bold tracking-tight mb-8">
        <AppBrandName />
      </h1>

      {/* Circular Illustration */}
      <div className="w-[300px] h-[300px] rounded-full overflow-hidden mb-6">
        <img
          src="/images/co-read-cover.png"
          alt="Co・Read"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-6">
        <form action={dispatch} className="space-y-3">
          <input type="hidden" name="redirectTo" value={callbackUrl} />

          {/* Username */}
          <div className="space-y-1">
            <SimpleLabel htmlFor="name">{t('login.username')}</SimpleLabel>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="user"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 border-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <SimpleLabel htmlFor="password">{t('login.password')}</SimpleLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100 border-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>


          {/* Submit */}
          <LoginButton />
        </form>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-gray-300 font-medium tracking-widest uppercase">
        Pure Reading
      </p>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button className="w-full font-bold text-base text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/30" aria-disabled={pending}>
      {pending ? '...' : t('login.submit')}
    </Button>
  );
}
