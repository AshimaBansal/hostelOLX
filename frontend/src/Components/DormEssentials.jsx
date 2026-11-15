import React from 'react';

export default function DormEssentials({
  products = [],
  onToggleWishlist,
  wishlist = {},
  onOpenProduct,
  onOpenHandoverSpots
}) {
  return (
    <section className="flex flex-col gap-6 pt-6" id="dorm-essentials">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-secondary-fixed/40 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary select-none">✦</span>
            <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
              Dorm Essentials & Quick Drops
            </h2>
            <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2.5 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
          <p className="text-[14px] text-secondary">
            Verified student-priced essentials under ₹699 from Atrium, R1, and Hostel corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHandoverSpots}
            className="bg-secondary-fixed text-on-secondary-fixed text-[12px] px-4 py-1.5 rounded-full flex items-center gap-1.5 font-semibold hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Instant Foyer Handover</span>
          </button>
        </div>
      </div>

      {/* 8-Item Product Grid */}
      {products.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant">
          No essentials match your current search or corridor filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((item) => {
            const isSaved = !!wishlist[item.id];
            return (
              <article
                key={item.id}
                onClick={() => onOpenProduct(item)}
                className="flex flex-col bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm hover:shadow-[0_12px_28px_rgba(163,0,8,0.1)] transition-all group border border-outline-variant/60 cursor-pointer"
              >
                {/* Product Thumbnail */}
                <div className="w-full aspect-square bg-[#f9f4ee] rounded-xl relative overflow-hidden flex items-center justify-center p-1 border border-outline-variant/30">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    src={item.image}
                  />
                  <span className="absolute top-2.5 left-2.5 bg-surface-container-lowest/95 backdrop-blur-sm text-[11px] text-on-surface px-2.5 py-0.5 rounded-full shadow-xs font-semibold border border-outline-variant/40">
                    {item.condition}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(item.id);
                    }}
                    aria-label={`Save ${item.title}`}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-container-lowest/90 text-secondary hover:text-primary flex items-center justify-center shadow-xs transition-colors active:scale-90"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isSaved ? 'text-primary fill-icon' : ''}`}>
                      {isSaved ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>

                {/* Product Meta */}
                <div className="pt-3 flex flex-col gap-1">
                  <h3 className="text-[15px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[17px] text-primary font-bold">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-[12px] text-outline line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 text-on-surface-variant border-t border-outline-variant/40 text-xs font-medium">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                      {item.location}
                    </span>
                    <span className="truncate max-w-[100px]">{item.seller}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
