import React from 'react';

export default function ProfileModal({
  isOpen,
  onClose,
  myListings = [],
  currentUser,
  onOpenEditProfile
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-md w-full rounded-3xl shadow-2xl p-6 border border-outline-variant/60 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-[26px]">person</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-xl font-bold text-on-surface">
                  {currentUser?.name || 'Ashi Bansal'}
                </h3>
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                {currentUser?.email || 'ashimabansal@rishihood.edu.in'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Verification Status Pill */}
        <div className="bg-secondary-fixed/40 rounded-2xl p-3.5 mb-4 border border-secondary-fixed flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span>Verified Campus Resident</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {currentUser?.hostel || 'Hostel 1 (North Wing)'} •{' '}
              <strong className="text-primary">{currentUser?.roomNo || 'Room 312'}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenEditProfile && onOpenEditProfile();
            }}
            className="text-[11px] font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-xs hover:bg-primary hover:text-white transition-colors"
          >
            Edit Room
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center mb-5">
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">{myListings.length}</span>
            <p className="text-[10px] text-on-surface-variant font-medium">My Listings</p>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">7</span>
            <p className="text-[10px] text-on-surface-variant font-medium">Handovers</p>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40">
            <span className="text-lg font-bold text-primary">15m</span>
            <p className="text-[10px] text-on-surface-variant font-medium">Avg Handover</p>
          </div>
        </div>

        {/* My Current Listings */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
            My Campus Listings ({myListings.length})
          </h4>
          {myListings.length === 0 ? (
            <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-xl text-center">
              You haven't posted any listings yet. Tap <strong>"+ Sell Item"</strong> in the navbar to start!
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

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-outline-variant/40">
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
