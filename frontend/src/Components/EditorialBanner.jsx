
export default function EditorialBanner() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-4" id="hostel-living">
      {/* Left Lifestyle Card */}
      <div className="lg:col-span-6 bg-surface-container rounded-2xl overflow-hidden relative min-h-[380px] lg:min-h-[460px] shadow-sm group border border-outline-variant/50">
        <img
          alt="Students comfortably gathered with books and laptop"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          src="/images/hero_lifestyle.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[13px] text-primary font-bold shadow-md border border-outline-variant/40">
            ✦ Real Campus Exchange
          </span>
          <span className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] text-on-surface font-semibold shadow-md border border-outline-variant/40">
            Nescafe Courtyard
          </span>
        </div>
      </div>

      {/* Right Editorial Story Card */}
      <div className="lg:col-span-6 bg-[#ffeae3] rounded-2xl p-8 sm:p-10 flex flex-col justify-between border border-outline-variant/60 shadow-sm">
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-surface-container-lowest text-primary px-3 py-1 rounded-full w-fit shadow-xs font-semibold border border-outline-variant/50">
            ✦ Editorial Feature
          </span>
          <h2 className="font-serif text-3xl sm:text-[38px] sm:leading-[46px] text-on-surface tracking-tight font-bold">
            Made for Everyday<br />
            <span className="text-primary">Campus Living.</span>
          </h2>
          <p className="text-[15px] text-on-surface-variant leading-relaxed font-medium">
            Thoughtful pre-loved pieces, modern dorm shapes, and zero delivery wait times — re-homed right in your hostel corridors. From study lamps to books, pass on what you love to fellow students.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col bg-surface-container-lowest/90 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/40 shadow-xs">
              <span className="text-[20px] text-primary font-bold">15 Mins</span>
              <span className="text-[13px] text-on-surface-variant font-medium">
                Average Handover Time
              </span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest/90 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/40 shadow-xs">
              <span className="text-[20px] text-primary font-bold">₹0 Cost</span>
              <span className="text-[13px] text-on-surface-variant font-medium">
                Zero Shipping or Fees
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center gap-4">
          <a
            href="#dorm-essentials"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-[14px] px-6 py-3 rounded-full shadow-[0_8px_20px_rgba(163,0,8,0.25)] transition-all font-semibold"
          >
            <span>Shop Student Looks</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}
