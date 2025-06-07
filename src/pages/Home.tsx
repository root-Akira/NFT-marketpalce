import React, { useState, useEffect } from 'react';
import { useNFT } from '../context/NFTContext';
import { useWeb3 } from '../context/Web3Context';
import NFTCard from '../components/NFTCard';
import Hero from '../components/Hero';
import { Search, Loader } from 'lucide-react';
import { MarketItem } from '../types';

const Home: React.FC = () => {
  const { nfts, isLoading, buyNFT } = useNFT();
  const { account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNfts, setFilteredNfts] = useState(nfts);

  useEffect(() => {
    if (searchTerm) {
      const filtered = nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNfts(filtered);
    } else {
      setFilteredNfts(nfts);
    }
  }, [searchTerm, nfts]);

  const handleBuyNFT = async (nft: MarketItem) => {
    await buyNFT(nft);
  };

  return (
    <div>
      <Hero />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Explore NFTs
            </h2>
            
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
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
          ) : filteredNfts.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-gray-400">
                {searchTerm
                  ? "No NFTs match your search criteria."
                  : "There are no NFTs available in the marketplace yet."}
              </p>
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