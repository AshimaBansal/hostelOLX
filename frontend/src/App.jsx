import React, { useState, useMemo } from 'react';
import Navbar from './Components/Navbar';
import CampusPulse from './Components/CampusPulse';
import HeroSection from './Components/HeroSection';
import CampusFavorites from './Components/CampusFavorites';
import DormEssentials from './Components/DormEssentials';
import SpecialSections from './Components/SpecialSections';
import EditorialBanner from './Components/EditorialBanner';
import Testimonials from './Components/Testimonials';
import Footer from './Components/Footer';

// Pages & Modals
import SellItemPage from './Components/SellItemPage';
import ProductDetailModal from './Components/ProductDetailModal';
import SellItemModal from './Components/SellItemModal';
import WishlistDrawer from './Components/WishlistDrawer';
import ChatDrawer from './Components/ChatDrawer';
import ProfileModal from './Components/ProfileModal';
import HandoverSpotsModal from './Components/HandoverSpotsModal';
import ClaimModal from './Components/ClaimModal';
import LoginModal from './Components/LoginModal';

import { INITIAL_PRODUCTS, INITIAL_CHATS } from './data/mockData';

function App() {
  // Current Logged-in Student Account (With Room No & Hostel Details)
  const [currentUser, setCurrentUser] = useState({
    name: 'Ashi Bansal',
    email: 'ashimabansal@rishihood.edu.in',
    rollNo: 'NST25-084',
    program: "Newton School of Technology • '25",
    hostel: 'Hostel 1 (North Wing)',
    roomNo: 'Room 312',
    phone: '+91 98765 43210'
  });

  // Global Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [wishlist, setWishlist] = useState({
    'fav-1': true,
    'dorm-1': true,
    'free-1': true
  });
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CHATS[0].id);

  // Filters & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [activeTab, setActiveTab] = useState('shop-campus'); // 'shop-campus' | 'sell-item' | etc.

  // Modal / Drawer Open States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [claimProduct, setClaimProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellModalType, setSellModalType] = useState('sell'); // 'sell' | 'free' | 'found'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHandoverSpotsOpen, setIsHandoverSpotsOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Wishlist Actions
  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
        showToast('Removed from saved items');
      } else {
        next[id] = true;
        showToast('Saved to your wishlist! ❤️');
      }
      return next;
    });
  };

  // Add Item to Feed
  const handleAddNewItem = (newItem) => {
    setProducts((prev) => [newItem, ...prev]);
    showToast(`"${newItem.title}" posted to campus marketplace! 🚀`);
  };

  // Claim Item Handover Action
  const handleConfirmClaim = (item, spot, time, proof) => {
    const isLost = item.section === 'lost-found';
    showToast(
      isLost
        ? `Claim submitted for ${item.title} at ${spot}! 🤝`
        : `Claimed ${item.title} (₹0) from ${item.seller}! 🎉`
    );

    // Automatically create a chat with finder / senior
    handleStartChat(
      item,
      isLost
        ? `Hi ${item.seller}, I just submitted an ownership claim for ${item.title}. I can meet at ${spot} during ${time}. Proof: "${proof || 'As described'}".`
        : `Hi ${item.seller}, I would love to claim the free ${item.title}! Can we meet at ${spot} around ${time}?`
    );
  };

  // Start Chat / Open Chat Drawer
  const handleStartChat = (product, initialMessage) => {
    let targetChat = chats.find(
      (c) => c.sellerName === product.seller && c.productTitle === product.title
    );

    if (!targetChat) {
      targetChat = {
        id: 'chat-' + Date.now(),
        sellerName: product.seller || 'Verified Student',
        sellerRole: product.sellerRole || 'Campus Resident',
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.image,
        unread: false,
        messages: [
          {
            sender: 'Me',
            text:
              initialMessage ||
              `Hi ${product.seller || 'there'}, is this ${product.title} still available for handover?`,
            time: 'Just now',
            isMe: true
          }
        ]
      };
      setChats((prev) => [targetChat, ...prev]);
    } else if (initialMessage) {
      targetChat.messages.push({
        sender: 'Me',
        text: initialMessage,
        time: 'Just now',
        isMe: true
      });
      setChats([...chats]);
    }

    setActiveChatId(targetChat.id);
    setIsChatOpen(true);
  };

  const handleSendMessage = (chatId, text) => {
    const updated = chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            { sender: 'Me', text, time: 'Just now', isMe: true }
          ]
        };
      }
      return c;
    });
    setChats(updated);

    // Automated peer response after 1.5 seconds
    setTimeout(() => {
      setChats((current) =>
        current.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  sender: c.sellerName,
                  text: 'Sounds great! I will meet you at the Nescafe Circle as planned. Thanks!',
                  time: 'Just now',
                  isMe: false
                }
              ]
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const handleMakeOffer = (product, offerPrice) => {
    showToast(`Counter offer of ₹${offerPrice} sent to ${product.seller}! 💬`);
  };

  const handleContactRequester = (req) => {
    handleStartChat(
      {
        seller: req.requester,
        sellerRole: req.location,
        title: req.title,
        price: 0,
        image: '/images/ikigai_book.png'
      },
      `Hi ${req.requester}, I saw your request for "${req.title}". I have this available in my hostel room!`
    );
  };

  // Filtered Products based on Search Query & Hostel
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedHostel !== 'All Hostels') {
        if (item.location !== selectedHostel) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesLocation = item.location.toLowerCase().includes(q);
        const matchesSeller = item.seller.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesLocation || matchesSeller || matchesDesc;
      }

      return true;
    });
  }, [products, selectedHostel, searchQuery]);

  // Section divisions
  const favoritesList = filteredProducts.filter(
    (p) => p.section === 'favorites' || (p.section !== 'essentials' && p.section !== 'free' && p.section !== 'lost-found')
  );
  const essentialsList = filteredProducts.filter((p) => p.section === 'essentials');
  const myListings = products.filter(
    (p) => p.seller && (p.seller.includes('You') || p.seller.includes(currentUser.name))
  );
  const unreadCount = chats.filter((c) => c.unread).length;

  return (
    <div className="min-h-screen bg-background flex flex-col text-on-surface">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce border border-white/20">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        savedCount={Object.keys(wishlist).length}
        unreadCount={unreadCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSellModal={() => {
          setActiveTab('sell-item');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedHostel={selectedHostel}
        onHostelChange={(h) => {
          setSelectedHostel(h);
          showToast(`Filtered corridor: ${h}`);
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'pickup-spots') setIsHandoverSpotsOpen(true);
        }}
      />

      {/* Main Content Body */}
      <main className="w-full pt-32 sm:pt-36 bg-background">
        {/* VIEW 1: DEDICATED SELL ITEM PAGE */}
        {activeTab === 'sell-item' ? (
          <SellItemPage
            currentUser={currentUser}
            onBackToHome={() => {
              setActiveTab('shop-campus');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddItem={handleAddNewItem}
            onOpenEditProfile={() => setIsLoginModalOpen(true)}
          />
        ) : (
          /* VIEW 2: MAIN CAMPUS MARKETPLACE HOMEPAGE */
          <div className="flex flex-col w-full">
            {/* Outer Pastel Canvas Wrapper */}
            <div className="w-full bg-secondary-fixed/30 py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-12">
              {/* Central Curated Ivory Board */}
              <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-3xl p-5 sm:p-8 lg:p-12 shadow-[0_16px_40px_-10px_rgba(201,31,27,0.08),0_4px_16px_-2px_rgba(122,88,92,0.05)] flex flex-col gap-12 sm:gap-14">
                {/* Campus Pulse Ticker */}
                <CampusPulse
                  onJumpFree={() => {
                    setActiveTab('free-giveaway');
                    const elem = document.getElementById('free-giveaway');
                    if (elem) {
                      const y = elem.getBoundingClientRect().top + window.pageYOffset - 130;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  onOpenSafety={() => setIsHandoverSpotsOpen(true)}
                />

                {/* Active Search & Corridor Indicator */}
                {(searchQuery.trim() || selectedHostel !== 'All Hostels') && (
                  <div className="bg-secondary-fixed/40 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold border border-secondary-fixed">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">filter_alt</span>
                      <span>
                        Active Filter: {selectedHostel !== 'All Hostels' ? selectedHostel : 'All Hostels'}
                        {searchQuery.trim() ? ` • Matching "${searchQuery}"` : ''} ({filteredProducts.length} results)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedHostel('All Hostels');
                        showToast('Filters cleared');
                      }}
                      className="text-primary hover:underline font-bold"
                    >
                      Clear Filters ✕
                    </button>
                  </div>
                )}

                {/* Hero Section */}
                <HeroSection
                  onOpenHeroProduct={() => {
                    const lamp = products.find((p) => p.id === 'fav-1') || products[0];
                    setSelectedProduct(lamp);
                  }}
                />

                {/* Campus Favorites Carousel & Grid */}
                <CampusFavorites
                  products={favoritesList}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                />

                {/* Dorm Essentials & Quick Drops */}
                <DormEssentials
                  products={essentialsList}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                  onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
                />

                {/* Free & Giveaway + Lost & Found + Wanted Requests */}
                <SpecialSections
                  products={products}
                  activeTab={activeTab}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                  onOpenSellModal={(type) => {
                    if (type === 'free') {
                      setActiveTab('sell-item');
                    } else {
                      setSellModalType(type || 'free');
                      setIsSellModalOpen(true);
                    }
                  }}
                  onClaimItem={(item) => setClaimProduct(item)}
                  onContactRequester={handleContactRequester}
                  onOpenReportModal={() => {
                    setSellModalType('found');
                    setIsSellModalOpen(true);
                  }}
                />

                {/* Editorial Feature Banner */}
                <EditorialBanner />

                {/* Peer Testimonials */}
                <Testimonials />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
        onOpenSafety={() => setIsHandoverSpotsOpen(true)}
      />

      {/* --- ALL MODALS & DRAWERS --- */}

      {/* Product Detail & Negotiation Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={toggleWishlist}
          isSaved={!!wishlist[selectedProduct.id]}
          onStartChat={(prod, msg) => handleStartChat(prod, msg)}
          onMakeOffer={handleMakeOffer}
        />
      )}

      {/* Claim Free or Found Item Modal */}
      {claimProduct && (
        <ClaimModal
          item={claimProduct}
          onClose={() => setClaimProduct(null)}
          onConfirmClaim={handleConfirmClaim}
        />
      )}

      {/* Quick Sell / Report Found Item Modal */}
      {isSellModalOpen && (
        <SellItemModal
          defaultType={sellModalType}
          onClose={() => setIsSellModalOpen(false)}
          onAddItem={handleAddNewItem}
        />
      )}

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        allProducts={products}
        onRemove={toggleWishlist}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* Chat / Messages Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onSendMessage={handleSendMessage}
      />

      {/* Student Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        myListings={myListings}
        currentUser={currentUser}
        onOpenEditProfile={() => {
          setIsProfileOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Login & Room Number Profile Editor Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          showToast(`Updated student profile: ${updated.roomNo}! 🏫`);
        }}
      />

      {/* Handover Spots & Safety Modal */}
      <HandoverSpotsModal
        isOpen={isHandoverSpotsOpen}
        onClose={() => setIsHandoverSpotsOpen(false)}
      />
    </div>
  );
}

export default App;
