import React, { useState, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import NFTCard from '../components/NFTCard';
import Hero from '../components/Hero';
import { Search, Loader, Filter, X, DollarSign, ArrowUpDown, TrendingUp, Clock, Tag, Grid } from 'lucide-react';
import { MarketItem, NFTCategory } from '../types';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-az' | 'name-za';

const Home: React.FC = () => {
  const { nfts, isLoading, buyNFT } = useNFT();
  const { account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NFTCategory | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filteredNfts, setFilteredNfts] = useState(nfts);

  const categories: (NFTCategory | 'All')[] = [
    'All', 'Art', 'Gaming', 'Music', 'Photography', 'Collectibles', 'Sports', 'Utility', 'Other'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'oldest', label: 'Oldest First', icon: Clock },
    { value: 'price-low', label: 'Price: Low to High', icon: TrendingUp },
    { value: 'price-high', label: 'Price: High to Low', icon: TrendingUp },
    { value: 'name-az', label: 'Name: A-Z', icon: Tag },
    { value: 'name-za', label: 'Name: Z-A', icon: Tag },
  ];

  const sortNFTs = (nfts: MarketItem[], sortOption: SortOption): MarketItem[] => {
    const sorted = [...nfts];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => (b.listingTime || 0) - (a.listingTime || 0));
      case 'oldest':
        return sorted.sort((a, b) => (a.listingTime || 0) - (b.listingTime || 0));
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name-az':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-za':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };
  useEffect(() => {
    let filtered = nfts;    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nft.creator && nft.creator.toLowerCase().includes(searchTerm.toLowerCase())) ||
          nft.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nft.categories && nft.categories.some(cat => 
            cat.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }// Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((nft) => 
        nft.categories && nft.categories.includes(selectedCategory as NFTCategory)
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

    // Apply sorting
    filtered = sortNFTs(filtered, sortBy);

    setFilteredNfts(filtered);
  }, [searchTerm, minPrice, maxPrice, selectedCategory, sortBy, nfts]);
  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('All');
    setSortBy('newest');
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || minPrice || maxPrice || selectedCategory !== 'All' || sortBy !== 'newest';

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

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input pr-10 appearance-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              >
                <Filter className="w-4 h-4" />
                Filters                {hasActiveFilters && (
                  <span className="bg-white text-primary-500 text-xs px-1.5 py-0.5 rounded-full">
                    {[searchTerm, minPrice, maxPrice, selectedCategory !== 'All', sortBy !== 'newest'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Grid className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Categories</span>
            </div>            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {category}                  {category !== 'All' && (
                    <span className="ml-1 sm:ml-2 text-xs opacity-75">
                      ({nfts.filter(nft => nft.categories && nft.categories.includes(category as NFTCategory)).length})
                    </span>
                  )}
                </button>
              ))}
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
              </div>              {/* Active Filters Summary */}
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
                    {sortBy !== 'newest' && (
                      <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
                        Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                        <button onClick={() => setSortBy('newest')} className="hover:text-red-400">
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