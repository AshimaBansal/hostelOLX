import { useAuth } from '../context/useAuth';

export default function ProfileModal({
  isOpen,
  onClose,
  myListings = [],
  currentUser,
  onOpenEditProfile
}) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  const displayName = user?.fullName || currentUser?.name || (isAuthenticated ? 'Student' : 'Guest Student');
  const displayEmail = user?.email || currentUser?.email || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-md w-full rounded-3xl shadow-2xl p-6 border border-outline-variant/60 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-[26px]">person</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-xl font-bold text-on-surface">
                  {displayName}
                </h3>
              </div>
              {displayEmail && (
                <p className="text-xs text-on-surface-variant font-medium">
                  {displayEmail}
                </p>
              )}
              {user?.role && (
                <span className="inline-block mt-1 text-[10px] bg-tertiary/10 text-tertiary font-bold px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="bg-secondary-fixed/40 rounded-2xl p-3.5 mb-4 border border-secondary-fixed flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-[16px]">
                {isAuthenticated ? 'account_circle' : 'person_outline'}
              </span>
              <span>{isAuthenticated ? 'Google Account Authenticated' : 'Guest Account'}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {currentUser?.hostel || 'Hostel unassigned'} •{' '}
              <strong className="text-primary">{currentUser?.roomNo || 'Room unassigned'}</strong>
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                onClose();
                onOpenEditProfile && onOpenEditProfile();
              }}
              className="text-[11px] font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-xs hover:bg-primary hover:text-white transition-colors"
            >
              Edit Room
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center mb-5">
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">{myListings.length}</span>
            <p className="text-[10px] text-on-surface-variant font-medium">My Listings</p>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">—</span>
            <p className="text-[10px] text-on-surface-variant font-medium">Handovers (Demo)</p>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">—</span>
            <p className="text-[10px] text-on-surface-variant font-medium">Avg Handover (Demo)</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
            My Campus Listings ({myListings.length})
          </h4>
          {myListings.length === 0 ? (
            <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-xl text-center">
              You haven't posted any listings yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between border border-outline-variant/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-outline-variant/30"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">
                        {item.title}
                      </p>
                      <span className="text-[11px] font-bold text-primary">
                        {item.price === 0 ? 'FREE ₹0' : `₹${item.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-outline-variant/40 space-y-2">
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-200"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out of Google Account</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-2.5 rounded-full font-bold text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
