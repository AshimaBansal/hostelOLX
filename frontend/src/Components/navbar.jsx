import { useState } from 'react';

const HOSTELS = [
  'All Hostels',
  'Hostel 1',
  'Hostel 2',
  'Gargi Block',
  'Makers Bhavan',
  'Atrium',
  'R1'
];

export default function Navbar({
  savedCount = 0,
  unreadCount = 3,
  onOpenWishlist,
  onOpenChat,
  onOpenSellModal,
  onOpenProfile,
  onOpenHandoverSpots,
  searchQuery,
  onSearchChange,
  selectedHostel,
  onHostelChange,
  activeTab,
  onTabChange
}) {
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);

  const navLinks = [
    { id: 'shop-campus', label: 'Shop Campus', icon: 'shopping_bag', targetId: 'campus-favorites' },
    { id: 'dorm-essentials', label: 'Dorm Essentials', icon: 'menu_book', targetId: 'dorm-essentials' },
    { id: 'lost-and-found', label: 'Lost & Found', icon: 'search_check', targetId: 'lost-and-found' },
    { id: 'free-giveaway', label: 'Free & Giveaway', icon: 'volunteer_activism', targetId: 'free-giveaway' },
    { id: 'wanted-requests', label: 'Wanted / Requests', icon: 'assignment', targetId: 'wanted-requests' },
    { id: 'pickup-spots', label: 'Pickup Spots', icon: 'location_on', targetId: 'handover-spots' },
  ];

  const handleNavClick = (link, e) => {
    e.preventDefault();
    onTabChange(link.id);

    if (link.id === 'pickup-spots') {
      onOpenHandoverSpots && onOpenHandoverSpots();
      return;
    }

    const elem = document.getElementById(link.targetId);
    if (elem) {
      const yOffset = -130;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container-high shadow-sm px-4 lg:px-12 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Main Header Row */}
        <div className="bg-surface-container-lowest rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(163,0,8,0.06)] border border-outline-variant/60">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('shop-campus');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[20px] font-bold text-primary tracking-tight leading-none">
                  HOSTELOLX
                </span>
                <span className="text-[9px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  CAMPUS MARKETPLACE
                </span>
              </div>
            </a>
          </div>

          {/* Interactive Search Bar + Hostel Filter Pill */}
          <div className="flex-1 max-w-lg mx-4 hidden md:flex items-center bg-surface-container-low rounded-full px-3 py-1.5 shadow-inner relative">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-1">
              search
            </span>
            <input
              type="text"
              placeholder="Search across Hostels, Atrium, R1, gadgets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-on-surface placeholder:text-on-surface-variant text-[13px] focus:outline-none w-full px-2"
            />

            {/* Hostel Selector Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHostelDropdown((prev) => !prev)}
                className="bg-secondary-fixed text-on-secondary-fixed text-[11px] px-3 py-1 rounded-full shrink-0 font-semibold border border-secondary/20 hover:bg-secondary-container transition-colors flex items-center gap-1"
              >
                <span>{selectedHostel}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {showHostelDropdown ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showHostelDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/60 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/30 mb-1">
                    Filter By Corridor
                  </div>
                  {HOSTELS.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        onHostelChange(h);
                        setShowHostelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-surface-container transition-colors ${
                        selectedHostel === h ? 'text-primary font-bold bg-secondary-fixed/30' : 'text-on-surface'
                      }`}
                    >
                      <span>{h}</span>
                      {selectedHostel === h && (
                        <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              title="Open Saved Wishlist"
              aria-label="Saved items"
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-all border border-outline-variant/40 relative active:scale-90"
            >
              <span className={`material-symbols-outlined text-[20px] ${savedCount > 0 ? 'text-primary fill-icon' : ''}`}>
                favorite
              </span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Messages / Chat Button */}
            <button
              onClick={onOpenChat}
              title="Open Messages"
              aria-label="Messages"
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-all border border-outline-variant/40 relative active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Sell Item CTA */}
            <button
              onClick={() => onOpenSellModal && onOpenSellModal()}
              title="Post an Item for Sale or Giveaway"
              className="bg-primary hover:bg-primary-container text-on-primary text-[14px] px-4 py-2 rounded-full flex items-center gap-1.5 shadow-[0_4px_12px_rgba(163,0,8,0.25)] transition-all font-semibold active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Sell Item</span>
            </button>

            {/* Student Profile Chip */}
            <button
              onClick={onOpenProfile}
              title="View Student Profile"
              className="hidden lg:flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed pl-3 pr-1 py-1 rounded-full border border-tertiary/20 shadow-xs hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
              <div className="flex flex-col text-left">
                <span className="text-[12px] leading-tight font-bold text-on-surface">Ashi</span>
                <span className="text-[10px] text-tertiary leading-none font-semibold">NST '25</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ml-1 text-on-primary">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </button>
          </div>
        </div>

        {/* Subnavigation Pills */}
        <nav className="w-full overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center justify-between gap-2.5 min-w-[700px] lg:min-w-0">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.targetId}`}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`flex-1 border rounded-full py-2 px-3 flex items-center justify-center gap-2 shadow-xs group transition-all text-[13px] font-semibold tracking-tight cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-lowest hover:bg-surface-container border-outline-variant/60 hover:border-primary/50 text-on-surface hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary' : 'text-primary'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
