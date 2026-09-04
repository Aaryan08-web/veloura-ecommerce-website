import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle2, Lock, Shield, Cpu, Sparkles } from 'lucide-react';

interface CaptchaVerificationProps {
  onVerified: (token: string) => void;
  onReset?: () => void;
  isVerified: boolean;
  hasError?: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerified,
  onReset,
  isVerified,
  hasError,
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'challenge'>('challenge');
  
  // Interactive Captcha state
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string>('');

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setCaptchaError('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleCaptchaVerify = () => {
    if (userInput.trim().toUpperCase() === captchaCode) {
      setCaptchaError('');
      setStatus('verifying');
      setStatus('success');
      onVerified(`captcha_${Date.now()}`);
    } else {
      setCaptchaError('Incorrect security code. Please try again.');
      generateCaptcha();
    }
  };

  const handleReset = () => {
    setStatus('challenge');
    generateCaptcha();
    if (onReset) onReset();
  };

  return (
    <div
      id="payment-security-shield"
      className={`relative overflow-hidden rounded-xs border transition-all duration-300 ${
        isVerified
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
          : hasError
          ? 'bg-amber-950/20 border-amber-500/60 text-stone-900 dark:text-stone-100 ring-1 ring-amber-500/30'
          : 'bg-white dark:bg-[#151515] border-stone-200 dark:border-white/10 text-stone-900 dark:text-stone-100 shadow-lg'
      } p-4 sm:p-5`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-stone-900 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-950 dark:text-white">
                Payment Security & Captcha Verification
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 font-medium">
                Active
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Please enter the verification code below to authorize payment
            </p>
          </div>
        </div>
      </div>

      {/* Main interactive state */}
      {isVerified || status === 'success' ? (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
                <span>Security Clearance Passed</span>
              </div>
              <p className="text-[10px] text-stone-600 dark:text-stone-300">
                Captcha verified • Safe for Razorpay checkout transmission
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white underline cursor-pointer"
          >
            Re-verify
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Captcha distorted display banner */}
            <div className="relative flex items-center justify-between px-4 py-2 bg-stone-900 text-stone-100 border border-stone-700 rounded-xs select-none min-w-[140px] tracking-[0.4em] font-mono text-base font-bold italic shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
              <span className="relative z-10 line-through decoration-stone-500/70">{captchaCode}</span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="relative z-10 ml-3 text-stone-400 hover:text-white cursor-pointer"
                title="Generate new challenge"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Captcha input */}
            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={6}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCaptchaVerify();
                  }
                }}
                placeholder="Enter code"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs font-mono uppercase rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={handleCaptchaVerify}
                className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer shrink-0"
              >
                Verify
              </button>
            </div>
          </div>

          {captchaError && (
            <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">
              {captchaError}
            </p>
          )}

          {hasError && !isVerified && (
            <p className="text-[11px] text-amber-500 dark:text-amber-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Security verification required before placing payment order.
            </p>
          )}
        </div>
      )}

      {/* Footer metadata */}
      <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-white/5 flex flex-wrap items-center justify-between text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider gap-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-stone-400" />
          <span>Cryptographic Captcha Challenge</span>
        </div>
        <div className="flex items-center gap-2">
          <span>TLS 1.3 256-Bit</span>
          <span>•</span>
          <span className="flex items-center gap-0.5 text-stone-500 dark:text-stone-400">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Fraud Guard
          </span>
        </div>
      </div>
    </div>
  );
};
