import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/useAuth';

export default function LoginModal({ isOpen, onClose, currentUser, onUpdateUser, onSuccess }) {
  const {
    user,
    isAuthenticated,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginDemoStudent,
    isLoading,
    error,
    clearError,
    logout,
  } = useAuth();

  const defaultValues = {
    name: user?.fullName || currentUser?.name || '',
    email: user?.email || currentUser?.email || '',
    rollNo: currentUser?.rollNo || '',
    program: currentUser?.program || '',
    hostel: currentUser?.hostel || 'Hostel 1 (North Wing)',
    roomNo: currentUser?.roomNo || '',
    phone: currentUser?.phone || '',
  };

  const [formOverrides, setFormOverrides] = useState({});
  const formData = { ...defaultValues, ...formOverrides };

  const [authMethod, setAuthMethod] = useState('email');
  const [emailMode, setEmailMode] = useState('signin');
  const [emailForm, setEmailForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleModalClose = useCallback(() => {
    clearError();
    setLocalError(null);
    setLocalSubmitting(false);
    setShowPassword(false);
    setEmailForm({ fullName: '', email: '', password: '', confirmPassword: '' });
    onClose();
  }, [clearError, onClose]);

  const handleDemoSignIn = () => {
    if (loginDemoStudent) {
      const result = loginDemoStudent();
      const signedInUser = result?.user;
      if (signedInUser && onUpdateUser) {
        onUpdateUser((prev) => ({
          ...prev,
          name: signedInUser.fullName || prev?.name || '',
          email: signedInUser.email || prev?.email || '',
          hostel: signedInUser.hostel || prev?.hostel || 'Hostel 1 (North Wing)',
          roomNo: signedInUser.roomNo || prev?.roomNo || '102',
          program: signedInUser.program || prev?.program || "Tech '27",
        }));
      }
      if (onSuccess) {
        onSuccess(signedInUser);
      }
      handleModalClose();
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedEmail = (emailForm.email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      setLocalError('Please enter your campus email address.');
      return;
    }

    const isInstitutional =
      trimmedEmail.endsWith('@nst.rishihood.edu.in') ||
      trimmedEmail.endsWith('@rishihood.edu.in');

    if (!isInstitutional) {
      setLocalError(
        'Registration and login are restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
      );
      return;
    }

    if (!emailForm.password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (emailMode === 'register') {
      const trimmedName = (emailForm.fullName || '').trim();
      if (trimmedName.length < 2) {
        setLocalError('Full name must contain at least 2 characters.');
        return;
      }

      if (emailForm.password.length < 8) {
        setLocalError('Password must contain at least 8 characters.');
        return;
      }

      if (
        !/[a-z]/.test(emailForm.password) ||
        !/[A-Z]/.test(emailForm.password) ||
        !/[0-9]/.test(emailForm.password)
      ) {
        setLocalError(
          'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
        );
        return;
      }

      if (emailForm.password !== emailForm.confirmPassword) {
        setLocalError('Passwords do not match. Please verify and re-enter.');
        return;
      }
    }

    setLocalSubmitting(true);

    try {
      let result;
      if (emailMode === 'signin') {
        result = await loginWithEmail(trimmedEmail, emailForm.password);
      } else {
        result = await registerWithEmail({
          fullName: emailForm.fullName.trim(),
          email: trimmedEmail,
          password: emailForm.password,
        });
      }

      const signedInUser = result?.user;
      if (signedInUser && onUpdateUser) {
        onUpdateUser((prev) => ({
          ...prev,
          name: signedInUser.fullName || prev?.name || '',
          email: signedInUser.email || prev?.email || '',
        }));
      }
      if (onSuccess) {
        onSuccess(signedInUser);
      }
      handleModalClose();
    } catch (err) {
      const formattedMessage =
        Array.isArray(err.errors) && err.errors.length > 0
          ? err.errors.map((item) => item.message).join(' ')
          : (err.message || 'Authentication failed.');
      setLocalError(formattedMessage);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const authCallbacksRef = useRef({
    loginWithGoogle,
    onUpdateUser,
    currentUser,
    onSuccess,
    onClose,
  });

  useEffect(() => {
    authCallbacksRef.current = {
      loginWithGoogle,
      onUpdateUser,
      currentUser,
      onSuccess,
      onClose: handleModalClose,
    };
  }, [loginWithGoogle, onUpdateUser, currentUser, onSuccess, handleModalClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    let isMounted = true;

    const initGis = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current || !googleClientId) return;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) return;
            try {
              const result = await authCallbacksRef.current.loginWithGoogle(response.credential);
              if (result?.user && authCallbacksRef.current.onUpdateUser) {
                authCallbacksRef.current.onUpdateUser((prev) => ({
                  ...prev,
                  name: result.user.fullName || prev?.name || '',
                  email: result.user.email || prev?.email || '',
                }));
              }
              if (authCallbacksRef.current.onSuccess) {
                authCallbacksRef.current.onSuccess(result?.user);
              }
              authCallbacksRef.current.onClose();
            } catch (err) {
              void err;
            }
          },
          auto_select: false,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }
      } catch (err) {
        void err;
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          if (isMounted) initGis();
        }
      }, 200);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, authMethod, googleClientId, isAuthenticated]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    handleModalClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 border border-outline-variant/60 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">
                {isAuthenticated ? 'badge' : 'lock'}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface leading-tight">
                {isAuthenticated ? 'Student Profile & Room Details' : 'Student Sign-In'}
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {isAuthenticated
                  ? 'Configure your room coordinates for campus handovers'
                  : 'Sign in to access your campus marketplace, chats, and wishlists'}
              </span>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {isAuthenticated ? (
          <div className="bg-secondary-fixed/40 border border-secondary-fixed rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{user.fullName || user.email}</p>
                <p className="text-xs text-on-surface-variant">
                  {user.email} • {user.role || 'STUDENT'}
                </p>
                <span className="inline-block mt-0.5 text-[10px] text-primary font-semibold">
                  Verified Student Account
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-primary hover:underline px-2 py-1"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-4 mb-4 border border-outline-variant/60">
            {/* Auth method tabs */}
            <div className="flex bg-surface-container rounded-xl p-1 mb-3.5 border border-outline-variant/40">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); clearError(); setLocalError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'email'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Campus Email
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('google'); clearError(); setLocalError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'google'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Google Sign-In
              </button>
            </div>

            {authMethod === 'google' ? (
              <div className="text-center py-1">
                <p className="text-[11px] text-on-surface-variant mb-3">
                  Sign in with your verified campus account to buy, sell, and message peers.
                </p>

                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-primary text-xs font-bold animate-pulse">
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Authenticating with server...</span>
                  </div>
                ) : googleClientId && window.google?.accounts?.id ? (
                  <div className="flex justify-center items-center my-2">
                    <div ref={googleBtnRef} className="min-h-[44px] flex justify-center"></div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 py-3 px-4 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 my-1"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign in as Verified Student</span>
                  </button>
                )}

                {error && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-left">
                      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearError}
                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* 1-Click Fast Demo Sign-In */}
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 mb-3"
                >
                  <span className="material-symbols-outlined text-[17px]">bolt</span>
                  <span>Instant 1-Click Student Sign-In</span>
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="border-t border-outline-variant/40 w-full"></div>
                  <span className="bg-surface-container-low px-2 text-[10px] uppercase tracking-wider font-bold text-on-surface-variant shrink-0">
                    Or Enter Campus Credentials
                  </span>
                  <div className="border-t border-outline-variant/40 w-full"></div>
                </div>

                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    {emailMode === 'signin' ? 'Campus Login' : 'Student Registration'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode(emailMode === 'signin' ? 'register' : 'signin');
                      setLocalError(null);
                      setShowPassword(false);
                      setEmailForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {emailMode === 'signin' ? 'Need an account? Register' : 'Have an account? Sign In'}
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-2.5 text-xs">
                  {emailMode === 'register' && (
                    <div>
                      <label className="block font-bold text-on-surface mb-1 text-[10px] uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={localSubmitting}
                        placeholder="e.g. Your Full Name"
                        value={emailForm.fullName}
                        onChange={(e) => setEmailForm({ ...emailForm, fullName: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium text-xs disabled:opacity-60"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-on-surface mb-1 text-[10px] uppercase tracking-wider">
                      Campus Email *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={localSubmitting}
                      placeholder="e.g. student@nst.rishihood.edu.in"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium text-xs disabled:opacity-60"
                    />
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">
                      Must be @nst.rishihood.edu.in or @rishihood.edu.in
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-on-surface text-[10px] uppercase tracking-wider">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={localSubmitting}
                      minLength={8}
                      placeholder={emailMode === 'register' ? 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number' : 'Your password'}
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium text-xs disabled:opacity-60"
                    />
                  </div>

                  {emailMode === 'register' && (
                    <div>
                      <label className="block font-bold text-on-surface mb-1 text-[10px] uppercase tracking-wider">
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={localSubmitting}
                        placeholder="Re-enter your password"
                        value={emailForm.confirmPassword}
                        onChange={(e) => setEmailForm({ ...emailForm, confirmPassword: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium text-xs disabled:opacity-60"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            emailForm.password.length >= 8
                              ? 'bg-green-100 text-green-800'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          8+ chars
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            /[A-Z]/.test(emailForm.password) && /[a-z]/.test(emailForm.password)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          Aa & 123
                        </span>
                        {emailForm.confirmPassword && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              emailForm.password === emailForm.confirmPassword
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {emailForm.password === emailForm.confirmPassword
                              ? 'Passwords match'
                              : 'Passwords differ'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {localError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl p-2 flex items-center justify-between">
                      <span>{localError}</span>
                      <button
                        type="button"
                        onClick={() => setLocalError(null)}
                        className="text-red-500 font-bold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={localSubmitting}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-full font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2"
                  >
                    {localSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{emailMode === 'signin' ? 'Sign In with Campus Email' : 'Register Student Account'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-outline-variant/40 w-full"></div>
          <span className="bg-surface-container-lowest px-3 text-[10px] uppercase tracking-wider font-bold text-on-surface-variant shrink-0">
            Handover & Room Coordinates
          </span>
          <div className="border-t border-outline-variant/40 w-full"></div>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormOverrides({ ...formOverrides, name: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormOverrides({ ...formOverrides, email: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                  Hostel Corridor
                </label>
                <select
                  value={formData.hostel}
                  onChange={(e) => setFormOverrides({ ...formOverrides, hostel: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Hostel 1 (North Wing)">Hostel 1 (North Wing)</option>
                  <option value="Hostel 2 (South Wing)">Hostel 2 (South Wing)</option>
                  <option value="Gargi Block">Gargi Block</option>
                  <option value="Makers Bhavan">Makers Bhavan</option>
                  <option value="Atrium">Atrium</option>
                  <option value="R1 Block">R1 Block</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 312, B-204"
                  value={formData.roomNo}
                  onChange={(e) => setFormOverrides({ ...formOverrides, roomNo: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                  Student Roll / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student ID or Roll No"
                  value={formData.rollNo}
                  onChange={(e) => setFormOverrides({ ...formOverrides, rollNo: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                  WhatsApp / Mobile
                </label>
                <input
                  type="tel"
                  placeholder="For handover coordination"
                  value={formData.phone}
                  onChange={(e) => setFormOverrides({ ...formOverrides, phone: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <p className="text-[10px] text-on-surface-variant">
              Room and contact coordinates are stored locally in session state for handover display and are separate from your Google account.
            </p>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Room Details</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 text-center text-xs text-on-surface-variant">
            <div className="flex items-center justify-center gap-1.5 font-bold text-on-surface mb-1">
              <span className="material-symbols-outlined text-[18px] text-primary">info</span>
              <span>Handover Coordinates</span>
            </div>
            <p>
              Please sign in above to configure your room number and handover contact details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
