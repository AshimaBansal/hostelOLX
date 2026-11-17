
const REVIEWS = [
  {
    quote: '"Sold my study desk and bouclé pouf within 20 minutes of listing. Handed it over directly in the Hostel 1 courtyard without any packing hassle."',
    initials: 'AK',
    name: 'Ananya Kapoor',
    details: "Design '25 • Hostel 1",
    bgColor: 'bg-secondary-fixed text-primary'
  },
  {
    quote: '"Grabbed this vintage radio and mini kettle for half the retail cost. Met the senior right at the Nescafe stairs between class breaks. Super safe!"',
    initials: 'RS',
    name: 'Rohan Sharma',
    details: "Tech '27 • Hostel 2",
    bgColor: 'bg-tertiary-fixed text-tertiary'
  },
  {
    quote: '"The verified email barrier completely prevents spam. Only people from our campus community. My dorm aesthetic leveled up on a student budget."',
    initials: 'MG',
    name: 'Meera Ghosh',
    details: "MBA '26 • Makers Block",
    bgColor: 'bg-secondary-fixed text-primary'
  }
];

export default function Testimonials() {
  return (
    <section className="bg-secondary-fixed/30 rounded-2xl p-6 sm:p-10 flex flex-col gap-6 border border-secondary-fixed/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-primary uppercase tracking-widest font-bold">
            Peer Testimonials
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-on-surface font-bold mt-1">
            Trusted in every hostel corridor
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full shadow-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
          <span className="text-[13px] text-on-surface font-semibold">
            100% Student Verified Trades
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {REVIEWS.map((review, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-xs border border-surface-container-high"
          >
            <p className="text-[14px] text-secondary italic leading-relaxed">
              {review.quote}
            </p>
            <div className="flex items-center gap-3 pt-5">
              <div
                className={`w-9 h-9 rounded-full ${review.bgColor} flex items-center justify-center font-bold text-xs`}
              >
                {review.initials}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[14px] text-on-surface leading-tight font-semibold">
                  {review.name}
                </span>
                <span className="text-[11px] text-on-surface-variant">{review.details}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

