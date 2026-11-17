
export default function Footer({ onOpenHandoverSpots, onOpenSafety }) {
  return (
    <footer className="w-full bg-surface-container-low mt-10 border-t border-surface-container-high" id="handover-spots">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-6 border-b border-surface-container-high">
          {/* Handover Spots */}
          <div
            onClick={onOpenHandoverSpots}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-primary text-[16px] font-semibold group-hover:underline">
              <span className="material-symbols-outlined text-[24px]">pin_drop</span>
              <span>Campus Handover Spots</span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Zero delivery wait times. Meet securely at Hostel 1 Courtyard, Maker Space Porch, Central Library Steps, or Nescafe Circle.
            </p>
            <span className="text-xs font-bold text-primary group-hover:underline mt-1">
              View Spots & Timings →
            </span>
          </div>

          {/* Student Safety Shield */}
          <div
            onClick={onOpenSafety}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-primary text-[16px] font-semibold group-hover:underline">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
              <span>Student Safety Shield</span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Verified .edu / Rishihood university email credentials mandatory. Zero strangers, 100% peer-vetted campus trades.
            </p>
            <span className="text-xs font-bold text-primary group-hover:underline mt-1">
              Safety Guidelines →
            </span>
          </div>

          {/* 0₹ Campus Shipping */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary text-[16px] font-semibold">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
              <span>0₹ Campus Shipping</span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              No courier charges, ever. Hand-to-hand transactions keep prices rock-bottom for dorm decor, monitors, and textbooks.
            </p>
          </div>

          {/* Rishihood Trust Seal */}
          <div
            onClick={onOpenSafety}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-secondary text-[16px] font-semibold group-hover:underline">
              <span className="material-symbols-outlined text-[24px]">school</span>
              <span>Rishihood Trust Seal</span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Endorsed student enterprise initiative at Rishihood University campus, supporting sustainable circular student living.
            </p>
          </div>
        </div>

        {/* Bottom Tagline & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container rounded-xl px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[18px] text-primary font-bold">HOSTELOLX</span>
            <span className="text-[13px] text-on-surface-variant">
              ✦ Designed exclusively for university residence life
            </span>
          </div>
          <div className="text-[12px] text-on-surface-variant">
            © 2026 HOSTELOLX Campus Marketplace. Made by students, for students.
          </div>
        </div>
      </div>
    </footer>
  );
}
