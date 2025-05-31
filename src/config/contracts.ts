// Contract Addresses
export const NFT_CONTRACT_ADDRESS = '0xACb5F72c5b64ad331dA17d4e73e379289dC09e5A';
export const MARKETPLACE_CONTRACT_ADDRESS = '0x0FcC28Af36D4528465eb4653Da8F7821D633f84D';

// Expected Network
export const EXPECTED_CHAIN_ID = 11155111; // Sepolia testnet
export const NETWORK_NAME = 'Sepolia';

// IPFS Configuration
export const IPFS_CONFIG = {
  projectId: import.meta.env.VITE_IPFS_PROJECT_ID || 'a9611eb10d25691b424f',
  apiKeySecret: import.meta.env.VITE_IPFS_API_KEY_SECRET || 'cd468b736c0f239c9dfaf57f7880142a59a9dbbde561f29218017463185cde81',
  dedicated: true
};