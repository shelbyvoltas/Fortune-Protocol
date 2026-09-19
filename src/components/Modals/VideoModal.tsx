import React from 'react';
import { X, PlayCircle, Sparkles, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-gold rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border-[#FDB813]/40 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FDB813]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE]">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Video Tutorials &amp; Updates</h3>
              <p className="font-mono text-xs text-[#22D3EE]">Official BLOVE KRACK Media</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Mockup / Robot Illustration */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#08080B] border border-white/10 group flex items-center justify-center">
          <img
            src="/robot-video.jpg"
            alt="Tutorial Video Robot"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FDB813] text-black flex items-center justify-center shadow-[0_0_30px_rgba(253,184,19,0.7)] group-hover:scale-110 transition-transform">
              <PlayCircle className="w-8 h-8 fill-black text-black ml-0.5" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-base">BLOVE KRACK Walkthrough</p>
              <p className="font-mono text-xs text-[#FDB813]">Protocol Overview &amp; 15-Level Rewards</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400 font-mono">
            New video tutorials uploaded weekly to our YouTube channel.
          </p>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FDB813] hover:underline"
          >
            <span>Subscribe on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
