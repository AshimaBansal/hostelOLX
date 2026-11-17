import { useState } from 'react';

export default function ClaimModal({ item, onClose, onConfirmClaim }) {
  const isLostItem = item?.section === 'lost-found';
  const [meetingSpot, setMeetingSpot] = useState('Nescafe Circle');
  const [timeSlot, setTimeSlot] = useState('Today 5:00 PM – 5:30 PM');
  const [claimProof, setClaimProof] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onConfirmClaim && onConfirmClaim(item, meetingSpot, timeSlot, claimProof);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-md w-full rounded-3xl shadow-2xl p-6 border border-outline-variant/60"
      >
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold ${
                isLostItem ? 'bg-amber-600' : 'bg-green-600'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isLostItem ? 'search_check' : 'volunteer_activism'}
              </span>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-on-surface">
                {isLostItem ? 'Claim Found Item' : 'Claim Free Giveaway'}
              </h3>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Verified Student Peer Exchange
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

        {/* Item preview chip */}
        <div className="bg-surface-container-low p-3 rounded-2xl flex items-center gap-3 mb-4 border border-outline-variant/40">
          <img
            src={item.image}
            alt={item.title}
            className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-outline-variant/30 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-on-surface truncate">{item.title}</h4>
            <span
              className={`text-[11px] font-bold ${isLostItem ? 'text-amber-700' : 'text-green-700'}`}
            >
              {isLostItem ? 'Found Item • 0₹ Claim' : 'Free Senior Drop • ₹0'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isLostItem && (
            <div>
              <label className="block font-bold text-on-surface mb-1">
                Ownership Verification Proof *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe a sticker, mark, serial number, or screen lock wallpaper..."
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-2.5 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-on-surface mb-1">
              Select Campus Handover Spot
            </label>
            <select
              value={meetingSpot}
              onChange={(e) => setMeetingSpot(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="Nescafe Circle">Nescafe Circle (Cafeteria, 8 AM - 11 PM)</option>
              <option value="Hostel 1 Courtyard">Hostel 1 Courtyard (North Wing)</option>
              <option value="Central Library Steps">Central Library Steps (Quiet, Fast)</option>
              <option value="Maker Space Porch">Maker Space Porch</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Proposed Meeting Time</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="Today 4:00 PM – 4:30 PM">Today 4:00 PM – 4:30 PM (Between classes)</option>
              <option value="Today 5:30 PM – 6:00 PM">Today 5:30 PM – 6:00 PM (After dinner/classes)</option>
              <option value="Tonight 8:30 PM – 9:00 PM">Tonight 8:30 PM – 9:00 PM (Hostel time)</option>
              <option value="Tomorrow Morning 9:00 AM">Tomorrow Morning 9:00 AM</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-3 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isLostItem
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-green-700 hover:bg-green-800 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {submitted ? 'check_circle' : 'handshake'}
              </span>
              <span>
                {submitted
                  ? 'Claim Confirmed! Opening Chat...'
                  : isLostItem
                  ? 'Submit Claim & Meet Finder'
                  : 'Confirm Free Claim & Set Handover'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

