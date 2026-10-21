export const BSC_MAINNET_ID = 56;
export const BSC_TESTNET_ID = 97;

export const BSC_CHAINS = {
  [BSC_MAINNET_ID]: {
    name: 'BNB Smart Chain Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    currencySymbol: 'BNB',
    chainIdHex: '0x38',
  },
  [BSC_TESTNET_ID]: {
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com',
    currencySymbol: 'tBNB',
    chainIdHex: '0x61',
  }
};

export const REFERRAL_RATES = [
  { level: 1,  percentage: 25,  percentageDisplay: '25%',  description: 'Direct Referrals' },
  { level: 2,  percentage: 10,  percentageDisplay: '10%',  description: 'Level 2' },
  { level: 3,  percentage: 8,   percentageDisplay: '8%',   description: 'Level 3' },
  { level: 4,  percentage: 7,   percentageDisplay: '7%',   description: 'Level 4' },
  { level: 5,  percentage: 6,   percentageDisplay: '6%',   description: 'Level 5' },
  { level: 6,  percentage: 5,   percentageDisplay: '5%',   description: 'Level 6' },
  { level: 7,  percentage: 4,   percentageDisplay: '4%',   description: 'Level 7' },
  { level: 8,  percentage: 3,   percentageDisplay: '3%',   description: 'Level 8' },
  { level: 9,  percentage: 2,   percentageDisplay: '2%',   description: 'Level 9' },
  { level: 10, percentage: 2,   percentageDisplay: '2%',   description: 'Level 10' },
  { level: 11, percentage: 1.5, percentageDisplay: '1.5%', description: 'Level 11' },
  { level: 12, percentage: 1.5, percentageDisplay: '1.5%', description: 'Level 12' },
  { level: 13, percentage: 1,   percentageDisplay: '1%',   description: 'Level 13' },
  { level: 14, percentage: 1,   percentageDisplay: '1%',   description: 'Level 14' },
  { level: 15, percentage: 1,   percentageDisplay: '1%',   description: 'Level 15' },
];

export const BRAND = {
  name: 'Fortune Protocol G',
  shortName: 'FPG',
  tagline: 'EARN • GROW • PROSPER',
  heroHeadline: 'THE PROTOCOL IS LIVE!',
  heroSubheadline: 'A non-custodial, smart-contract-governed earning protocol on BNB Smart Chain. Automated daily Bonus, 15-level referral network, and a 10-tier rank system.',
  communityStat: '36K+ MEMBERS',
  tokenSymbol: 'FPG',
  tokenName: 'fortuneprotocol.pro',
  tokenRewardAmount: '100',
  logoPath: '/fortune-logo.png',
  iconPath: '/logo.png',
  telegramUrl: 'https://t.me/fortuneprotocol',
  twitterUrl: 'https://twitter.com/fortuneprotocol',
  youtubeUrl: 'https://youtube.com',
  discordUrl: 'https://discord.gg',
  instagramUrl: 'https://instagram.com',
};
