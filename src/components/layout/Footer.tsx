import React from 'react';
import { YoutubeIcon as CubeIcon, GithubIcon, TwitterIcon, LinkedinIcon } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-300 border-t border-dark-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <CubeIcon className="w-8 h-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                NFT Market
              </span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              The premier marketplace for digital collectibles and NFTs. Buy, sell, and discover exclusive digital items.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">All NFTs</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Art</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Collectibles</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Photography</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Virtual Worlds</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li><a href="/create" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Create</a></li>
              <li><a href="/my-nfts" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">My NFTs</a></li>
              <li><a href="/my-listings" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">My Listings</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Settings</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Help Center</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Platform Status</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Partners</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Blog</a></li>
              <li><a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Newsletter</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-200 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2025 NFT Market. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;