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
      <div className="glass-panel rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border-[#2563EB]/40 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2563EB]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2563EB]/20 text-[#38BDF8]">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Video Tutorials &amp; Updates</h3>
              <p className="font-mono text-xs text-[#38BDF8]">Official Fortune Protocol G Media</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Mockup / Protocol Illustration */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#060D19] border border-[#2563EB]/20 group flex items-center justify-center p-6">
          <img
            src="/logo.png"
            alt="Fortune Protocol G Video"
            className="w-48 h-48 object-contain opacity-70 group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_0_25px_rgba(37,99,235,0.4)]"
          />
          <div className="absolute inset-0 bg-[#060D19]/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.7)] group-hover:scale-110 transition-transform">
              <PlayCircle className="w-8 h-8 fill-white text-[#2563EB] ml-0.5" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-base">Fortune Protocol G Walkthrough</p>
              <p className="font-mono text-xs text-[#38BDF8]">Protocol Overview &amp; 15-Level Rewards</p>
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
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38BDF8] hover:underline"
          >
            <span>Subscribe on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
