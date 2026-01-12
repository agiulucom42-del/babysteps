
import React from 'react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.75V6.25m0 11.5v1.5M17.25 6.75l-1.06 1.06M7.81 16.19l-1.06 1.06M6.75 17.25l-1.06-1.06M16.19 7.81l1.06-1.06M6.25 12H4.75m14.5 0h-1.5"
      />
    </svg>
  );
};

export default Spinner;
