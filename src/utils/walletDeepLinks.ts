/**
 * Web3 Wallet Deep Link and Mobile DApp Redirection Utility
 * Enables seamless redirection from external mobile browsers (Chrome, Safari, etc.)
 * directly into Web3 wallets (Trust Wallet, SafePal, MetaMask, etc.)
 */

export interface WalletOption {
  id: 'trust' | 'safepal' | 'metamask' | 'binance' | 'okx';
  name: string;
  icon: string;
  badge?: string;
  getDeepLink: (url: string) => string;
}

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isInDAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const anyWin = window as any;
  return Boolean(
    anyWin.ethereum ||
    anyWin.trustwallet ||
    anyWin.safepal ||
    anyWin.isSafePal ||
    anyWin.ethereum?.isTrust ||
    anyWin.ethereum?.isMetaMask ||
    anyWin.ethereum?.isSafePal ||
    anyWin.ethereum?.isBinance ||
    anyWin.okxwallet
  );
};

/**
 * Generates wallet deep links according to official wallet developer specs
 */
export const getCleanDAppUrl = (): string => {
  if (typeof window === 'undefined') return 'https://blovekrack.io';
  // Strip protocol for wallets that require bare domain/path
  return window.location.href;
};

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'https://assets.trustwallet.com/dapps/trust-wallet-token.png',
    badge: 'Popular',
    getDeepLink: (url: string) => {
      // Trust Wallet universal link
      const encoded = encodeURIComponent(url);
      return `https://link.trustwallet.com/open_url?coin_id=60&url=${encoded}`;
    }
  },
  {
    id: 'safepal',
    name: 'SafePal Wallet',
    icon: 'https://www.safepal.com/images/safepal-logo.svg',
    badge: 'Fast',
    getDeepLink: (url: string) => {
      // SafePal DApp deep link
      const encoded = encodeURIComponent(url);
      return `https://link.safepal.io/download?url=${encoded}`;
    }
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    badge: 'Standard',
    getDeepLink: (url: string) => {
      // MetaMask deep link requires protocol stripped
      const stripped = url.replace(/^https?:\/\//i, '');
      return `https://metamask.app.link/dapp/${stripped}`;
    }
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: 'https://static.okx.com/cdn/assets/imgs/247/E0DE436B151E0EB3.png',
    getDeepLink: (url: string) => {
      const encoded = encodeURIComponent(url);
      return `https://www.okx.com/download?deeplink=okx://wallet/dapp/details?dappUrl=${encoded}`;
    }
  }
];

export const openInWallet = (walletId: 'trust' | 'safepal' | 'metamask' | 'okx') => {
  const currentUrl = getCleanDAppUrl();
  const option = WALLET_OPTIONS.find(w => w.id === walletId);
  if (!option) return;

  const deepLink = option.getDeepLink(currentUrl);

  // Attempt window.location first, fallback to hidden iframe/anchor for mobile browsers
  try {
    window.location.href = deepLink;
  } catch (e) {
    const a = document.createElement('a');
    a.href = deepLink;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
