import React from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <nav className="sidebar bg-gray-800 text-white p-4">
        <ul>
          <li className="mb-2">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          {/* Add more navigation items as needed */}
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
