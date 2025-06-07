# BlackMarket

The underground hub for rare and exclusive digital assets. A decentralized NFT marketplace built with React, TypeScript, and Ethereum smart contracts.

## Features

- Create and mint NFTs
- List NFTs for sale
- Buy NFTs
- View owned NFTs
- View listed NFTs
- Connect with MetaMask wallet
- IPFS integration for NFT storage

## Tech Stack

- React
- TypeScript
- Ethers.js
- IPFS/Pinata
- Tailwind CSS
- Vite

## Smart Contracts (Sepolia Testnet)

- NFT Contract: `0xACb5F72c5b64ad331dA17d4e73e379289dC09e5A`
- Marketplace Contract: `0x0FcC28Af36D4528465eb4653Da8F7821D633f84D`

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration:
   ```
   VITE_NFT_CONTRACT_ADDRESS=your_nft_contract_address
   VITE_MARKETPLACE_CONTRACT_ADDRESS=your_marketplace_contract_address
   VITE_IPFS_PROJECT_ID=your_ipfs_project_id
   VITE_IPFS_API_KEY_SECRET=your_ipfs_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Connect your MetaMask wallet (Sepolia testnet)
2. Create NFTs by uploading images and metadata
3. List your NFTs for sale
4. Browse and purchase NFTs from other users

## License

MIT
