import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { isValidEmail } from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthentication();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [optIn, setOptIn] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    const res = await register(name, email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/login', { replace: true });
    } else {
      setError(res.error || 'Could not complete registration. Try another email address.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 dark:text-stone-400 block">
          New Membership
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
          Join The Veloura Circle
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
          Enjoy complimentary tailoring consultations, private drop viewings, and archived order tracking.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xs text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 mb-1.5 font-medium">
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Julian Sterling"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="block text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 mb-1.5 font-medium">
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 mb-1.5 font-medium">
            Create Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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

        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-xs bg-white dark:bg-zinc-900 border-stone-300 dark:border-white/20 text-stone-900 dark:text-white focus:ring-0"
            />
            <span>
              Receive seasonal lookbooks, early private runway invitations, and bespoke collection notifications.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-6"
        >
          {isLoading ? 'Registering...' : 'Create Atelier Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-4 border-t border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400 font-light">
        <span>Already have an account? </span>
        <Link
          to="/login"
          className="text-stone-950 dark:text-white font-medium underline hover:opacity-80"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};
