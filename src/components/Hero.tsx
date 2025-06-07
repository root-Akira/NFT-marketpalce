import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { CircleDollarSign, Layers, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-900/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                Discover, Collect & Sell
              </span>
              <br />
              Extraordinary NFTs
            </h1>            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              The underground hub for rare and exclusive digital assets. Trade, collect, and discover the finest NFTs in the shadow marketplace.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="btn btn-primary text-base px-6 py-3"
                >
                  Connect Wallet
                </button>
              ) : (
                <Link to="/create" className="btn btn-primary text-base px-6 py-3">
                  Create NFT
                </Link>
              )}
              
              <Link to="/" className="btn btn-secondary text-base px-6 py-3 flex items-center">
                Explore <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              <div className="glass rounded-lg p-4">
                <CircleDollarSign className="w-8 h-8 text-accent-400 mb-2" />
                <h3 className="font-semibold mb-1">Secure Transactions</h3>
                <p className="text-sm text-gray-400">Buy and sell with confidence</p>
              </div>
              
              <div className="glass rounded-lg p-4">
                <Layers className="w-8 h-8 text-primary-400 mb-2" />
                <h3 className="font-semibold mb-1">Create & Collect</h3>
                <p className="text-sm text-gray-400">Mint and own digital assets</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
            
            <div className="relative grid grid-cols-2 gap-4 fade-in">
              <div className="space-y-4">
                <div className="card p-2 animate-float" style={{ animationDelay: '0.1s' }}>
                  <img
                    src="https://images.pexels.com/photos/2911545/pexels-photo-2911545.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                    alt="NFT 1"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="card p-2 animate-float" style={{ animationDelay: '0.6s' }}>
                  <img
                    src="https://images.pexels.com/photos/4300391/pexels-photo-4300391.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                    alt="NFT 3"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="card p-2 animate-float" style={{ animationDelay: '0.3s' }}>
                  <img
                    src="https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                    alt="NFT 2"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <div className="card p-2 animate-float" style={{ animationDelay: '0.9s' }}>
                  <img
                    src="https://images.pexels.com/photos/4395950/pexels-photo-4395950.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                    alt="NFT 4"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;