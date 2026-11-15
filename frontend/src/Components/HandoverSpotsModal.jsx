import React from 'react';
import { HANDOVER_SPOTS } from '../data/mockData';

export default function HandoverSpotsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest max-w-xl w-full rounded-3xl shadow-2xl p-6 sm:p-8 border border-outline-variant/60 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">pin_drop</span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface leading-tight">
                Designated Campus Handover Spots
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Safe, CCTV-monitored peer exchange zones at Rishihood University
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

        {/* Spots Grid */}
        <div className="space-y-3 mb-5">
          {HANDOVER_SPOTS.map((spot) => (
            <div
              key={spot.id}
              className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/50 hover:border-primary/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">{spot.name}</h4>
                  <span className="text-[10px] bg-primary text-on-primary font-bold px-2 py-0.5 rounded-full">
                    {spot.badge}
                  </span>
                </div>
                <span className="text-[11px] text-secondary font-semibold">
                  {spot.timings}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-2">{spot.description}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold">
                <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
                <span>Best for: {spot.recommendedFor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Banner */}
        <div className="bg-secondary-fixed/30 rounded-2xl p-3.5 border border-secondary-fixed/50 flex items-center gap-2.5 text-xs text-on-surface">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
            verified_user
          </span>
          <p className="leading-snug">
            All trades are student-to-student. Never accept unverified non-campus QR code payments or meet off-campus.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-outline-variant/40">
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-full font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Got it, Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

