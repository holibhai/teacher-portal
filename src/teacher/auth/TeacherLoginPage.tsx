import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  Info,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { mockTeacherProfile } from '../data/mockData';

interface TeacherLoginPageProps {
  onLogin: (teacher?: TeacherProfile) => void;
}

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({ onLogin }) => {
  // Screen mode: 'login' or 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'forgot-password'>('login');

  // Login form state
  const [email, setEmail] = useState('alex.rivera@mentify.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your institutional email and password.');
      return;
    }

    if (!email.includes('@')) {
      setAuthError('Please enter a valid academic email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(mockTeacherProfile);
    }, 500);
  };

  const handleKeycloakSSO = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(mockTeacherProfile);
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your institutional email address.');
      return;
    }

    if (!forgotEmail.includes('@')) {
      setForgotError('Please enter a valid academic email address.');
      return;
    }

    setIsForgotSubmitting(true);
    setTimeout(() => {
      setIsForgotSubmitting(false);
      setForgotSubmitted(true);
      setResendCooldown(45);

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Simple Utility Bar */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            M
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">Mentify</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 ml-1.5">
              Teacher Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keycloak IAM Federated</span>
          </div>
        </div>
      </header>

      {/* Main Container: 2-Column Split for Desktop */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden min-h-[540px]">
          {/* Left Column: Visual Brand & Academic Value Proposition */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-indigo-200 border border-white/10 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Next-Gen Educator Workspace</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Plan, teach, assess, and mentor with ease.
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200/80 mt-2 leading-relaxed">
                  A cohesive educational cockpit uniting curriculum authoring, real-time attendance, split-screen grading, and AI-assisted pedagogy.
                </p>
              </div>

              {/* Metric Highlights Strip */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Turnaround Time</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5">2.4x Faster</span>
                  <span className="text-[10px] text-indigo-200/60 block mt-0.5">Split-screen grading</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Accreditation</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5">100% FERPA</span>
                  <span className="text-[10px] text-indigo-200/60 block mt-0.5">Keycloak enterprise SSO</span>
                </div>
              </div>
            </div>

            {/* Testimonial / Faculty Quote */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/10">
              <p className="text-xs text-indigo-100/90 italic leading-relaxed">
                &ldquo;Mentify streamlined our department’s laboratory evaluations and curriculum distribution. Continuous assessment now feels effortless.&rdquo;
              </p>
              <div className="flex items-center gap-2.5 mt-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  AR
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Dr. Alex Rivera</p>
                  <p className="text-[10px] text-indigo-300">Associate Professor of Computer Science</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic View (Login vs. Forgot Password) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              {authMode === 'login' ? (
                /* 1. SIGN IN VIEW */
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Faculty & Staff Sign In
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Authenticate using your university credentials or Keycloak identity provider.
                    </p>
                  </div>

                  {/* 1-Click Institutional Keycloak SSO */}
                  <div>
                    <button
                      type="button"
                      onClick={handleKeycloakSSO}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>Continue with University Keycloak SSO</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Or sign in with email
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Error Message */}
                  {authError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                      <Info className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Main Credential Form */}
                  <form onSubmit={handleStandardSubmit} className="space-y-4">
                    {/* Email input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Institutional Email / Faculty ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alex.rivera@mentify.edu"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Password input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Faculty Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(email);
                            setForgotSubmitted(false);
                            setForgotError('');
                            setAuthMode('forgot-password');
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your secure password"
                          required
                          className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500/20"
                        />
                        <span>Remember this device for 30 days</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating Keycloak Session...</span>
                        </div>
                      ) : (
                        <>
                          <span>Enter Faculty Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* 2. DEDICATED PROPER FORGOT PASSWORD VIEW */
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setForgotSubmitted(false);
                      setForgotError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Reset Faculty Password
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Enter your university email address. We will verify your Keycloak faculty identity and send a secure password reset link.
                    </p>
                  </div>

                  {forgotSubmitted ? (
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Recovery Link Dispatched</span>
                        </div>
                        <p className="leading-relaxed text-emerald-800/90">
                          We sent a password reset link to <strong className="font-semibold">{forgotEmail}</strong>. Please check your university inbox and spam folders.
                        </p>
                        <p className="text-[11px] text-emerald-700/80">
                          The reset link remains valid for 15 minutes.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Return to Faculty Sign In</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                          <span>Didn&apos;t receive the email?</span>
                          <button
                            type="button"
                            disabled={resendCooldown > 0}
                            onClick={(e) => handleForgotPasswordSubmit(e)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {resendCooldown > 0 ? `Resend link (${resendCooldown}s)` : 'Resend link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      {forgotError && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                          <Info className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{forgotError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Institutional Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. alex.rivera@mentify.edu"
                            required
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          For security, recovery links can only be delivered to verified faculty domain addresses (<code className="text-slate-700">*.edu</code> or institutional domain).
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isForgotSubmitting}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isForgotSubmitting ? (
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Keycloak Verification Link...</span>
                          </div>
                        ) : (
                          <>
                            <span>Send Recovery Link</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Cancel and return to sign in
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/50">
        <p>
          Mentify Educational Management System · Protected by Keycloak 256-bit TLS Authentication · FERPA Compliant
        </p>
      </footer>
    </div>
  );
};
