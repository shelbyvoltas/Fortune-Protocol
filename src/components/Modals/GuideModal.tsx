import React from 'react';
import { X, Gamepad2, ShieldCheck, Gift, Users, ArrowRight } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onGetStarted }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Connect BSC Wallet',
      description: 'Connect with MetaMask, Trust Wallet, or Binance Web3 Wallet on BNB Smart Chain.',
      icon: ShieldCheck,
      color: 'text-[#FDB813]',
    },
    {
      num: '02',
      title: 'Register Account',
      description: 'Confirm the one-time registration in your wallet to verify your address.',
      icon: Gamepad2,
      color: 'text-[#22D3EE]',
    },
    {
      num: '03',
      title: 'Receive 100 BLove-Krack Bonus',
      description: 'Once confirmed, 100 BLove-Krack welcome bonus tokens are credited to your account by the platform.',
      icon: Gift,
      color: 'text-[#10B981]',
    },
    {
      num: '04',
      title: 'Share 15-Level Referral Link',
      description: 'Share your personal referral link and unlock 15 tiers of recurring commissions (up to 25% direct bonus).',
      icon: Users,
      color: 'text-[#A855F7]',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-gold rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border-[#FDB813]/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FDB813]/20">
          <div className="flex items-center gap-3">
            <img
              src="/robot-guide.jpg"
              alt="Guide Robot"
              className="w-12 h-12 rounded-xl object-cover border border-[#FDB813]/40"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h3 className="font-display font-bold text-xl text-white">Getting Started Guide</h3>
              <p className="font-mono text-xs text-[#FDB813]">4 Easy Steps to Play, Compete &amp; Earn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-[#08080B]/80 border border-white/10 flex items-start gap-4 hover:border-[#FDB813]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-black text-sm text-[#FDB813] flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${step.color}`} />
                    <span>{step.title}</span>
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGetStarted();
            }}
            className="flex-1 btn-gold-glow py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>

      </div>
    </div>
  );
};
