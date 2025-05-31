// This is a simplified ABI. You should replace this with your actual ABI
const MARKETPLACE_ABI = [
  // Market item functions
  "function createMarketItem(address nftContract, uint256 tokenId, uint256 price)",
  "function createMarketSale(address nftContract, uint256 itemId) payable",
  "function cancelMarketItem(address nftContract, uint256 itemId)",
  
  // Fetch functions
  "function fetchMarketItems() view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
  "function fetchMyNFTs() view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
  "function fetchItemsCreated() view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address payable seller, address payable owner, uint256 price, bool sold)[])",
  
  // Events
  "event MarketItemCreated(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold)",
  "event MarketItemSold(uint256 indexed itemId, address owner)"
];

export default MARKETPLACE_ABI;