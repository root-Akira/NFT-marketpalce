import React, { useState, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import NFTCard from '../components/NFTCard';
import Hero from '../components/Hero';
import { Search, Loader, Filter, X, DollarSign } from 'lucide-react';
import { MarketItem } from '../types';

const Home: React.FC = () => {
  const { nfts, isLoading, buyNFT } = useNFT();
  const { account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredNfts, setFilteredNfts] = useState(nfts);

  useEffect(() => {
    let filtered = nfts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filters
    if (minPrice || maxPrice) {
      filtered = filtered.filter((nft) => {
        const price = parseFloat(nft.price);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        
        return price >= min && price <= max;
      });
    }

    setFilteredNfts(filtered);
  }, [searchTerm, minPrice, maxPrice, nfts]);

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || minPrice || maxPrice;

  const handleBuyNFT = async (nft: MarketItem) => {
    await buyNFT(nft);
  };

  return (
    <div>
      <Hero />
        <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Explore NFTs
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  className="input pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-primary-500 text-xs px-1.5 py-0.5 rounded-full">
                    {[searchTerm, minPrice, maxPrice].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Price Filters Panel */}
          {showFilters && (
            <div className="glass rounded-xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {/* Min Price */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Min Price (ETH)
                    </label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      step="0.001"
                      min="0"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Max Price (ETH)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      className="input"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      step="0.001"
                      min="0"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary flex items-center gap-2 shrink-0"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-dark-200">
                  <p className="text-sm text-gray-400 mb-2">Active filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {minPrice && (
                      <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
                        Min: {minPrice} ETH
                        <button onClick={() => setMinPrice('')} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {maxPrice && (
                      <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
                        Max: {maxPrice} ETH
                        <button onClick={() => setMaxPrice('')} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredNfts.length} of {nfts.length} NFTs
                {minPrice || maxPrice ? (
                  <span className="ml-2">
                    (Price: {minPrice || '0'}–{maxPrice || '∞'} ETH)
                  </span>
                ) : null}
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-primary-500 animate-spin" />
            </div>          ) : filteredNfts.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? "No NFTs match your current search and filter criteria."
                  : "There are no NFTs available in the marketplace yet."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">              {filteredNfts.map((nft) => (
                <NFTCard
                  key={nft.itemId}
                  nft={nft}
                  actionButton={
                    account && nft.seller.toLowerCase() !== account.toLowerCase() ? (
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => handleBuyNFT(nft)}
                        disabled={isLoading}
                      >
                        Buy for {nft.price} ETH
                      </button>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;