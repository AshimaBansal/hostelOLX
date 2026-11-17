
export default function HeroSection({ onOpenHeroProduct }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Hero Card */}
      <div className="lg:col-span-5 bg-[#ffeae3] rounded-2xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group shadow-sm border border-outline-variant/60">
        <div className="flex justify-between items-start w-full">
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-surface-container-lowest text-primary px-3 py-1 rounded-full shadow-xs font-semibold border border-outline-variant/50">
            <span>✦</span> Edition '25
          </span>
          <span className="text-2xl text-primary leading-none select-none">✦</span>
        </div>

        <div className="my-8 flex flex-col gap-4">
          <h1 className="font-serif text-[42px] sm:text-[54px] text-[#1e1b17] tracking-tight leading-[1.08] font-bold">
            Shape<br />
            <span className="text-primary">Your Campus</span><br />
            Space.
          </h1>
          <p className="text-[16px] text-on-surface-variant max-w-sm font-medium leading-relaxed">
            Curated pre-loved objects & dorm essentials for cozy, high-taste university living.
          </p>
        </div>

        <div className="flex items-end justify-between w-full pt-4">
          <a
            href="#campus-favorites"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-[14px] px-6 py-3 rounded-full shadow-[0_8px_20px_rgba(163,0,8,0.25)] transition-all font-semibold group-hover:translate-x-1"
          >
            <span>Explore Collection</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>

          {/* Decorative Dot Matrix */}
          <div aria-hidden="true" className="grid grid-cols-4 gap-1.5 opacity-30 pr-1">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Hero Lifestyle Showcase */}
      <div className="lg:col-span-7 bg-surface-container-low rounded-2xl overflow-hidden relative min-h-[420px] lg:min-h-[500px] flex flex-col justify-end p-6 sm:p-8 shadow-sm group border border-outline-variant/50">
        <img
          alt="Student dorm lifestyle showcase"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          src="/images/hero_lifestyle.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-inverse-surface/20 to-transparent pointer-events-none"></div>

        {/* Floating Interactive Badges & Card */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-on-surface font-semibold text-xs border border-outline-variant/40">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span>Hostel Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-on-surface font-semibold text-xs border border-outline-variant/40">
              <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
              <span>RISHIHOOD UNIVERSITY</span>
            </span>
          </div>

          {/* Floating Product Highlight */}
          <div
            onClick={onOpenHeroProduct}
            className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-2.5 px-4 shadow-lg flex items-center gap-3 border border-outline-variant/40 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">light</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14px] text-on-surface leading-tight font-bold">Arc Desk Lamp</span>
              <span className="text-[16px] text-primary font-bold">₹399</span>
            </div>
            <button
              aria-label="View Arc Desk Lamp"
              className="w-8 h-8 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-transform active:scale-90 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
