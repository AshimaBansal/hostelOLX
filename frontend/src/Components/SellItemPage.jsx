import React, { useState } from 'react';

const PRESET_IMAGES = [
  { label: 'Study Lamp', path: '/images/arc_lamp.png' },
  { label: 'Retro Radio', path: '/images/loop_radio.png' },
  { label: 'Bouclé Seat', path: '/images/cloud_seat.png' },
  { label: 'Pebble Table', path: '/images/pebble_table.png' },
  { label: 'Astronaut Lamp', path: '/images/astronaut_lamp.png' },
  { label: 'Ikigai Book', path: '/images/ikigai_book.png' },
  { label: 'Plush Cushion', path: '/images/flower_cushion.png' },
  { label: 'Ceramic Mug', path: '/images/ceramic_mug.png' },
  { label: 'Velvet Hangers', path: '/images/hangers.png' },
  { label: 'Penguin Charm', path: '/images/penguin_keychain.png' }
];

const USAGE_DURATIONS = [
  'Less than 1 Month',
  '1 – 3 Months',
  '1 Semester (4–6 mos)',
  '1 Year',
  '2+ Years'
];

const CONDITIONS = [
  { id: 'Brand New', label: 'Brand New', desc: 'Sealed / never used' },
  { id: 'Like new', label: 'Like New', desc: 'Flawless, barely used' },
  { id: 'Good', label: 'Good', desc: 'Minor wear, works 100%' },
  { id: 'Fair', label: 'Fair', desc: 'Visible marks, fully functional' }
];

