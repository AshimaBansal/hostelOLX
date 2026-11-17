export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistIds = {},
  allProducts = [],
  onRemove,
  onOpenProduct
}) {
  if (!isOpen) return null;

  const savedProducts = allProducts.filter((p) => wishlistIds[p.id]);
  const totalValue = savedProducts.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between border-l border-outline-variant/60 animate-slide-left"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px] fill-icon">
              favorite
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface leading-tight">
                Saved Items ({savedProducts.length})
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Your hostel shopping watchlist
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Saved List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">
                favorite_border
              </span>
              <p className="font-bold text-sm text-on-surface">No saved items yet</p>
              <p className="text-xs max-w-xs mt-1">
                Tap the heart on any study lamp, cushion, or dorm gadget to save it here!
              </p>
            </div>
          ) : (
            savedProducts.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/50 shadow-xs flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain rounded-xl bg-[#f9f4ee] p-1 border border-outline-variant/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                    {item.location}
                  </span>
                  <h4 className="font-bold text-xs text-on-surface truncate">
                    {item.title}
                  </h4>
                  <span className="text-sm font-bold text-primary">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onOpenProduct(item);
                      onClose();
                    }}
                    className="bg-primary hover:bg-primary-container text-on-primary text-[11px] px-3 py-1.5 rounded-full font-bold transition-all shadow-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-[10px] text-outline hover:text-primary transition-colors text-center"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout / Summary */}
        {savedProducts.length > 0 && (
          <div className="p-5 border-t border-outline-variant/40 bg-surface-container-low flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Estimated Total:</span>
              <span className="text-lg font-bold text-primary">₹{totalValue.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                alert(`Proceeding to connect with sellers for ${savedProducts.length} items!`);
                onClose();
              }}
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Inquire All Saved Items</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

