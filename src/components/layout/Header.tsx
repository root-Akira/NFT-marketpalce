import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { useUser } from '../../context/UserContext';
import { Wallet, Menu, X, User, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  const { account, balance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { userProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
  }, []);  const navLinks = [
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
        <div className="flex items-center justify-between h-16">          {/* Logo */}          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background with gradient */}
                <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
                
                {/* Diamond/gem shape for rare assets */}
                <path d="M16 6L22 12L16 24L10 12L16 6Z" fill="white" opacity="0.9"/>
                <path d="M16 6L22 12H10L16 6Z" fill="white" opacity="0.7"/>
                <path d="M16 12L22 12L16 24V12Z" fill="white" opacity="0.5"/>
                <path d="M16 12L10 12L16 24V12Z" fill="white" opacity="0.6"/>
                
                {/* Inner highlight */}
                <path d="M16 8L20 12H12L16 8Z" fill="white" opacity="0.3"/>
                
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: "#000000", stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: "#1a1a1a", stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: "#000000", stopOpacity: 1}} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
              BlackMarket
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
          </nav>          {/* Connect Wallet Button */}
          <div className="hidden md:block">            {account ? (
              <div className="flex items-center gap-3">
                {/* Balance */}
                <div className="glass rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">{balance.substring(0, 6)} ETH</span>
                </div>

                {/* User Profile Menu */}
                <div className="relative group">
                  <button 
                    className="btn btn-primary flex items-center"
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {userProfile?.username || shortenAddress(account)}
                  </button>
                  
                  <div 
                    className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dark-200 ring-1 ring-dark-100 transition-all duration-200 ${
                      showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-nfts"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-100"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        My Collection
                      </Link>
                      <div className="border-t border-dark-100 my-1"></div>
                      <button
                        onClick={disconnectWallet}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-100"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
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
          </div>        </div>
      )}
    </header>
  );
};

export default Header;