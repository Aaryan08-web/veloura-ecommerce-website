import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { isValidEmail } from '../utils/validation';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthentication();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setError('Please provide a valid client email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid client credentials.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 dark:text-stone-400 block">
          Client Identification
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
          Sign In to Your Atelier Account
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
          Access your personal fitting dimensions, order tracking, and private invitations.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xs text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 mb-1.5 font-medium">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 font-medium">
              Password
            </label>
            <span className="text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer transition-colors">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-6"
        >
          {isLoading ? 'Signing In...' : 'Access Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-4 border-t border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400 font-light">
        <span>Not yet part of the Circle? </span>
        <Link
          to="/register"
          className="text-stone-950 dark:text-white font-medium underline hover:opacity-80"
        >
          Apply for Membership
        </Link>
      </div>
    </div>
  );
};
