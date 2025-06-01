import { ethers } from 'ethers';

async function main() {
    const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');
    
    const nftAddress = '0xACb5F72c5b64ad331dA17d4e73e379289dC09e5A';
    const marketplaceAddress = '0x0FcC28Af36D4528465eb4653Da8F7821D633f84D';
    
    console.log('Checking NFT contract...');
    const nftCode = await provider.getCode(nftAddress);
    console.log('NFT contract exists:', nftCode !== '0x');
    
    console.log('Checking Marketplace contract...');
    const marketplaceCode = await provider.getCode(marketplaceAddress);
    console.log('Marketplace contract exists:', marketplaceCode !== '0x');
}

main().catch(console.error);
