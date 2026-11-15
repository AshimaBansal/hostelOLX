import React, { useState } from 'react';

export default function ChatDrawer({
  isOpen,
  onClose,
  chats = [],
  activeChatId,
  onSelectChat,
  onSendMessage
}) {
  if (!isOpen) return null;

  const [inputMsg, setInputMsg] = useState('');
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChat) return;
    onSendMessage(activeChat.id, inputMsg.trim());
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between border-l border-outline-variant/60"
      >
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              forum
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface leading-tight">
                Peer Messages
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Verified Rishihood Student Chats
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

        {/* Content: Conversation List + Chat Thread */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Top Chat List */}
          <div className="md:w-2/5 border-r border-outline-variant/40 overflow-y-auto bg-surface-container-lowest">
            {chats.map((chat) => {
              const isSelected = activeChat && activeChat.id === chat.id;
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`p-3 border-b border-outline-variant/30 cursor-pointer transition-colors ${
                    isSelected ? 'bg-secondary-fixed/40' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {chat.sellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface truncate">
                          {chat.sellerName}
                        </span>
                        {chat.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {chat.productTitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Active Message Window */}
          {activeChat ? (
            <div className="flex-1 flex flex-col justify-between bg-[#fffcf7] overflow-hidden">
              {/* Product Context Banner */}
              <div className="p-2.5 px-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={activeChat.productImage}
                    alt={activeChat.productTitle}
                    className="w-8 h-8 object-contain rounded-md bg-white p-0.5 border border-outline-variant/30"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {activeChat.productTitle}
                    </p>
                    <span className="text-[11px] font-bold text-primary">
                      ₹{activeChat.productPrice}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">
                  Instant Foyer Handover
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeChat.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                        m.isMe
                          ? 'bg-primary text-on-primary rounded-br-none'
                          : 'bg-surface-container-low text-on-surface rounded-bl-none border border-outline-variant/40'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-on-surface-variant mt-1 px-1">
                      {m.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message or proposed meeting spot..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/70 text-on-surface text-xs rounded-full px-4 py-2 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-on-surface-variant">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

