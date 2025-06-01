import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { Wallet, Menu, X, YoutubeIcon as CubeIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { account, balance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Explore', path: '/' },
    { name: 'Create', path: '/create' },
    { name: 'My NFTs', path: '/my-nfts' },
  ];

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-300 shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <CubeIcon className="w-8 h-8 text-primary-500" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
              NFT Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-200 hover:text-primary-400 ${
                  location.pathname === link.path
                    ? 'text-primary-500'
                    : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            {account ? (
              <div className="flex items-center">
                <div className="glass rounded-lg px-3 py-1 mr-3">
                  <span className="text-sm font-medium">{balance.substring(0, 6)} ETH</span>
                </div>
                <div className="relative group">
                  <button className="btn btn-primary flex items-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    {shortenAddress(account)}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-200 ring-1 ring-dark-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <button
                        onClick={disconnectWallet}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-100"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary flex items-center"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-primary-400 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-dark-100">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium py-2 transition-colors duration-200 hover:text-primary-400 ${
                    location.pathname === link.path
                      ? 'text-primary-500'
                      : 'text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-dark-100">
              {account ? (
                <div className="flex flex-col space-y-3">
                  <div className="glass rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">{balance.substring(0, 6)} ETH</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="btn btn-primary">
                      <span className="flex items-center">
                        <Wallet className="w-4 h-4 mr-2" />
                        {shortenAddress(account)}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="mt-2 btn btn-secondary"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary w-full flex items-center justify-center"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;