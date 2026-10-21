import React from 'react';
import { Megaphone, Settings, Zap, Users, ArrowRight } from 'lucide-react';

export const Announcements: React.FC = () => {
  const items = [
    {
      id: 1,
      icon: Settings,
      iconColor: 'text-[#2563EB]',
      iconBg: 'bg-[#2563EB]/10 border-[#2563EB]/30',
      title: 'PLATFORM UPDATE',
      badge: 'NEW',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      description: 'FORTUNE PROTOCOL G is currently undergoing a protocol-wide performance upgrade to enhance transaction throughput and reward settlement.',
      date: '02 SEP 2026',
    },
    {
      id: 2,
      icon: Zap,
      iconColor: 'text-[#22D3EE]',
      iconBg: 'bg-[#22D3EE]/10 border-[#22D3EE]/30',
      title: 'NEW FEATURES',
      description: 'Exciting gaming arenas, instant leaderboards, and enhanced 15-level tier commission analytics coming soon! Stay tuned.',
      date: '01 SEP 2026',
    },
    {
      id: 3,
      icon: Users,
      iconColor: 'text-[#10B981]',
      iconBg: 'bg-[#10B981]/10 border-[#10B981]/30',
      title: 'COMMUNITY GROWTH',
      description: 'Over 36,000+ active players joined our global community in just 6 days! Thank you for your incredible support and energy.',
      date: '30 AUG 2026',
    }
  ];

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
                ANNOUNCEMENTS
              </h2>
              <p className="font-mono text-xs text-gray-400">Live platform news &amp; roadmap releases</p>
            </div>
          </div>

          <button className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-[#2563EB] hover:text-white transition-colors">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Announcement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="glass-panel cyber-card rounded-2xl p-6 flex flex-col justify-between border-white/10 hover:border-[#2563EB]/40 transition-all text-left group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${item.iconBg} ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-base text-white uppercase tracking-wide mb-2 group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-300 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Date</span>
                  <span className="text-gray-200 font-semibold">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
