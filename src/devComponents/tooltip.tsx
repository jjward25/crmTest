"use client";

import React, { useState } from 'react';
import { InfoIcon } from 'lucide-react';

interface CustomTooltipProps {
  content: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-primary-3 hover:text-primary-4 focus:outline-none focus:ring-2 focus:ring-primary-3 rounded-full"
        aria-label="More information"
      >
        <InfoIcon className="w-5 h-5" />
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
};