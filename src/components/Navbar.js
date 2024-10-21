import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">HTK Staking</div>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">HOME</Link>
          <Link to="/airdrops" className="text-white hover:text-gray-200">AIRDROPS</Link>
          <Link to="/stake" className="text-white hover:text-gray-200">STAKE</Link>
          <Link to="/about" className="text-white hover:text-gray-200">ABOUT US</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;