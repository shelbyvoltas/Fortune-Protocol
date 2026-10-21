import React from 'react';
import { Hero } from '../components/Hero/Hero';
import { TokenCard } from '../components/TokenCard/TokenCard';
import { FeatureCards } from '../components/Features/FeatureCards';
import { Announcements } from '../components/Announcements/Announcements';

interface HomePageProps {
  onJoinNow: () => void;
  onOpenGuide: () => void;
  onOpenVideo: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onJoinNow, onOpenGuide, onOpenVideo }) => {
  return (
    <div className="space-y-4 relative">
      {/* Impressive Ambient Fortune Protocol G Logo Watermark Background */}
      <div 
        className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative flex items-center justify-center">
          {/* Ambient Glowing Blue Halos */}
          <div className="absolute w-[600px] sm:w-[780px] h-[600px] sm:h-[780px] rounded-full bg-[#2563EB]/[0.035] blur-[150px]" />
          <div className="absolute w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-[#60A5FA]/[0.025] blur-[100px]" />
          
          {/* Fortune Protocol G Emblem Watermark */}
          <img
            src="/fortune-logo.png"
            alt=""
            className="w-[480px] sm:w-[650px] lg:w-[800px] h-auto object-contain opacity-[0.055] drop-shadow-[0_0_60px_rgba(37, 99, 235,0.3)] animate-pulse"
            style={{ animationDuration: '6s' }}
          />
        </div>
      </div>

      {/* Foreground Interactive Page Content */}
      <div className="relative z-10 space-y-4">
        <Hero onJoinNow={onJoinNow} />
        <TokenCard onSuccess={onJoinNow} />
        <FeatureCards onOpenGuide={onOpenGuide} onOpenVideo={onOpenVideo} />
        <Announcements />
      </div>
    </div>
  );
};
