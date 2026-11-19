import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth';

export default function LoginModal({ isOpen, onClose, currentUser, onUpdateUser, onSuccess }) {
  const { user, isAuthenticated, loginWithGoogle, isLoading, error, clearError, logout } = useAuth();

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

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
      onClose,
    };
  }, [loginWithGoogle, onUpdateUser, currentUser, onSuccess, onClose]);

  useEffect(() => {
    if (!isOpen) {
      clearError();
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
  }, [isOpen, googleClientId, isAuthenticated, clearError]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    onClose();
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
                  : 'Sign in with your Google account to access all features'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
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
                  Google Account Authenticated
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
          <div className="bg-surface-container-low rounded-2xl p-4 mb-4 border border-outline-variant/60 text-center">
            <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Google Sign-In
            </p>
            <p className="text-[11px] text-on-surface-variant mb-3">
              Sign in with your Google account to buy, sell, claim items, and message peers. Google sign-in authenticates your identity; campus residency is not independently verified.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-primary text-xs font-bold animate-pulse">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Authenticating with server...</span>
              </div>
            ) : (
              <div className="flex justify-center items-center my-2">
                <div ref={googleBtnRef} className="min-h-[44px] flex justify-center"></div>
              </div>
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

            {!googleClientId && (
              <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-xl p-2.5 text-left">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
                  <span>Google Client ID Not Configured</span>
                </div>
                <p>
                  Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> in{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">frontend/.env</code> to enable Google Sign-In.
                </p>
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
              Please sign in with your Google account above to configure your room number and handover contact details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
