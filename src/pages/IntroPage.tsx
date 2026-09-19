import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  Play,
  ExternalLink,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Radio,
  Trophy,
  Gamepad2,
  Coins
} from 'lucide-react';
import { BSC_MAINNET_ID } from '../config/constants';
import { isMobileDevice, isInDAppBrowser, WALLET_OPTIONS, openInWallet } from '../utils/walletDeepLinks';
import { soundEngine } from '../utils/cinematicAudio';

interface IntroPageProps {
  onOpenAdmin?: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onOpenAdmin }) => {
  const { account, isCorrectNetwork, connectWallet, switchNetwork, txStatus } = useWeb3();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Cinematic Intro State: 'playing' | 'transitioning' | 'completed'
  const [introPhase, setIntroPhase] = useState<'playing' | 'transitioning' | 'completed'>('playing');
  const [introProgress, setIntroProgress] = useState(0);
  const [cinematicStep, setCinematicStep] = useState(1); // 1: Void/Laser, 2: Portal/Robot, 3: Emblem Smash, 4: Title & Pillars
  const [isMuted, setIsMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Mobile Web3 Wallet Selector Modal
  const [showWalletModal, setShowWalletModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMobile = isMobileDevice();
  const hasInjected = isInDAppBrowser();

  // =========================================================================
  // Canvas Particle System (Golden Warp Starfield & Cyber Dust)
  // =========================================================================
  useEffect(() => {
    if (introPhase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const count = isMobile ? 45 : 90;
    const particles = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.3 ? '#FDB813' : '#FFE066',
      alpha: Math.random() * 0.7 + 0.3
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const speed = cinematicStep >= 3 ? 12 : 4; // Warp speed boost on impact!

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.z -= speed;

        if (p.z <= 0) {
          p.z = width;
          p.x = (Math.random() - 0.5) * width;
          p.y = (Math.random() - 0.5) * height;
        }

        const k = 250 / p.z;
        const px = p.x * k + cx;
        const py = p.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.6, (1 - p.z / width) * p.size * 2.2);
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (1 - p.z / width);
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FDB813';
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [introPhase, cinematicStep, isMobile]);

  // =========================================================================
  // Cinematic Timeline Orchestrator
  // =========================================================================
  useEffect(() => {
    if (introPhase !== 'playing') return;

    // Step 1: Laser sweep & sound
    soundEngine.playWhoosh();

    // Step 2: Mascot & Portal reveal after 900ms
    const t2 = setTimeout(() => {
      setCinematicStep(2);
      soundEngine.playWhoosh();
    }, 900);

    // Step 3: Logo smash & Screen Shake after 2200ms
    const t3 = setTimeout(() => {
      setCinematicStep(3);
      setScreenShake(true);
      soundEngine.playBoom();
      setTimeout(() => setScreenShake(false), 700);
    }, 2200);

    // Step 4: Title reveal & golden chime after 3400ms
    const t4 = setTimeout(() => {
      setCinematicStep(4);
      soundEngine.playShimmer();
    }, 3400);

    // Progress runner (0 to 100% over ~4.6s)
    const progressInterval = setInterval(() => {
      setIntroProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.2;
      });
    }, 90);

    // Auto-complete intro after 5.0s
    const tEnd = setTimeout(() => {
      setIntroPhase('transitioning');
      setTimeout(() => setIntroPhase('completed'), 400);
    }, 5200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tEnd);
      clearInterval(progressInterval);
    };
  }, [introPhase]);

  const handleSkipIntro = () => {
    setIntroPhase('transitioning');
    setTimeout(() => setIntroPhase('completed'), 300);
  };

  const handleReplayIntro = () => {
    setCinematicStep(1);
    setIntroProgress(0);
    setIntroPhase('playing');
  };

  const toggleSound = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsMuted(soundEngine.isMuted);
  };

  const handleEnterClick = async () => {
    setConnectionError(null);

    // If user is on a mobile external browser without injected wallet (e.g. Chrome, Safari),
    // open the deep-link wallet selection modal directly
    if (isMobile && !hasInjected) {
      setShowWalletModal(true);
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet();
      // If connected but not on BSC, automatically trigger network switch
      if (!isCorrectNetwork) {
        await switchNetwork(BSC_MAINNET_ID);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('No Web3 provider') || err.message.includes('install'))) {
        setShowWalletModal(true);
      } else if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
        setConnectionError('Access cancelled. Tap ENTER to proceed.');
      } else {
        setConnectionError(err.message || 'Failed to enter arena. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const wasRejected = txStatus === 'user_cancelled' || txStatus === 'signature_rejected';

  // =========================================================================
  // 1. BLOCKBUSTER CINEMATIC INTRO SCREEN
  // =========================================================================
  if (introPhase === 'playing' || introPhase === 'transitioning') {
    return (
      <div
        className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none font-sans transition-opacity duration-500 ${
          introPhase === 'transitioning' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
        } ${screenShake ? 'animate-cinematic-shake' : ''}`}
      >
        {/* Interactive Particle Warp Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Pure Black Dark-Space Base */}
        <div className="absolute inset-0 bg-black z-[1] pointer-events-none" />

        {/* Central Golden Plasma Nebula */}
        <div
          className={`absolute w-[650px] h-[650px] rounded-full bg-[#FDB813]/15 blur-[160px] pointer-events-none transition-all duration-1000 z-[1] ${
            cinematicStep >= 3 ? 'scale-125 opacity-90' : 'scale-75 opacity-40'
          }`}
        />

        {/* Top Controls: Sound & Skip */}
        <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-black/60 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white transition-all backdrop-blur-md"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#FFE066]" />}
          </button>

          <button
            onClick={handleSkipIntro}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-[#FDB813]/40 text-xs text-white transition-all flex items-center gap-1.5 backdrop-blur-md font-mono shadow-[0_0_15px_rgba(253,184,19,0.2)]"
          >
            <span>Skip Intro</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FDB813]" />
          </button>
        </div>

        {/* Top Left: Futuristic Telemetry Readout */}
        <div className="absolute top-6 left-6 z-40 hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#FFE066]/80 tracking-widest uppercase">
          <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
          <span>KRACK PROTOCOL v2.4 // BSC MAINNET READY</span>
        </div>

        {/* Laser Sweep Effect across screen in Step 1 */}
        {cinematicStep === 1 && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFE066] to-transparent shadow-[0_0_30px_#FDB813] z-20 animate-pulse pointer-events-none" />
        )}

        {/* Main Center Stage */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-2xl w-full">

          {/* Hologram & Emblem Visual Stage */}
          <div className="relative mb-6 flex items-center justify-center min-h-[180px]">

            {/* Stage 2 & 3: Rotating Cyber Rings */}
            <div
              className={`absolute w-64 h-64 rounded-full border border-[#FDB813]/25 animate-spin-slow transition-all duration-1000 ${
                cinematicStep >= 2 ? 'opacity-80 scale-100' : 'opacity-0 scale-50'
              }`}
            />
            <div
              className={`absolute w-80 h-80 rounded-full border border-dashed border-[#22D3EE]/20 animate-spin-reverse transition-all duration-1000 ${
                cinematicStep >= 2 ? 'opacity-70 scale-100' : 'opacity-0 scale-50'
              }`}
            />

            {/* Shockwave Rings on Emblem Impact */}
            {cinematicStep >= 3 && (
              <>
                <div className="absolute w-44 h-44 rounded-full border-2 border-[#FFE066] animate-shockwave pointer-events-none" />
                <div className="absolute w-64 h-64 rounded-full border border-[#FDB813]/60 animate-shockwave pointer-events-none" style={{ animationDelay: '0.4s' }} />
              </>
            )}

            {/* The Iconic BLOVE KRACK Golden Emblem */}
            <div
              className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1.5 bg-gradient-to-br from-[#FFF2B2] via-[#FDB813] to-[#B45309] shadow-[0_0_70px_rgba(253,184,19,0.65)] transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${
                cinematicStep >= 3
                  ? 'scale-100 opacity-100 rotate-0'
                  : cinematicStep === 2
                  ? 'scale-75 opacity-40 rotate-12 filter blur-sm'
                  : 'scale-0 opacity-0 -rotate-45'
              }`}
            >
              <div className="w-full h-full rounded-[22px] bg-[#0A0A0E] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FDB813]/30 via-transparent to-transparent" />
                
                {/* Metallic light sheen animation */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sheen pointer-events-none" />

                <img
                  src="/blove-logo.png"
                  alt="BLOVE KRACK"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(253,184,19,0.9)]"
                />
              </div>
            </div>

          </div>

          {/* Brand Titles & Staggered Reveal */}
          <div
            className={`transition-all duration-700 transform ${
              cinematicStep >= 4
                ? 'opacity-100 translate-y-0 filter blur-0'
                : 'opacity-0 translate-y-8 filter blur-md'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#FDB813]" />
              <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#FFE066] font-bold">
                NEXT-GEN WEB3 GAMING ECOSYSTEM
              </p>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#FDB813]" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase mb-3 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
              BLOVE <span className="gold-gradient-text">KRACK</span>
            </h1>

            {/* Three Futuristic Neon Gaming Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
              <div className="px-3.5 py-1.5 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/40 text-[#FFE066] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(253,184,19,0.25)]">
                <Gamepad2 className="w-3.5 h-3.5 text-[#FDB813]" />
                <span>PLAY</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/40 text-[#22D3EE] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                <Trophy className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>COMPETE</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Coins className="w-3.5 h-3.5 text-[#10B981]" />
                <span>EARN 15-TIER REWARDS</span>
              </div>
            </div>
          </div>

          {/* Futuristic Energy Initialization Track */}
          <div className="w-full max-w-sm space-y-3 mt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                {introProgress < 40
                  ? 'SYNCHRONIZING BSC SMART CHAIN...'
                  : introProgress < 80
                  ? 'ALLOCATING REWARD POOLS...'
                  : 'PROTOCOL READY // ENTER ARENA'}
              </span>
              <span className="text-[#FFE066] font-bold">{Math.min(100, Math.round(introProgress))}%</span>
            </div>

            {/* Glowing Golden Progress Bar */}
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-[1px] border border-[#FDB813]/35 shadow-[0_0_20px_rgba(253,184,19,0.3)]">
              <div
                className="h-full bg-gradient-to-r from-[#FDB813] via-[#FFF2B2] to-[#FDB813] rounded-full shadow-[0_0_20px_rgba(253,184,19,1)] transition-all duration-150 ease-out"
                style={{ width: `${introProgress}%` }}
              />
            </div>

            {/* Direct Enter Button */}
            <button
              onClick={handleSkipIntro}
              className="mt-4 px-8 py-3 rounded-xl btn-gold-glow text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto shadow-[0_0_25px_rgba(253,184,19,0.5)]"
            >
              <span>ENTER THE ARENA</span>
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>

        </div>

        {/* Bottom Security Watermark */}
        <div className="absolute bottom-6 text-center text-[10px] font-mono text-gray-500 tracking-widest uppercase flex items-center justify-center gap-2">
          <span>SECURE NON-CUSTODIAL WEB3 PROTOCOL • CHAIN ID: 56</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CONNECT GATEWAY SCREEN
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black font-sans px-4 py-8">

      {/* Ambient Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <img
          src="/blove-logo.png"
          alt=""
          className="w-[520px] h-[520px] object-contain opacity-[0.035]"
          aria-hidden="true"
        />
      </div>

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FDB813]/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#22D3EE]/6 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Controls: Replay Intro */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleReplayIntro}
          className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#FDB813]/30 text-xs text-[#FFE066] hover:text-white transition-colors flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(253,184,19,0.15)]"
        >
          <Play className="w-3 h-3 text-[#FDB813]" />
          <span>Replay Cinematic</span>
        </button>
      </div>

      {/* Mobile Deep-Link Warning Banner (if opened in Chrome/Safari mobile outside dApp) */}
      {isMobile && !hasInjected && (
        <div className="max-w-md w-full mb-6 z-20 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass-panel-gold rounded-2xl p-4 border-[#FDB813]/40 bg-gradient-to-r from-[#FDB813]/15 to-transparent space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FDB813]/20 text-[#FDB813]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Mobile Browser Detected
                </p>
                <p className="text-[11px] text-gray-300">
                  Open directly inside your Web3 wallet app for instant connection:
                </p>
              </div>
            </div>

            {/* Quick 1-tap Launchers */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {WALLET_OPTIONS.slice(0, 3).map((w) => (
                <button
                  key={w.id}
                  onClick={() => openInWallet(w.id as any)}
                  className="px-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FDB813]/50 text-center transition-all flex flex-col items-center gap-1 group"
                >
                  <img src={w.icon} alt={w.name} className="w-5 h-5 object-contain rounded-md" />
                  <span className="text-[11px] font-medium text-gray-200 group-hover:text-[#FFE066]">
                    {w.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Gateway Card */}
      <div className="relative z-10 max-w-md w-full">

        {/* Logo & Brand Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-3xl glass-panel-gold border-[#FDB813]/50 flex items-center justify-center shadow-[0_0_40px_rgba(253,184,19,0.3)] overflow-hidden">
              <img
                src="/blove-logo.png"
                alt="BLOVE KRACK"
                className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(253,184,19,0.6)]"
              />
            </div>
            {/* Ambient Pulsing Halo */}
            <div className="absolute inset-0 rounded-3xl border-2 border-[#FDB813]/30 animate-ping" style={{ animationDuration: '3.5s' }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase mb-2">
            BLOVE <span className="gold-gradient-text">KRACK</span>
          </h1>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-3.5 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-[#FFE066] font-mono text-xs font-bold tracking-[0.2em] uppercase">
              PLAY • COMPETE • EARN
            </span>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Access the premier Web3 gaming and referral rewards ecosystem on BNB Smart Chain.
          </p>
        </div>

        {/* Connection Action Box */}
        <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 space-y-5 border-[#FDB813]/35 shadow-2xl">

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400 uppercase tracking-wider">Gateway Status</span>
            <span
              className={`flex items-center gap-1.5 font-bold ${
                account && isCorrectNetwork
                  ? 'text-[#10B981]'
                  : account && !isCorrectNetwork
                  ? 'text-amber-400'
                  : isConnecting
                  ? 'text-[#FDB813]'
                  : 'text-gray-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  account && isCorrectNetwork
                    ? 'bg-[#10B981]'
                    : account && !isCorrectNetwork
                    ? 'bg-amber-400 animate-pulse'
                    : isConnecting
                    ? 'bg-[#FDB813] animate-ping'
                    : 'bg-[#10B981]'
                }`}
              />
              {account && isCorrectNetwork
                ? 'Active • BSC Mainnet'
                : account && !isCorrectNetwork
                ? 'Switching to BSC...'
                : isConnecting
                ? 'Authenticating...'
                : 'Protocol Ready'}
            </span>
          </div>

          {/* Connection Error or Cancelled Notice */}
          {(connectionError || wasRejected) && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-300">
                  {wasRejected ? 'Access Cancelled' : 'Notice'}
                </p>
                <p className="text-xs text-red-200/70 mt-1 leading-relaxed">
                  {connectionError || 'Please confirm in your wallet to enter the platform.'}
                </p>
              </div>
            </div>
          )}

          {/* Primary Action Button (Single Merged Enter Button) */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                <ShieldCheck className="w-4 h-4 text-[#FDB813]" />
                <span>Compatible: Trust Wallet, SafePal, MetaMask, Binance</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                <Zap className="w-4 h-4 text-[#22D3EE]" />
                <span>Network: BNB Smart Chain (BSC Mainnet)</span>
              </div>
            </div>

            {/* Single Merged ENTER Button */}
            <button
              onClick={handleEnterClick}
              disabled={isConnecting}
              className="w-full btn-gold-glow py-4 rounded-xl text-base font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(253,184,19,0.35)] hover:shadow-[0_0_45px_rgba(253,184,19,0.6)] active:scale-[0.98] transition-all"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>ENTERING...</span>
                </>
              ) : (
                <>
                  <span>ENTER</span>
                  <ChevronRight className="w-5 h-5 text-black stroke-[3]" />
                </>
              )}
            </button>

            {/* Retry button if previously failed */}
            {(connectionError || wasRejected) && (
              <button
                onClick={handleEnterClick}
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              Non-Custodial
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FDB813]" />
              BSC Verified
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
              Instant Rewards
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            Made with <span className="text-red-400">❤</span> by <span className="text-[#FDB813] font-medium">Krack</span>
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. WEB3 WALLET DIRECT LAUNCH MODAL
          ========================================================================= */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 max-w-sm w-full border-[#FDB813]/40 space-y-5 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FDB813]/20 border border-[#FDB813]/40 flex items-center justify-center mx-auto text-[#FDB813] mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">
                Launch in Web3 Wallet
              </h3>
              <p className="text-xs text-gray-400">
                Select your preferred wallet to open this DApp directly:
              </p>
            </div>

            {/* Wallet Selection List */}
            <div className="space-y-2.5">
              {WALLET_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    openInWallet(w.id as any);
                    setShowWalletModal(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FDB813]/50 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={w.icon}
                      alt={w.name}
                      className="w-7 h-7 object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white group-hover:text-[#FFE066] transition-colors">
                        {w.name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400">Direct In-App Browser</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FDB813]/20 text-[#FFE066] border border-[#FDB813]/30">
                        {w.badge}
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            {/* Help text */}
            <p className="text-[11px] text-center text-gray-500 font-mono">
              Opening directly connects you seamlessly without manual network setup.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
