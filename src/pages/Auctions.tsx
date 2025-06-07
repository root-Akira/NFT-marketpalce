import React, { useState, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import AuctionCard from '../components/AuctionCard';
import { AuctionData } from '../types';
import { Gavel, Clock, TrendingUp, Search, Loader } from 'lucide-react';

type AuctionFilter = 'all' | 'active' | 'ending-soon' | 'my-bids' | 'my-auctions';

const Auctions: React.FC = () => {
  const { nfts } = useNFT();
  const { account } = useWeb3();
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AuctionFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ending-soon' | 'highest-bid' | 'newest'>('ending-soon');

  // Mock auction data - in a real app, this would come from your smart contracts
  useEffect(() => {
    const generateMockAuctions = () => {
      const mockAuctions: AuctionData[] = nfts.slice(0, 8).map((nft, index) => {
        const startTime = Date.now() - (index * 3600000); // Staggered start times
        const duration = (24 + index * 12) * 3600000; // 24-96 hours
        const currentBid = (parseFloat(nft.price) * (1 + Math.random() * 0.5)).toFixed(3);
        const totalBids = Math.floor(Math.random() * 20) + 1;
        
        return {
          nftId: nft.tokenId,
          seller: nft.seller,
          startingPrice: (parseFloat(nft.price) * 0.8).toFixed(3),
          reservePrice: Math.random() > 0.3 ? (parseFloat(nft.price) * 1.2).toFixed(3) : undefined,
          currentBid,
          currentBidder: totalBids > 0 ? `0x${Math.random().toString(16).substring(2, 42)}` : '0x0000000000000000000000000000000000000000',
          startTime,
          endTime: startTime + duration,
          isActive: true,
          totalBids,
          bidHistory: Array.from({ length: totalBids }, (_, i) => ({
            bidder: `0x${Math.random().toString(16).substring(2, 42)}`,
            amount: (parseFloat(currentBid) * (0.7 + (i / totalBids) * 0.3)).toFixed(3),
            timestamp: startTime + (i * (duration / totalBids))
          }))
        };
      });

      setAuctions(mockAuctions);
      setIsLoading(false);
    };

    if (nfts.length > 0) {
      generateMockAuctions();
    }
  }, [nfts]);

  useEffect(() => {
    let filtered = [...auctions];

    // Apply search filter
    if (searchTerm) {
      const searchNFTs = nfts.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filtered = filtered.filter(auction => 
        searchNFTs.some(nft => nft.tokenId === auction.nftId)
      );
    }

    // Apply auction filter
    const now = Date.now();
    switch (filter) {
      case 'active':
        filtered = filtered.filter(auction => 
          auction.isActive && now >= auction.startTime && now < auction.endTime
        );
        break;
      case 'ending-soon':
        filtered = filtered.filter(auction => 
          auction.isActive && now < auction.endTime && (auction.endTime - now) < 3600000 // Less than 1 hour
        );
        break;
      case 'my-bids':
        if (account) {
          filtered = filtered.filter(auction => 
            auction.currentBidder.toLowerCase() === account.toLowerCase()
          );
        } else {
          filtered = [];
        }
        break;
      case 'my-auctions':
        if (account) {
          filtered = filtered.filter(auction => 
            auction.seller.toLowerCase() === account.toLowerCase()
          );
        } else {
          filtered = [];
        }
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'ending-soon':
        filtered.sort((a, b) => a.endTime - b.endTime);
        break;
      case 'highest-bid':
        filtered.sort((a, b) => parseFloat(b.currentBid) - parseFloat(a.currentBid));
        break;
      case 'newest':
        filtered.sort((a, b) => b.startTime - a.startTime);
        break;
    }

    setFilteredAuctions(filtered);
  }, [auctions, filter, searchTerm, sortBy, account]);

  const handleBid = async (auctionId: number, amount: string) => {
    // Mock bid placement - in a real app, this would interact with smart contracts
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          setAuctions(prev => prev.map(auction => 
            auction.nftId === auctionId 
              ? {
                  ...auction,
                  currentBid: amount,
                  currentBidder: account || '0x0000000000000000000000000000000000000000',
                  totalBids: auction.totalBids + 1,
                  bidHistory: [
                    ...auction.bidHistory,
                    {
                      bidder: account || '0x0000000000000000000000000000000000000000',
                      amount,
                      timestamp: Date.now()
                    }
                  ]
                }
              : auction
          ));
          resolve();
        } else {
          reject(new Error('Transaction failed'));
        }    }, 2000);
    });
  };

  const getFilterCounts = () => {
    const now = Date.now();
    return {
      all: auctions.length,
      active: auctions.filter(a => a.isActive && now >= a.startTime && now < a.endTime).length,
      'ending-soon': auctions.filter(a => a.isActive && now < a.endTime && (a.endTime - now) < 3600000).length,
      'my-bids': account ? auctions.filter(a => a.currentBidder.toLowerCase() === account.toLowerCase()).length : 0,
      'my-auctions': account ? auctions.filter(a => a.seller.toLowerCase() === account.toLowerCase()).length : 0,
    };
  };

  const filterCounts = getFilterCounts();

  const filters: Array<{ key: AuctionFilter; label: string; icon?: React.ReactNode }> = [
    { key: 'all', label: 'All Auctions', icon: <Gavel className="w-4 h-4" /> },
    { key: 'active', label: 'Active', icon: <Clock className="w-4 h-4" /> },
    { key: 'ending-soon', label: 'Ending Soon', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'my-bids', label: 'My Bids' },
    { key: 'my-auctions', label: 'My Auctions' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <Loader className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Gavel className="w-8 h-8 mr-3 text-primary-400" />
          NFT Auctions
        </h1>
        <p className="text-gray-400">
          Discover and bid on exclusive NFT auctions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search auctions..."
              className="input pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input w-full sm:w-auto"
          >
            <option value="ending-soon">Ending Soon</option>
            <option value="highest-bid">Highest Bid</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                filter === filterOption.key
                  ? 'bg-primary-500 text-white'
                  : 'glass hover:bg-white/20 text-gray-300 hover:text-white'
              }`}
            >
              {filterOption.icon}
              {filterOption.label}
              <span className="text-xs opacity-75">
                ({filterCounts[filterOption.key]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Gavel className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Auctions Found</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? "There are no auctions available at the moment."
              : `No auctions match the "${filters.find(f => f.key === filter)?.label}" filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => {
            const nft = nfts.find(n => n.tokenId === auction.nftId);
            if (!nft) return null;
            
            return (
              <AuctionCard
                key={auction.nftId}
                auction={auction}
                nft={nft}
                onBid={handleBid}
              />
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {filteredAuctions.length > 0 && (
        <div className="mt-12 glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Auction Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                {filteredAuctions.length}
              </div>
              <div className="text-sm text-gray-400">Total Auctions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">
                {filteredAuctions.filter(a => Date.now() < a.endTime).length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {filteredAuctions.reduce((sum, a) => sum + a.totalBids, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Bids</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.max(...filteredAuctions.map(a => parseFloat(a.currentBid))).toFixed(2)} ETH
              </div>
              <div className="text-sm text-gray-400">Highest Bid</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
