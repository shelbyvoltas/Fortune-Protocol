import React, { useState } from 'react';
import { Gamepad2, PlayCircle, ArrowRight, UserPlus, LogIn, Trophy, Coins, Users2 } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';

interface FeatureCardsProps {
  onOpenGuide: () => void;
  onOpenVideo: () => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onOpenGuide, onOpenVideo }) => {
  const { connectWallet, account } = useWeb3();

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Guide and Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* GUIDE Card */}
          <div className="glass-panel cyber-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="flex-1 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FDB813] font-bold uppercase tracking-wider">
                <Gamepad2 className="w-4 h-4 text-[#FDB813]" />
                <span>BEGINNER GUIDE</span>
              </div>
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                GUIDE
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Step-by-step guide to get started on Blove Krack, connecting your BSC wallet, and earning 15 levels of referral rewards.
              </p>
              <button
                onClick={onOpenGuide}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#FDB813]/30 text-xs font-display font-bold text-white uppercase tracking-wider transition-all group-hover:border-[#FDB813] group-hover:shadow-[0_0_15px_rgba(253,184,19,0.2)]"
              >
                <span>View Guide</span>
                <ArrowRight className="w-4 h-4 text-[#FDB813]" />
              </button>
            </div>

            <div className="w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 relative rounded-2xl overflow-hidden border border-[#FDB813]/30 shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img
                src="/robot-guide.jpg"
                alt="Guide Robot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/robot-hero.png';
                }}
              />
              <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-[#FDB813] font-bold">
                GUIDE
              </div>
            </div>
          </div>

          {/* VIDEO Card */}
          <div className="glass-panel cyber-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="flex-1 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-bold uppercase tracking-wider">
                <PlayCircle className="w-4 h-4 text-[#22D3EE]" />
                <span>VIDEO TUTORIALS</span>
              </div>
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                VIDEO
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Watch animated tutorials, platform updates, and discover how our game-and-earn ecosystem rewards your activity.
              </p>
              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#22D3EE]/30 text-xs font-display font-bold text-white uppercase tracking-wider transition-all group-hover:border-[#22D3EE] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <span>Watch Now</span>
                <ArrowRight className="w-4 h-4 text-[#22D3EE]" />
              </button>
            </div>

            <div className="w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 relative rounded-2xl overflow-hidden border border-[#22D3EE]/30 shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img
                src="/robot-video.jpg"
                alt="Video Robot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/robot-hero.png';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FDB813] text-black flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 fill-black text-black" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Dual Banners: Login / Sign Up */}
        {!account && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <button
              onClick={connectWallet}
              className="py-4 px-6 rounded-2xl glass-panel hover:bg-white/10 border-[#FDB813]/25 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#FDB813]">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-sm text-white">LOGIN VIA WALLET</p>
                  <p className="font-mono text-[10px] text-gray-400">BSC Non-Custodial Login</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-[#FDB813] transition-all" />
            </button>

            <button
              onClick={connectWallet}
              className="py-4 px-6 rounded-2xl btn-gold-glow flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-black/10 text-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-display font-black text-sm text-black">REGISTER FOR 100 BLOVE-KRACK</p>
                  <p className="font-mono text-[10px] text-black/70">Instant Welcome Reward</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Platform Overview Banner & 4 Pillars */}
        <div className="glass-panel-gold rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-8">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
              BLOVE <span className="gold-gradient-text">KRACK</span>
            </h3>
            <p className="font-mono text-xs text-[#FDB813] tracking-[0.25em] uppercase font-semibold">
              PLAY • COMPETE • EARN
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              BLOVE KRACK is a next-generation gaming and rewards platform, built for a global community. Play exciting games, compete with players worldwide, earn real rewards and grow together.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FDB813]/10 border border-[#FDB813]/25 flex items-center justify-center text-[#FDB813]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-white uppercase">PLAY</h4>
              <p className="font-mono text-xs text-gray-400">Exciting Games</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/25 flex items-center justify-center text-[#22D3EE]">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-white uppercase">COMPETE</h4>
              <p className="font-mono text-xs text-gray-400">Globally</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-center text-[#10B981]">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-white uppercase">EARN</h4>
              <p className="font-mono text-xs text-gray-400">Real Rewards</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/25 flex items-center justify-center text-[#A855F7]">
                <Users2 className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-sm text-white uppercase">GROW</h4>
              <p className="font-mono text-xs text-gray-400">Together</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
