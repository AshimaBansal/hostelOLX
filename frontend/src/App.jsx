import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from './context/useAuth';
import Navbar from './Components/Navbar';
import CampusPulse from './Components/CampusPulse';
import HeroSection from './Components/HeroSection';
import CampusFavorites from './Components/CampusFavorites';
import DormEssentials from './Components/DormEssentials';
import SpecialSections from './Components/SpecialSections';
import EditorialBanner from './Components/EditorialBanner';
import Testimonials from './Components/Testimonials';
import Footer from './Components/Footer';

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
import {
  fetchListings,
  createListingApi,
  uploadImageApi,
} from './services/marketplaceApi';
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
} from './services/wishlistApi';
import {
  fetchConversationsApi,
  fetchMessagesApi,
  startChatApi,
  sendMessageApi,
  markChatReadApi,
} from './services/chatApi';
import {
  fetchRequestsApi,
  createRequestApi,
} from './services/requestsApi';
import {
  fetchProfileApi,
  updateProfileApi,
} from './services/profileApi';
import { submitClaimApi } from './services/claimApi';

function App() {
  const { user, token, isAuthenticated } = useAuth();

  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    rollNo: '',
    program: '',
    hostel: 'Hostel 1 (North Wing)',
    roomNo: '',
    phone: ''
  });

  const activeStudent = useMemo(() => ({
    ...currentUser,
    name: user?.fullName || currentUser.name || (isAuthenticated ? 'Student' : 'Guest Student'),
    email: user?.email || currentUser.email || '',
    role: user?.role || 'STUDENT',
  }), [currentUser, user, isAuthenticated]);

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [wishlist, setWishlist] = useState({});
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CHATS[0].id);
  const [studentRequests, setStudentRequests] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [activeTab, setActiveTab] = useState('shop-campus');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [claimProduct, setClaimProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellModalType, setSellModalType] = useState('sell');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHandoverSpotsOpen, setIsHandoverSpotsOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const currentTab = !isAuthenticated && activeTab === 'sell-item' ? 'shop-campus' : activeTab;

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchListings({}, token)
      .then((data) => {
        if (!ignore && data?.listings && data.listings.length > 0) {
          setProducts(data.listings);
        }
      })
      .catch((err) => {
        void err;
      });
    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    let ignore = false;
    fetchRequestsApi()
      .then((reqs) => {
        if (!ignore && reqs && reqs.length > 0) {
          setStudentRequests(reqs);
        }
      })
      .catch((err) => {
        void err;
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      let ignore = false;
      fetchProfileApi(token)
        .then((prof) => {
          if (!ignore && prof) {
            setCurrentUser((prev) => ({
              ...prev,
              name: prof.fullName || prev.name,
              email: prof.email || prev.email,
              phone: prof.phone || prev.phone,
              hostel: prof.hostelName || prev.hostel,
              roomNo: prof.roomNumber || prev.roomNo,
              program: prof.program || prev.program,
            }));
          }
        })
        .catch((err) => {
          void err;
        });
      return () => {
        ignore = true;
      };
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }
    let ignore = false;
    fetchWishlistApi(token)
      .then((items) => {
        if (ignore || !Array.isArray(items)) return;
        const map = {};
        items.forEach((item) => {
          if (item.id) map[item.id] = true;
          if (item.listingId) map[item.listingId] = true;
        });
        setWishlist(map);
      })
      .catch((err) => {
        void err;
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let ignore = false;

    const fetchChats = () => {
      fetchConversationsApi(token)
        .then((convs) => {
          if (ignore || !Array.isArray(convs) || convs.length === 0) return;
          setChats((prev) => {
            const map = new Map(prev.map((c) => [c.id, c]));
            return convs.map((c) => {
              const existing = map.get(c.id);
              return {
                ...c,
                messages: existing?.messages || c.messages || [],
              };
            });
          });
        })
        .catch((err) => {
          void err;
        });
    };

    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token || !isChatOpen || !activeChatId) return;
    let ignore = false;

    const fetchActiveMessages = () => {
      fetchMessagesApi(activeChatId, token)
        .then((msgs) => {
          if (ignore || !Array.isArray(msgs)) return;
          setChats((prev) =>
            prev.map((c) =>
              c.id === activeChatId ? { ...c, messages: msgs } : c
            )
          );
        })
        .catch((err) => {
          void err;
        });
    };

    const interval = setInterval(fetchActiveMessages, 4000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, token, isChatOpen, activeChatId]);

  const requireAuth = (actionCallback) => {
    if (isAuthenticated) {
      actionCallback();
      return true;
    }
    setPendingAction(() => actionCallback);
    setIsLoginModalOpen(true);
    return false;
  };

  const handleAuthSuccess = () => {
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  };

  const performToggleWishlist = async (id) => {
    const isCurrentlySaved = Boolean(wishlist[id]);
    setWishlist((prev) => {
      const next = { ...prev };
      if (isCurrentlySaved) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });

    if (token) {
      try {
        if (isCurrentlySaved) {
          await removeFromWishlistApi(id, token);
          showToast('Removed from saved items');
        } else {
          await addToWishlistApi(id, token);
          showToast('Saved to your wishlist! ❤️');
        }
      } catch (err) {
        setWishlist((prev) => {
          const next = { ...prev };
          if (isCurrentlySaved) {
            next[id] = true;
          } else {
            delete next[id];
          }
          return next;
        });
        showToast(err.message || 'Wishlist update failed');
      }
    } else {
      showToast(isCurrentlySaved ? 'Removed from saved items' : 'Saved to your wishlist! ❤️');
    }
  };

  const toggleWishlist = (id) => {
    requireAuth(() => performToggleWishlist(id));
  };

  const performAddNewItem = async (newItem) => {
    let finalImageUrl = newItem.image || '/images/arc_lamp.png';

    if (token) {
      try {
        if (finalImageUrl.startsWith('data:image')) {
          const uploaded = await uploadImageApi(finalImageUrl, token);
          if (uploaded) finalImageUrl = uploaded;
        }

        let listingType = 'sale';
        if (newItem.section === 'free' || Number(newItem.price) === 0) {
          if (newItem.section === 'lost-found') {
            listingType = 'lost-found';
          } else {
            listingType = 'giveaway';
          }
        }

        const created = await createListingApi(
          {
            title: newItem.title,
            description: newItem.description,
            price: Number(newItem.price) || 0,
            originalPrice: Number(newItem.originalPrice) || 0,
            listingType,
            itemCondition: newItem.condition || 'good',
            category: newItem.category || 'study',
            locationText: newItem.location || 'Hostel 1',
            images: [finalImageUrl],
          },
          token
        );

        if (created) {
          setProducts((prev) => [created, ...prev]);
          showToast(`"${newItem.title}" posted to campus marketplace! 🚀`);
          return;
        }
      } catch (err) {
        showToast(err.message || 'Failed to post item to server');
        return;
      }
    }

    setProducts((prev) => [newItem, ...prev]);
    showToast(`"${newItem.title}" posted to campus marketplace! 🚀`);
  };

  const handleAddNewItem = (newItem) => {
    requireAuth(() => performAddNewItem(newItem));
  };

  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId);
    if (token) {
      try {
        const msgs = await fetchMessagesApi(chatId, token);
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, messages: msgs, unread: false } : c
          )
        );
        await markChatReadApi(chatId, token);
      } catch (err) {
        void err;
      }
    }
  };

  const performStartChat = async (product, initialMessage) => {
    const defaultMsg =
      initialMessage ||
      `Hi ${product.seller || 'there'}, is this ${product.title} still available for handover?`;

    if (token && product) {
      try {
        const serverChat = await startChatApi(
          {
            listingId: product.id ? Number(product.id) : null,
            message: defaultMsg,
          },
          token
        );

        if (serverChat) {
          let msgs = [];
          try {
            msgs = await fetchMessagesApi(serverChat.id, token);
          } catch (err) {
            void err;
          }
          const fullChat = { ...serverChat, messages: msgs };
          setChats((prev) => [fullChat, ...prev.filter((c) => c.id !== serverChat.id)]);
          setActiveChatId(serverChat.id);
          setIsChatOpen(true);
          return;
        }
      } catch (err) {
        showToast(err.message || 'Failed to start conversation');
        return;
      }
    }

    let targetChat = chats.find(
      (c) => c.sellerName === product.seller && c.productTitle === product.title
    );

    if (!targetChat) {
      targetChat = {
        id: 'chat-' + Date.now(),
        sellerName: product.seller || 'Student Peer',
        sellerRole: product.sellerRole || 'Campus Resident',
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.image,
        unread: false,
        messages: [
          {
            sender: 'Me',
            text: defaultMsg,
            time: 'Just now',
            isMe: true
          }
        ]
      };
      setChats((prev) => [targetChat, ...prev]);
    } else if (initialMessage) {
      targetChat.messages = targetChat.messages || [];
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

  const handleStartChat = (product, initialMessage) => {
    requireAuth(() => performStartChat(product, initialMessage));
  };

  const performConfirmClaim = async (item, spot, time, proof) => {
    const isLost = item.section === 'lost-found';

    if (token && item.id) {
      try {
        await submitClaimApi(
          item.id,
          {
            proofDetails: proof || 'As described',
            meetingLocation: spot,
            meetingTime: time,
          },
          token
        );
      } catch (err) {
        showToast(err.message || 'Failed to submit claim');
        return;
      }
    }

    showToast(
      isLost
        ? `Claim submitted for ${item.title} at ${spot}! 🤝`
        : `Claimed ${item.title} (₹0) from ${item.seller}! 🎉`
    );

    performStartChat(
      item,
      isLost
        ? `Hi ${item.seller}, I just submitted an ownership claim for ${item.title}. I can meet at ${spot} during ${time}. Proof: "${proof || 'As described'}".`
        : `Hi ${item.seller}, I would love to claim the free ${item.title}! Can we meet at ${spot} around ${time}?`
    );
  };

  const handleConfirmClaim = (item, spot, time, proof) => {
    requireAuth(() => performConfirmClaim(item, spot, time, proof));
  };

  const performSendMessage = async (chatId, text) => {
    if (token) {
      try {
        const newMsg = await sendMessageApi(chatId, text, token);
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === chatId) {
              return {
                ...c,
                messages: [...(c.messages || []), newMsg],
                lastMessage: { text, time: 'Just now' },
              };
            }
            return c;
          })
        );
        return;
      } catch (err) {
        showToast(err.message || 'Failed to send message');
        return;
      }
    }

    const updated = chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [
            ...(c.messages || []),
            { sender: 'Me', text, time: 'Just now', isMe: true }
          ]
        };
      }
      return c;
    });
    setChats(updated);
  };

  const handleSendMessage = (chatId, text) => {
    requireAuth(() => performSendMessage(chatId, text));
  };

  const performMakeOffer = (product, offerPrice) => {
    showToast(`Counter offer of ₹${offerPrice} sent to ${product.seller}! 💬`);
  };

  const handleMakeOffer = (product, offerPrice) => {
    requireAuth(() => performMakeOffer(product, offerPrice));
  };

  const performContactRequester = (req) => {
    performStartChat(
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

  const handleContactRequester = (req) => {
    requireAuth(() => performContactRequester(req));
  };

  const handleCreateRequest = async (reqData) => {
    if (token) {
      try {
        const created = await createRequestApi(reqData, token);
        if (created) {
          setStudentRequests((prev) => [created, ...prev]);
          showToast(`Request for "${reqData.title}" posted! 🤝`);
          return;
        }
      } catch (err) {
        showToast(err.message || 'Failed to post request');
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedHostel !== 'All Hostels') {
        if (item.location !== selectedHostel) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        const matchesLocation = (item.location || '').toLowerCase().includes(q);
        const matchesSeller = (item.seller || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesLocation || matchesSeller || matchesDesc;
      }

      return true;
    });
  }, [products, selectedHostel, searchQuery]);

  const favoritesList = filteredProducts.filter(
    (p) => p.section === 'favorites' || (p.section !== 'essentials' && p.section !== 'free' && p.section !== 'lost-found')
  );
  const essentialsList = filteredProducts.filter((p) => p.section === 'essentials');

  const myListings = useMemo(() => {
    if (!isAuthenticated) return [];
    return products.filter(
      (p) => p.isMine || (p.seller && (p.seller.includes('You') || (activeStudent.name && p.seller.includes(activeStudent.name))))
    );
  }, [products, isAuthenticated, activeStudent.name]);

  const unreadCount = isAuthenticated ? chats.filter((c) => c.unread).length : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col text-on-surface">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce border border-white/20">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        savedCount={Object.keys(wishlist).length}
        unreadCount={unreadCount}
        onOpenWishlist={() => requireAuth(() => setIsWishlistOpen(true))}
        onOpenChat={() => {
          requireAuth(() => {
            if (chats.length > 0 && activeChatId) {
              handleSelectChat(activeChatId);
            }
            setIsChatOpen(true);
          });
        }}
        onOpenSellModal={() => {
          requireAuth(() => {
            setActiveTab('sell-item');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }}
        onOpenProfile={() => requireAuth(() => setIsProfileOpen(true))}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedHostel={selectedHostel}
        onHostelChange={(h) => {
          setSelectedHostel(h);
          showToast(`Filtered corridor: ${h}`);
        }}
        activeTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'sell-item') {
            requireAuth(() => {
              setActiveTab('sell-item');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            return;
          }
          setActiveTab(tab);
          if (tab === 'pickup-spots') setIsHandoverSpotsOpen(true);
        }}
      />

      <main className="w-full pt-32 sm:pt-36 bg-background">
        {currentTab === 'sell-item' ? (
          <SellItemPage
            currentUser={activeStudent}
            onBackToHome={() => {
              setActiveTab('shop-campus');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddItem={handleAddNewItem}
            onOpenEditProfile={() => requireAuth(() => setIsLoginModalOpen(true))}
          />
        ) : (
          <div className="flex flex-col w-full">
            <div className="w-full bg-secondary-fixed/30 py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-12">
              <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-3xl p-5 sm:p-8 lg:p-12 shadow-[0_16px_40px_-10px_rgba(201,31,27,0.08),0_4px_16px_-2px_rgba(122,88,92,0.05)] flex flex-col gap-12 sm:gap-14">
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

                <HeroSection
                  onOpenHeroProduct={() => {
                    const lamp = products.find((p) => p.id === 'fav-1') || products[0];
                    setSelectedProduct(lamp);
                  }}
                />

                <CampusFavorites
                  products={favoritesList}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                />

                <DormEssentials
                  products={essentialsList}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                  onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
                />

                <SpecialSections
                  products={products}
                  requests={studentRequests}
                  activeTab={currentTab}
                  currentUser={activeStudent}
                  onOpenProduct={(prod) => setSelectedProduct(prod)}
                  onOpenSellModal={(type) => {
                    requireAuth(() => {
                      if (type === 'free') {
                        setActiveTab('sell-item');
                      } else {
                        setSellModalType(type || 'free');
                        setIsSellModalOpen(true);
                      }
                    });
                  }}
                  onClaimItem={(item) => requireAuth(() => setClaimProduct(item))}
                  onContactRequester={handleContactRequester}
                  onOpenReportModal={() => {
                    requireAuth(() => {
                      setSellModalType('found');
                      setIsSellModalOpen(true);
                    });
                  }}
                  onOpenPostRequest={(action) => requireAuth(action)}
                  onCreateRequest={handleCreateRequest}
                />

                <EditorialBanner />

                <Testimonials />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer
        onOpenHandoverSpots={() => setIsHandoverSpotsOpen(true)}
        onOpenSafety={() => setIsHandoverSpotsOpen(true)}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={toggleWishlist}
          isSaved={!!wishlist[selectedProduct.id]}
          onStartChat={handleStartChat}
          onMakeOffer={handleMakeOffer}
        />
      )}

      {claimProduct && (
        <ClaimModal
          item={claimProduct}
          onClose={() => setClaimProduct(null)}
          onConfirmClaim={handleConfirmClaim}
        />
      )}

      {isSellModalOpen && (
        <SellItemModal
          defaultType={sellModalType}
          currentUser={activeStudent}
          onClose={() => setIsSellModalOpen(false)}
          onAddItem={handleAddNewItem}
        />
      )}

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        allProducts={products}
        onRemove={toggleWishlist}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onSendMessage={handleSendMessage}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        myListings={myListings}
        currentUser={activeStudent}
        onOpenEditProfile={() => {
          setIsProfileOpen(false);
          requireAuth(() => setIsLoginModalOpen(true));
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        currentUser={activeStudent}
        onSuccess={handleAuthSuccess}
        onUpdateUser={async (updated) => {
          if (isAuthenticated) {
            setCurrentUser(updated);
            if (token) {
              try {
                await updateProfileApi(
                  {
                    roomNo: updated.roomNo,
                    phone: updated.phone,
                    hostel: updated.hostel,
                    program: updated.program,
                  },
                  token
                );
              } catch (err) {
                void err;
              }
            }
            showToast(`Updated student profile: ${updated.roomNo || 'saved'}! 🏫`);
          }
        }}
      />

      <HandoverSpotsModal
        isOpen={isHandoverSpotsOpen}
        onClose={() => setIsHandoverSpotsOpen(false)}
      />
    </div>
  );
}

export default App;
