import { useState, useRef } from 'react';

export default function CampusFavorites({
  products = [],
  onToggleWishlist,
  wishlist = {},
  onOpenProduct
}) {
  const [filter, setFilter] = useState('all');
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Hot Deals' },
    { id: 'study', label: 'Study & Desks' },
    { id: 'appliances', label: 'Mini Appliances' },
    { id: 'seating', label: 'Cozy Seating' },
    { id: 'decor', label: 'Decor & Plants' }
  ];

  const filteredProducts = products.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const handleScroll = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="flex flex-col gap-6 pt-4" id="campus-favorites">
      {/* Header and Carousel Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-primary select-none">✦</span>
          <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
            Campus Favorites
          </h2>
          <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2.5 py-0.5 rounded-full">
            {filteredProducts.length} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll(-300)}
            aria-label="Previous items"
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-secondary-fixed text-primary flex items-center justify-center transition-all shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={() => handleScroll(300)}
            aria-label="Next items"
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-secondary-fixed text-primary flex items-center justify-center transition-all shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`text-[13px] font-semibold px-5 py-2 rounded-full transition-all whitespace-nowrap shadow-xs ${
                isActive
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid / Carousel */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant">
          No items found in this category or corridor.
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto no-scrollbar"
        >
          {filteredProducts.map((product) => {
            const isSaved = !!wishlist[product.id];
            return (
              <article
                key={product.id}
                onClick={() => onOpenProduct(product)}
                className="flex flex-col bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm hover:shadow-[0_12px_28px_rgba(163,0,8,0.12)] transition-all group border border-outline-variant/60 cursor-pointer"
              >
                {/* Image Container with Badges */}
                <div className="w-full aspect-square bg-[#f9f4ee] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-outline-variant/30">
                  <img
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    src={product.image}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    aria-label={`Save ${product.title}`}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-secondary hover:text-primary flex items-center justify-center transition-colors shadow-xs active:scale-90"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isSaved ? 'text-primary fill-icon' : ''}`}>
                      {isSaved ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  <span className="absolute bottom-2.5 left-2.5 text-[11px] bg-surface-container-lowest/95 px-2.5 py-0.5 rounded-full text-on-surface font-semibold shadow-xs border border-outline-variant/40">
                    {product.location}
                  </span>
                </div>

                {/* Title & Price */}
                <div className="pt-3 flex items-end justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-[16px] leading-snug text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <span className="text-[18px] text-primary font-bold mt-0.5">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProduct(product);
                    }}
                    aria-label={`Inquire ${product.title}`}
                    className="shrink-0 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs hover:bg-primary-container transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
