import React, { useState, useEffect } from 'react';

const PRESET_IMAGES = [
  { label: 'Study Lamp', path: '/images/arc_lamp.png' },
  { label: 'Retro Radio', path: '/images/loop_radio.png' },
  { label: 'Bouclé Seat', path: '/images/cloud_seat.png' },
  { label: 'Pebble Table', path: '/images/pebble_table.png' },
  { label: 'Astronaut Lamp', path: '/images/astronaut_lamp.png' },
  { label: 'Textbook / Notes', path: '/images/ikigai_book.png' },
  { label: 'Plush Cushion', path: '/images/flower_cushion.png' },
  { label: 'Ceramic Mug', path: '/images/ceramic_mug.png' },
  { label: 'Hangers / Organizer', path: '/images/hangers.png' },
  { label: 'Penguin Charm', path: '/images/penguin_keychain.png' }
];

export default function SellItemModal({ onClose, onAddItem, defaultType = 'sell' }) {
  const isDefaultFree = defaultType === 'free';
  const isDefaultFound = defaultType === 'found';

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(isDefaultFree || isDefaultFound ? '0' : '');
  const [originalPrice, setOriginalPrice] = useState(isDefaultFree || isDefaultFound ? '0' : '');
  const [isFree, setIsFree] = useState(isDefaultFree || isDefaultFound);
  const [itemType, setItemType] = useState(isDefaultFound ? 'lost-found' : isDefaultFree ? 'free' : 'sell');
  const [category, setCategory] = useState('study');
  const [location, setLocation] = useState('Hostel 1');
  const [condition, setCondition] = useState('Like new');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].path);

  useEffect(() => {
    if (itemType === 'free' || itemType === 'lost-found') {
      setIsFree(true);
      setPrice('0');
      setOriginalPrice('0');
    }
  }, [itemType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalPrice = isFree ? 0 : Number(price) || 0;
    const finalOrig = isFree ? 0 : Number(originalPrice) || finalPrice;

    let targetSection = 'favorites';
    if (itemType === 'free' || finalPrice === 0) targetSection = 'free';
    if (itemType === 'lost-found') targetSection = 'lost-found';

    const newItem = {
      id: 'item-' + Date.now(),
      title: title.trim(),
      price: finalPrice,
      originalPrice: finalOrig,
      category,
      section: targetSection,
      location,
      seller: 'Ashi (You)',
      sellerRole: "NST '25 • You",
      condition: itemType === 'lost-found' ? 'Found Item' : condition,
      description: description.trim() || 'Verified student item listed on HostelOLX.',
      image: selectedImage
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 border border-outline-variant/60 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
              +
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-surface leading-none">
                {itemType === 'lost-found'
                  ? 'Report Found Item'
                  : itemType === 'free'
                  ? 'Post Free Giveaway'
                  : 'Sell an Item'}
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Verified Rishihood Student Marketplace
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

        {/* Listing Type Switcher */}
        <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1.5 rounded-2xl mb-4 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setItemType('sell')}
            className={`py-2 rounded-xl transition-all ${
              itemType === 'sell'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            💰 Sell Item
          </button>
          <button
            type="button"
            onClick={() => setItemType('free')}
            className={`py-2 rounded-xl transition-all ${
              itemType === 'free'
                ? 'bg-green-700 text-white shadow-xs'
                : 'text-on-surface hover:text-green-700'
            }`}
          >
            🎁 Free Giveaway
          </button>
          <button
            type="button"
            onClick={() => setItemType('lost-found')}
            className={`py-2 rounded-xl transition-all ${
              itemType === 'lost-found'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-on-surface hover:text-amber-700'
            }`}
          >
            🔍 Found Item
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
              {itemType === 'lost-found' ? 'Found Item Name *' : 'Item Title *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                itemType === 'lost-found'
                  ? 'e.g. Blue Casio Calculator, AirPods Case'
                  : 'e.g. Ergonomic Study Lamp, Solved Physics Notes'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
              >
                <option value="study">Study & Desks</option>
                <option value="appliances">Mini Appliances</option>
                <option value="seating">Cozy Seating</option>
                <option value="decor">Decor & Plants</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                {itemType === 'lost-found' ? 'Found Location' : 'Hostel / Corridor'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
              >
                <option value="Hostel 1">Hostel 1</option>
                <option value="Hostel 2">Hostel 2</option>
                <option value="Gargi Block">Gargi Block</option>
                <option value="Makers Bhavan">Makers Bhavan</option>
                <option value="Atrium">Atrium</option>
                <option value="R1">R1</option>
                <option value="Nescafe Circle">Nescafe Circle</option>
                <option value="Central Library">Central Library Steps</option>
              </select>
            </div>
          </div>

          {/* Price & Free Toggle */}
          {itemType === 'sell' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  Pricing (₹)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-primary font-bold text-[11px]">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      setIsFree(e.target.checked);
                      if (e.target.checked) setPrice('0');
                    }}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Free Giveaway (₹0)</span>
                </label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    required={!isFree}
                    placeholder="Your Price (e.g. 450)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Retail Price (optional)"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* Condition */}
          {itemType !== 'lost-found' && (
            <div>
              <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
                Condition
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['New', 'Like new', 'Good', 'Fair'].map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                      condition === cond
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-on-surface mb-1 uppercase tracking-wider text-[11px]">
              {itemType === 'lost-found' ? 'Where / When Found?' : 'Description'}
            </label>
            <textarea
              rows={2}
              placeholder={
                itemType === 'lost-found'
                  ? 'Found on bench near Nescafe at 2 PM. Contact to claim.'
                  : 'Tell fellow students about features, working condition, or pickup time...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/70 text-on-surface rounded-xl p-2.5 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Select Thumbnail Asset */}
          <div>
            <label className="block font-bold text-on-surface mb-1.5 uppercase tracking-wider text-[11px]">
              Choose Thumbnail
            </label>
            <div className="grid grid-cols-5 gap-2 overflow-x-auto p-1.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setSelectedImage(img.path)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all p-1 bg-white ${
                    selectedImage === img.path
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.path} alt={img.label} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-6 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                itemType === 'lost-found'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : itemType === 'free'
                  ? 'bg-green-700 hover:bg-green-800 text-white'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {itemType === 'lost-found' ? 'search_check' : 'add_circle'}
              </span>
              <span>
                {itemType === 'lost-found'
                  ? 'Publish Found Item'
                  : itemType === 'free'
                  ? 'Publish Free Giveaway'
                  : 'Post Listing to HostelOLX'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
