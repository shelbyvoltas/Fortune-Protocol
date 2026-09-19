import React from 'react';
import { Send, MessageSquare, Lightbulb, Share2 } from 'lucide-react';
import { BRAND } from '../../config/constants';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenAdmin }) => {
  const footerLinks = [
    { label: 'About', id: 'home' },
    { label: 'Roadmap', id: 'home' },
    { label: '15-Level Referral', id: 'referral' },
    { label: 'My Rewards', id: 'rewards' },
    { label: 'FAQ', id: 'home' },
    { label: 'Terms', id: 'home' },
    { label: 'Privacy', id: 'home' },
  ];

  return (
    <footer className="relative bg-[#060608] border-t border-[#FDB813]/20 pt-16 pb-12 overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#FDB813]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Content Grid */}
        <div className="flex flex-col items-center text-center space-y-8">

          {/* Brand Logo & Tagline */}
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onNavClick('home')}>
            <div className="flex items-center gap-3">
              <img
                src="/blove-logo.png"
                alt="BLOVE KRACK"
                className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(253,184,19,0.5)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-display font-black text-2xl text-white tracking-wider">
                BLOVE <span className="gold-gradient-text">KRACK</span>
              </span>
            </div>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-[0.25em]">
              PLAY • COMPETE • EARN
            </p>
          </div>

          {/* Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-gray-300">
            {footerLinks.map((link, idx) => (
              <React.Fragment key={link.label}>
                <button
                  onClick={() => {
                    if (link.id) onNavClick(link.id);
                  }}
                  className="hover:text-[#FDB813] transition-colors"
                >
                  {link.label}
                </button>
                {idx < footerLinks.length - 1 && <span className="text-gray-600">|</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href={BRAND.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FDB813]/20 border border-white/10 hover:border-[#FDB813]/40 flex items-center justify-center text-gray-300 hover:text-[#FDB813] transition-all"
              title="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>

            {/* Twitter / X SVG */}
            <a
              href={BRAND.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FDB813]/20 border border-white/10 hover:border-[#FDB813]/40 flex items-center justify-center text-gray-300 hover:text-[#FDB813] transition-all"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube SVG */}
            <a
              href={BRAND.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FDB813]/20 border border-white/10 hover:border-[#FDB813]/40 flex items-center justify-center text-gray-300 hover:text-[#FDB813] transition-all"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Discord SVG */}
            <a
              href={BRAND.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FDB813]/20 border border-white/10 hover:border-[#FDB813]/40 flex items-center justify-center text-gray-300 hover:text-[#FDB813] transition-all"
              title="Discord"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FDB813]/20 border border-white/10 hover:border-[#FDB813]/40 flex items-center justify-center text-gray-300 hover:text-[#FDB813] transition-all"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>

          {/* Slogan */}
          <div className="pt-2">
            <span className="font-display italic font-bold text-lg text-[#FDB813] drop-shadow-[0_0_10px_rgba(253,184,19,0.4)]">
              Same Vision Stronger Together!
            </span>
          </div>

          {/* Bottom Bar — Branding */}
          <div className="w-full pt-8 border-t border-white/10 flex flex-col items-center gap-2 text-xs font-mono text-gray-400">
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <div>© 2026 BLOVE KRACK. All Rights Reserved.</div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <span></span>
                <span className="text-[#FDB813] font-semibold"></span>
                <Lightbulb className="w-3.5 h-3.5 text-[#FDB813]" />
              </div>
            </div>
            <div className="text-gray-500 text-[11px]">
              Made with <span className="text-red-400">❤</span> by <span className="text-[#FDB813] font-semibold">Krack</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};
