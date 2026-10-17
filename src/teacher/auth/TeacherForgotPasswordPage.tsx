import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  RefreshCw,
  Clock,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { mockTeacherProfile } from '../data/mockData';

interface TeacherForgotPasswordPageProps {
  initialEmail?: string;
  onBackToLogin: () => void;
  onPasswordResetSuccess: (teacher?: TeacherProfile) => void;
}

type RecoveryStep = 'email' | 'otp' | 'new-password' | 'success';

export const TeacherForgotPasswordPage: React.FC<TeacherForgotPasswordPageProps> = ({
  initialEmail = 'alex.rivera@mentify.edu',
  onBackToLogin,
  onPasswordResetSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');

  // Step 1: Email state
  const [email, setEmail] = useState(initialEmail);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2: OTP state (6 digits)
  const DEMO_OTP = '849201';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showSimulatedEmailNotification, setShowSimulatedEmailNotification] = useState(true);

  // Step 3: New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Password rules evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const validRulesCount = [hasMinLength, hasUpper && hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let strengthWidth = 'w-1/4';

  if (validRulesCount === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    strengthWidth = 'w-2/4';
  } else if (validRulesCount === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-indigo-500';
    strengthWidth = 'w-3/4';
  } else if (validRulesCount === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthWidth = 'w-full';
  }

  // --- Handlers ---

  // Handle Step 1 Submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Please provide your academic email address.');
      return;
    }

    if (!email.includes('@')) {
      setEmailError('Please enter a valid university email address.');
      return;
    }

    setIsSendingCode(true);
    setTimeout(() => {
      setIsSendingCode(false);
      setCurrentStep('otp');
      setTimeLeft(300);
      setCanResend(false);
      setShowSimulatedEmailNotification(true);
      // Focus first OTP box
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    }, 600);
  };

  // Handle OTP individual input change
  const handleOtpChange = (index: number, value: string) => {
    setOtpError('');
    if (value.length > 1) {
      // Handle paste of whole string or multiple digits
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    // Single digit input
    const char = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pasteData.length, 5);
    otpInputsRef.current[lastFilledIndex]?.focus();
  };

  // Handle Step 2 OTP Verification
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      // Accept demo OTP or any 6 digits in demo mode
      setCurrentStep('new-password');
    }, 500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setIsSendingCode(true);
    setTimeout(() => {
      setIsSendingCode(false);
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setShowSimulatedEmailNotification(true);
      otpInputsRef.current[0]?.focus();
    }, 400);
  };

  const handleAutoFillDemoOtp = () => {
    setOtp(DEMO_OTP.split(''));
    setOtpError('');
    otpInputsRef.current[5]?.focus();
  };

  // Handle Step 3 Password Submit
  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!hasMinLength) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (!hasNumber) {
      setPasswordError('Password must include at least one number.');
      return;
    }

    if (!passwordsMatch) {
      setPasswordError('The passwords you entered do not match.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setCurrentStep('success');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
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

        <button
          onClick={onBackToLogin}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Progress Step Header Bar */}
          <div className="p-6 sm:px-10 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600 block mb-0.5">
                Keycloak Security Recovery
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {currentStep === 'email' && 'Step 1: Institutional Email Identification'}
                {currentStep === 'otp' && 'Step 2: Enter Email Verification Code (OTP)'}
                {currentStep === 'new-password' && 'Step 3: Create New Faculty Password'}
                {currentStep === 'success' && 'Credential Reset Complete'}
              </h1>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {[
                { id: 'email', num: 1 },
                { id: 'otp', num: 2 },
                { id: 'new-password', num: 3 },
                { id: 'success', num: 4 },
              ].map((step, idx) => {
                const stepOrder = ['email', 'otp', 'new-password', 'success'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const isPassed = idx < currentIndex;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    {idx < 3 && (
                      <div
                        className={`w-5 sm:w-8 h-0.5 rounded-full ${
                          idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-10 max-w-xl mx-auto">
            {/* ================= STEP 1: ENTER EMAIL ================= */}
            {currentStep === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Find Your Faculty Account
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Enter the institutional email associated with your Mentify faculty profile. We will dispatch a 6-digit verification code to confirm your identity.
                  </p>
                </div>

                {emailError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alex.rivera@mentify.edu"
                        required
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Protected by Keycloak institutional federation. The verification OTP will expire 5 minutes after transmission.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </div>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Remember your password? Return to sign in
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 2: ENTER OTP CODE ================= */}
            {currentStep === 'otp' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We sent a 6-digit verification code to{' '}
                    <strong className="text-slate-800 font-semibold">{email}</strong>.{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentStep('email')}
                      className="text-indigo-600 hover:underline font-medium inline cursor-pointer"
                    >
                      Change email
                    </button>
                  </p>
                </div>

                {/* Simulated Email Notification Banner for immediate testing */}
                {showSimulatedEmailNotification && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs text-indigo-900 flex items-start justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-950 block">
                          [Mentify Security] University Verification Email
                        </span>
                        <p className="text-[11px] text-indigo-800/90 mt-0.5">
                          Your verification code is:{' '}
                          <span className="font-mono font-bold tracking-wider text-indigo-950 text-xs bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {DEMO_OTP}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFillDemoOtp}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-md shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {/* 6-Digit OTP Boxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                      6-Digit Security Code
                    </label>

                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputsRef.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition-all shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Countdown Timer & Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                    <div className="flex items-center gap-1.5 font-mono text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Expires in{' '}
                        <strong className="text-slate-800 font-bold">{formatTimer(timeLeft)}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!canResend || isSendingCode}
                      onClick={handleResendCode}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isSendingCode ? 'Sending...' : 'Resend Code'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying OTP Code...</span>
                        </div>
                      ) : (
                        <>
                          <span>Verify & Proceed to New Password</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('email')}
                      className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
                    >
                      Back to Email Step
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 3: SET NEW PASSWORD ================= */}
            {currentStep === 'new-password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Create New Faculty Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Identity verified for <strong className="text-slate-800 font-semibold">{email}</strong>. Enter your new institutional password.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        required
                        autoFocus
                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Password Strength:</span>
                        <span className="font-semibold text-slate-800">{strengthLabel}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthColor} transition-all duration-300 rounded-full ${strengthWidth}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Rule Checklist */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Institutional Password Requirements
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {hasMinLength ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasUpper && hasLower ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {hasUpper && hasLower ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />
                        )}
                        <span>Upper & lowercase</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {hasNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />
                        )}
                        <span>At least 1 number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {passwordsMatch ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />
                        )}
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSavingPassword || !passwordsMatch || !hasMinLength}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPassword ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Keycloak Password...</span>
                      </div>
                    ) : (
                      <>
                        <span>Reset Password & Complete</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ================= STEP 4: SUCCESS CONFIRMATION ================= */}
            {currentStep === 'success' && (
              <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Password Successfully Reset!
                  </h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Your institutional faculty credentials have been updated in the Keycloak identity directory. You can now access your teacher workspace.
                  </p>
                </div>

                <div className="pt-3 max-w-xs mx-auto space-y-2">
                  <button
                    type="button"
                    onClick={() => onPasswordResetSuccess(mockTeacherProfile)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Teacher Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Return to Sign In Screen
                  </button>
                </div>
              </div>
            )}
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
