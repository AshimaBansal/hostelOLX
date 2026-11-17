
export default function CampusPulse({ onJumpFree, onOpenSafety }) {
  return (
    <div className="w-full bg-surface-container-low rounded-full px-4 py-1.5 flex items-center justify-between overflow-hidden shadow-inner">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
        <span className="text-[10px] text-primary uppercase tracking-wider font-bold">
          Campus Pulse
        </span>
      </div>
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-[12px] text-on-surface-variant whitespace-nowrap pl-4">
        <a
          href="#campus-favorites"
          className="flex items-center gap-1.5 text-primary font-semibold hover:underline"
        >
          ⚡ 38 items dropped today
        </a>
        <span className="text-outline-variant">✦</span>
        <span>142 active peer negotiations</span>
        <span className="text-outline-variant">✦</span>
        <button
          onClick={onOpenSafety}
          className="text-tertiary font-semibold hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>Verified @rishihood.edu.in accounts only</span>
        </button>
        <span className="text-outline-variant">✦</span>
        <a
          href="#free-giveaway"
          onClick={onJumpFree}
          className="font-bold text-primary hover:underline bg-secondary-fixed/50 px-2 py-0.5 rounded-full"
        >
          🎁 Free Finds Available
        </a>
        <span className="text-outline-variant">✦</span>
        <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">
          ₹0 Delivery Fee • Immediate Handover
        </span>
      </div>
    </div>
  );
}
