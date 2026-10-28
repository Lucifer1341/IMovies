import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'default', className = '' }) => {
  const isLarge = size === 'large';
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Ticket + Play original Brand Icon */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-cinema-red to-[#99060e] rounded-xl shadow-cinema-glow transition-transform duration-300 group-hover:scale-105 ${isLarge ? 'w-12 h-12' : 'w-9 h-9'}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${isLarge ? 'w-7 h-7' : 'w-5 h-5'} text-white`}
        >
          {/* Ticket Body with perforated notch */}
          <path
            d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V9.5C18.8954 9.5 18 10.3954 18 11.5C18 12.6046 18.8954 13.5 20 13.5V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14.5C5.10457 14.5 6 13.6046 6 12.5C6 11.3954 5.10457 10.5 4 10.5V6Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Centered Play Symbol */}
          <polygon
            points="10,9 15,12 10,15"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-black tracking-wider leading-none text-white ${isLarge ? 'text-2xl' : 'text-xl'}`}>
          I<span className="text-cinema-red">MOVIES</span>
        </span>
        <span className="text-[9px] uppercase tracking-widest text-text-secondary font-medium mt-0.5">
          Cinematic Booking
        </span>
      </div>
    </Link>
  );
};
