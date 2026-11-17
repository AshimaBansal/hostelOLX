import { useState } from 'react';

export default function LoginModal({ isOpen, onClose, currentUser, onUpdateUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Ashi Bansal',
    email: currentUser?.email || 'ashimabansal@rishihood.edu.in',
    rollNo: currentUser?.rollNo || 'NST25-084',
    program: currentUser?.program || "Newton School of Technology • '25",
    hostel: currentUser?.hostel || 'Hostel 1 (North Wing)',
    roomNo: currentUser?.roomNo || 'Room 312',
    phone: currentUser?.phone || '+91 98765 43210'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
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
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface leading-tight">
                Student Profile & Room Details
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Auto-fills your seller info for campus handovers
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
            />
          </div>

          {/* University Email */}
          <div>
            <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
              University Email (@rishihood.edu.in)
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Hostel & Room Number (Crucial!) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Hostel Corridor
              </label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Roll Number & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Student Roll / ID
              </label>
              <input
                type="text"
                placeholder="e.g. NST25-084"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Details & Update Seller Info</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