export default function SellItemPage({
  currentUser,
  onBackToHome,
  onAddItem,
  onOpenEditProfile
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState('study');
  const [usageDuration, setUsageDuration] = useState('1 – 3 Months');
  const [condition, setCondition] = useState('Like new');
  const [description, setDescription] = useState('');
  const [handoverSpot, setHandoverSpot] = useState('Nescafe Circle');
  const [uploadedImage, setUploadedImage] = useState(PRESET_IMAGES[0].path);
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // File Upload Reader (Converts user photo directly to dataURL)
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setIsCustomUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const finalPrice = isFree ? 0 : Number(price) || 0;
  const finalOriginal = isFree ? 0 : Number(originalPrice) || finalPrice;
  const discount =
    finalOriginal > finalPrice && finalPrice > 0
      ? Math.round(((finalOriginal - finalPrice) / finalOriginal) * 100)
      : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPublishing(true);

    const newItem = {
      id: 'sell-' + Date.now(),
      title: title.trim(),
      price: finalPrice,
      originalPrice: finalOriginal,
      category,
      section: isFree ? 'free' : 'favorites',
      location: currentUser?.hostel ? currentUser.hostel.split(' ')[0] : 'Hostel 1',
      roomNo: currentUser?.roomNo || 'Room 312',
      seller: currentUser?.name || 'Ashi Bansal',
      sellerRole: `${currentUser?.roomNo || 'Room 312'} • ${currentUser?.program || "NST '25"}`,
      condition,
      usageDuration,
      handoverSpot,
      description:
        description.trim() ||
        `Used for ${usageDuration}. In ${condition} condition. Available for direct handover in ${currentUser?.roomNo || 'Hostel'}.`,
      image: uploadedImage
    };

    setTimeout(() => {
      onAddItem(newItem);
      onBackToHome();
    }, 800);
  };

  return (
    <div className="w-full min-h-screen py-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/60 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Campus Marketplace</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-[0_16px_40px_-10px_rgba(201,31,27,0.08)] border border-outline-variant/60">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-outline-variant/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface">
                  List an Item for Sale or Giveaway
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Pass on your pre-loved dorm gadgets, books, and decor directly to campus peers with zero shipping fees.
              </p>
            </div>

            {/* Verified Student Pill */}
            <div className="flex items-center gap-2 bg-secondary-fixed/40 px-4 py-2 rounded-2xl border border-secondary-fixed shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <div className="text-left">
                <div className="text-xs font-bold text-on-surface">{currentUser?.name || 'Ashi Bansal'}</div>
                <div className="text-[11px] text-secondary font-semibold">
                  {currentUser?.hostel || 'Hostel 1'} • {currentUser?.roomNo || 'Room 312'}
                </div>
              </div>
            </div>
          </div>

          {/* Form + Live Preview Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Form Input */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6 text-xs">
              {/* 1. Item Photo Upload */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50">
                <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px] mb-2">
                  1. Upload Product Photo *
                </label>
                
                {/* Drag & Drop File Upload Input */}
                <div className="relative border-2 border-dashed border-outline-variant/80 hover:border-primary/60 bg-white rounded-2xl p-6 text-center transition-colors cursor-pointer group mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                    </span>
                    <div>
                      <p className="font-bold text-xs text-on-surface">
                        {fileName ? `Uploaded: ${fileName}` : 'Click or drag & drop real item photo from your phone/laptop'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        High quality JPG or PNG. Shows actual texture & condition to buyers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                    Or select from campus catalog presets:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        type="button"
                        key={img.label}
                        onClick={() => {
                          setUploadedImage(img.path);
                          setIsCustomUploaded(false);
                          setFileName('');
                        }}
                        className={`aspect-square rounded-xl p-1 bg-white border-2 transition-all overflow-hidden ${
                          uploadedImage === img.path && !isCustomUploaded
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-outline-variant/40 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.path} alt={img.label} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Basic Details: Title & Category */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50 space-y-4">
                <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  2. Product Basics
                </label>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Warm LED Desk Lamp, Ikigai Book, Pebble Accent Table"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="study">Study & Desks</option>
                      <option value="appliances">Mini Appliances</option>
                      <option value="seating">Cozy Seating</option>
                      <option value="decor">Decor & Plants</option>
                      <option value="free">Free & Giveaway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Preferred Handover Spot</label>
                    <select
                      value={handoverSpot}
                      onChange={(e) => setHandoverSpot(e.target.value)}
                      className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Nescafe Circle">Nescafe Circle (Central Campus)</option>
                      <option value="Hostel 1 Foyer">Hostel 1 Foyer (North Wing)</option>
                      <option value="Hostel 2 Foyer">Hostel 2 Foyer</option>
                      <option value="Central Library Steps">Central Library Steps</option>
                      <option value="Maker Space Porch">Maker Space Porch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Pricing */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                    3. Pricing & Value (₹)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-primary font-bold text-xs">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setPrice('0');
                      }}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>🎁 Give Away for Free (₹0)</span>
                  </label>
                </div>

                {!isFree ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-on-surface mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required={!isFree}
                        placeholder="e.g. 450"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-bold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-on-surface mb-1">Original Price / MRP (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 999"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-100 text-green-800 p-3 rounded-xl font-medium text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
                    <span>Item will be listed in the Free & Giveaway corridor drops section!</span>
                  </div>
                )}
              </div>

              {/* 4. Used from How Long & Condition (Requested by User!) */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50 space-y-4">
                <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  4. Usage Duration & Current Condition
                </label>

                {/* Used from How Long */}
                <div>
                  <label className="block font-semibold text-on-surface mb-1.5">
                    Used from how long? *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {USAGE_DURATIONS.map((dur) => (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => setUsageDuration(dur)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                          usageDuration === dur
                            ? 'bg-primary text-on-primary border-primary shadow-xs'
                            : 'bg-white text-on-surface border-outline-variant/60 hover:bg-surface-container'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Condition */}
                <div>
                  <label className="block font-semibold text-on-surface mb-1.5">
                    Current Condition *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CONDITIONS.map((cond) => (
                      <button
                        type="button"
                        key={cond.id}
                        onClick={() => setCondition(cond.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          condition === cond.id
                            ? 'bg-secondary-fixed/50 border-primary text-primary font-bold shadow-xs'
                            : 'bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <div className="font-bold text-xs">{cond.label}</div>
                        <div className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                          {cond.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Product Description */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50">
                <label className="block font-bold text-on-surface uppercase tracking-wider text-[11px] mb-1">
                  5. Product Description & Reason for Selling
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details like working condition, included cables/manuals, or reason for selling (e.g. room decluttering, graduating, upgrading)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-outline-variant/70 text-on-surface text-xs rounded-xl p-3 focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* 6. Auto-filled Seller & Room Details (From Login) */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/50">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                    6. Seller Details (Auto-filled from Login)
                  </label>
                  <button
                    type="button"
                    onClick={onOpenEditProfile}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit Room No / Hostel</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-outline-variant/40">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Student</span>
                    <span className="font-bold text-xs text-on-surface">{currentUser?.name || 'Ashi Bansal'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Hostel Block</span>
                    <span className="font-bold text-xs text-on-surface">{currentUser?.hostel || 'Hostel 1'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Room Number</span>
                    <span className="font-bold text-xs text-primary">{currentUser?.roomNo || 'Room 312'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Verified Email</span>
                    <span className="font-bold text-[11px] text-tertiary truncate block">
                      {currentUser?.email || 'ashimabansal@rishihood.edu.in'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPublishing ? 'hourglass_top' : 'rocket_launch'}
                  </span>
                  <span>
                    {isPublishing
                      ? 'Publishing Listing...'
                      : isFree
                      ? 'Publish Free Giveaway Item'
                      : 'Publish Item to Campus Marketplace'}
                  </span>
                </button>
              </div>
            </form>

            {/* Right 5 Columns: Live Real-Time Card Preview */}
            <div className="lg:col-span-5 sticky top-36 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                <h3 className="font-serif text-lg font-bold text-on-surface">
                  Live Corridor Preview
                </h3>
                <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>

              {/* The Live Product Card */}
              <div className="bg-surface-container-lowest rounded-3xl p-4 border-2 border-primary/20 shadow-xl flex flex-col">
                <div className="w-full aspect-square bg-[#f9f4ee] rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-outline-variant/30 mb-3">
                  <img
                    src={uploadedImage}
                    alt={title || 'Product preview'}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  <span className="absolute top-3 left-3 bg-surface-container-lowest/95 backdrop-blur-sm text-[11px] text-on-surface px-3 py-0.5 rounded-full shadow-xs font-bold border border-outline-variant/40">
                    {condition}
                  </span>
                  <span className="absolute bottom-3 left-3 text-[11px] bg-surface-container-lowest/95 px-3 py-0.5 rounded-full text-on-surface font-semibold shadow-xs border border-outline-variant/40">
                    {currentUser?.hostel?.split(' ')[0] || 'Hostel 1'} • {currentUser?.roomNo || 'Room 312'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif text-lg font-bold text-on-surface leading-tight">
                      {title || 'Your Product Title Will Appear Here'}
                    </h4>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {isFree ? 'FREE ₹0' : `₹${finalPrice.toLocaleString()}`}
                    </span>
                    {!isFree && finalOriginal > finalPrice && (
                      <>
                        <span className="text-xs text-outline line-through">
                          ₹{finalOriginal.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.2 rounded-full">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-medium">
                      ⏱ Used: {usageDuration}
                    </span>
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-semibold">
                      📍 {handoverSpot}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-2 pt-2 border-t border-outline-variant/30">
                    {description || 'Product description will display here for buyers in your corridor.'}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-outline-variant/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-[10px]">
                        {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'AB'}
                      </div>
                      <span className="font-bold text-on-surface">
                        {currentUser?.name || 'Ashi Bansal'}
                      </span>
                    </div>
                    <span className="text-[10px] text-primary font-bold">
                      Verified Handover Spot
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Guarantee Note */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0">
                  security
                </span>
                <p className="leading-tight">
                  Your listing will be visible to all verified students across Hostels 1, 2, Gargi, and Makers Bhavan with 0₹ delivery fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

