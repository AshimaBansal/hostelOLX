import { useState } from 'react';

export default function SpecialSections({
  products = [],
  activeTab,
  onOpenProduct,
  onOpenSellModal,
  onClaimItem,
  onContactRequester,
  onOpenReportModal
}) {
  const [lostCategory, setLostCategory] = useState('all');
  const [postRequestOpen, setPostRequestOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [requestUrgency, setRequestUrgency] = useState('Needed this week');
  const [requestsList, setRequestsList] = useState([
    {
      id: 'req-1',
      title: 'Looking for: Foldable Bed Study Table with Cup Holder',
      budget: 'Under ₹400',
      requester: 'Kartik (Tech 27)',
      location: 'Hostel 1',
      urgency: 'Needed before mid-terms'
    },
    {
      id: 'req-2',
      title: 'Looking for: Electric Water Kettle (0.5L – 1L)',
      budget: 'Under ₹500',
      requester: 'Sanya (MBA 26)',
      location: 'Makers Block',
      urgency: 'Needed this week'
    },
    {
      id: 'req-3',
      title: 'Looking for: Lab Coat (Size M) for Chemistry Practical',
      budget: 'Borrow / ₹150',
      requester: 'Aditi (Design 27)',
      location: 'Gargi Block',
      urgency: 'Urgent for Monday morning'
    }
  ]);

  const freeItems = products.filter((p) => p.section === 'free' || p.price === 0);
  const lostFoundItems = products.filter((p) => p.section === 'lost-found');

  const filteredLostItems = lostFoundItems.filter((item) => {
    if (lostCategory === 'all') return true;
    return item.category === lostCategory;
  });

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestTitle.trim()) return;
    const newReq = {
      id: 'req-' + Date.now(),
      title: 'Looking for: ' + requestTitle.trim(),
      budget: requestBudget.trim() ? `Under ₹${requestBudget}` : 'Flexible',
      requester: 'Ashi (You, NST 25)',
      location: 'Hostel 1',
      urgency: requestUrgency
    };
    setRequestsList([newReq, ...requestsList]);
    setRequestTitle('');
    setRequestBudget('');
    setPostRequestOpen(false);
  };

  return (
    <div className="flex flex-col gap-12 w-full">
      {/* 1. FREE & GIVEAWAY SECTION */}
      <section
        id="free-giveaway"
        className={`flex flex-col gap-6 pt-6 transition-all ${
          activeTab === 'free-giveaway'
            ? 'p-6 sm:p-8 bg-secondary-fixed/20 rounded-3xl border-2 border-primary/30 shadow-md ring-4 ring-primary/10'
            : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-secondary-fixed/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                Free & Campus Giveaway Drops (₹0)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Senior hand-me-downs, study notes, and dorm essentials passing to juniors for free.
            </p>
          </div>
          <button
            onClick={() => onOpenSellModal && onOpenSellModal('free')}
            className="bg-green-700 hover:bg-green-800 text-white text-xs px-5 py-2.5 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Post Free Giveaway</span>
          </button>
        </div>

        {/* Free Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {freeItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => onOpenProduct(item)}
                  className="w-full aspect-square bg-[#f9f4ee] rounded-xl relative overflow-hidden flex items-center justify-center p-3 mb-3 cursor-pointer border border-outline-variant/30"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-green-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                    FREE ₹0
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 text-[11px] bg-surface-container-lowest/95 text-on-surface font-semibold px-2.5 py-0.5 rounded-full shadow-xs border border-outline-variant/40">
                    {item.location}
                  </span>
                </div>

                <h4
                  onClick={() => onOpenProduct(item)}
                  className="font-bold text-sm text-on-surface truncate cursor-pointer group-hover:text-primary transition-colors"
                >
                  {item.title}
                </h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/40 flex justify-between items-center text-xs">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  By {item.seller}
                </span>
                <button
                  onClick={() => onClaimItem(item)}
                  className="bg-primary hover:bg-primary-container text-on-primary font-bold px-3 py-1.5 rounded-full text-xs shadow-xs transition-transform active:scale-95"
                >
                  Claim Free →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LOST & FOUND SECTION */}
      <section
        id="lost-and-found"
        className={`flex flex-col gap-6 pt-6 transition-all scroll-mt-36 ${
          activeTab === 'lost-and-found'
            ? 'p-6 sm:p-8 bg-amber-50/70 rounded-3xl border-2 border-amber-600/40 shadow-md ring-4 ring-amber-500/10'
            : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-secondary-fixed/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">search_check</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                Lost & Found Hub
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Found belongings in classrooms, Nescafe, library, or corridor foyers. Verify to reclaim.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenReportModal && onOpenReportModal('found')}
              className="bg-primary hover:bg-primary-container text-on-primary text-xs px-4 py-2 rounded-full font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>Report Found Item</span>
            </button>
          </div>
        </div>

        {/* Filter Pills for Lost & Found */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          {['all', 'study', 'appliances', 'decor'].map((cat) => (
            <button
              key={cat}
              onClick={() => setLostCategory(cat)}
              className={`px-4 py-1.5 rounded-full transition-colors capitalize ${
                lostCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat === 'all' ? 'All Found Items' : cat}
            </button>
          ))}
        </div>

        {/* Lost & Found Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredLostItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs hover:border-primary/50 transition-all flex gap-4 items-center"
            >
              <div
                onClick={() => onOpenProduct(item)}
                className="w-24 h-24 bg-[#f9f4ee] rounded-2xl p-2 shrink-0 flex items-center justify-center border border-outline-variant/30 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase">
                    Verified Found Item
                  </span>
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {item.location}
                  </span>
                </div>

                <h4
                  onClick={() => onOpenProduct(item)}
                  className="font-bold text-sm sm:text-base text-on-surface truncate mt-1.5 cursor-pointer hover:text-primary transition-colors"
                >
                  {item.title}
                </h4>
                <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                  {item.description}
                </p>

                <div className="flex justify-between items-center text-xs font-bold mt-3 pt-2 border-t border-outline-variant/30">
                  <span className="text-on-surface-variant text-[11px]">
                    With {item.seller}
                  </span>
                  <button
                    onClick={() => onClaimItem(item)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-full text-xs transition-transform active:scale-95 shadow-xs"
                  >
                    Claim Ownership →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WANTED / STUDENT WISH REQUESTS SECTION */}
      <section
        id="wanted-requests"
        className={`flex flex-col gap-6 pt-6 transition-all scroll-mt-36 ${
          activeTab === 'wanted-requests'
            ? 'p-6 sm:p-8 bg-surface-container-low rounded-3xl border-2 border-primary/40 shadow-md ring-4 ring-primary/10'
            : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-secondary-fixed/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">assignment</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                Wanted & Student Wish Requests
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Looking for something specific? Post a request so peers in your corridor can reach out.
            </p>
          </div>
          <button
            onClick={() => setPostRequestOpen(true)}
            className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>+ Post a Request</span>
          </button>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {requestsList.map((req) => (
            <div
              key={req.id}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-secondary uppercase bg-secondary-fixed px-2.5 py-0.5 rounded-full">
                    {req.location}
                  </span>
                  <span className="text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                    {req.budget}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-1.5 leading-snug">
                  {req.title}
                </h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-600">schedule</span>
                  <span>{req.urgency}</span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {req.requester}
                </span>
                <button
                  onClick={() => onContactRequester(req)}
                  className="bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-bold px-3 py-1.5 rounded-full text-xs transition-colors shadow-xs"
                >
                  I Have This →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Post a Request */}
        {postRequestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/60">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/40">
                <h3 className="font-serif text-xl font-bold text-on-surface">
                  Post a Student Request
                </h3>
                <button
                  onClick={() => setPostRequestOpen(false)}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">What are you looking for?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Mouse, Lab Manual, Standing Mirror"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Your Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 300 (or leave blank if flexible)"
                    value={requestBudget}
                    onChange={(e) => setRequestBudget(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Urgency</label>
                  <select
                    value={requestUrgency}
                    onChange={(e) => setRequestUrgency(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Urgent for today">Urgent for today</option>
                    <option value="Needed this week">Needed this week</option>
                    <option value="Before end-term exams">Before end-term exams</option>
                    <option value="Flexible timeline">Flexible timeline</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-full font-bold text-xs shadow-md mt-2 transition-all active:scale-95"
                >
                  Publish Request to Corridor Board
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
