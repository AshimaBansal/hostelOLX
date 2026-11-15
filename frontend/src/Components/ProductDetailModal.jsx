import React, { useState } from 'react';

export default function ProductDetailModal({
  product,
  onClose,
  onToggleWishlist,
  isSaved,
  onStartChat,
  onMakeOffer
}) {
  if (!product) return null;

  const [selectedSpot, setSelectedSpot] = useState('Nescafe Circle');
  const [offerPrice, setOfferPrice] = useState(product.price);
  const [offerSent, setOfferSent] = useState(false);

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleSendOffer = () => {
    onMakeOffer && onMakeOffer(product, offerPrice, selectedSpot);
    setOfferSent(true);
    setTimeout(() => {
      onStartChat && onStartChat(product, `Offered ₹${offerPrice} with pickup at ${selectedSpot}`);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/60 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
      >
        {/* Left Image Area */}
        <div className="md:w-1/2 bg-[#f9f4ee] p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-outline-variant/40">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-secondary hover:text-primary flex items-center justify-center shadow-sm transition-transform active:scale-90"
            aria-label="Wishlist"
          >
            <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'text-primary fill-icon' : ''}`}>
              {isSaved ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          <span className="absolute top-4 left-4 bg-surface-container-lowest text-on-surface text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-outline-variant/40">
            {product.condition || 'Verified Student Item'}
          </span>

          <img
            src={product.image}
            alt={product.title}
            className="w-full max-h-[280px] object-contain drop-shadow-md rounded-xl"
          />

          <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span>100% Peer Vetted • Rishihood Campus</span>
          </div>
        </div>

        {/* Right Details Area */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            {/* Top Close Button */}
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                {product.category} • {product.location}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-on-surface leading-tight mb-2">
              {product.title}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-sm text-outline line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {product.description || 'Pre-loved student essentials available for direct handover inside university corridors.'}
            </p>

            {/* Seller Info Card */}
            <div className="bg-surface-container-low rounded-xl p-3 mb-4 flex items-center justify-between border border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-xs">
                  {product.seller ? product.seller.substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface">
                    {product.seller || 'Verified Student'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {product.sellerRole || 'Campus Resident'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full">
                @rishihood.edu.in
              </span>
            </div>

            {/* Pickup Handover Spot */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-on-surface mb-1 uppercase tracking-wider">
                Select Pickup Spot:
              </label>
              <select
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="Nescafe Circle">Nescafe Circle (Recommended, 8 AM - 11 PM)</option>
                <option value="Hostel 1 Courtyard">Hostel 1 Courtyard (North Wing)</option>
                <option value="Central Library Steps">Central Library Steps (Quiet, Fast)</option>
                <option value="Maker Space Porch">Maker Space Porch (Electronics testing)</option>
              </select>
            </div>

            {/* Make an Offer / Negotiate */}
            <div className="mb-4 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-on-surface">
                  Make a Student Offer:
                </span>
                <span className="text-xs font-bold text-primary">₹{offerPrice}</span>
              </div>
              <input
                type="range"
                min={Math.round(product.price * 0.7)}
                max={product.price}
                step={10}
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                <span>₹{Math.round(product.price * 0.7)} (Min)</span>
                <span>₹{product.price} (List price)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-outline-variant/40">
            <button
              onClick={handleSendOffer}
              disabled={offerSent}
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2.5 px-4 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-[16px]">
                {offerSent ? 'check_circle' : 'send'}
              </span>
              <span>{offerSent ? 'Offer Sent to Seller!' : `Send Offer (₹${offerPrice})`}</span>
            </button>

            <button
              onClick={() => {
                onStartChat && onStartChat(product);
                onClose();
              }}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface py-2.5 px-4 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

