
import React from 'react';

interface SourcePillProps {
  source: string;
}

const SourcePill: React.FC<SourcePillProps> = ({ source }) => {
  return (
    <div className="bg-gray-700 text-cyan-300 text-xs font-mono px-3 py-1 rounded-full whitespace-nowrap">
      {source}
    </div>
  );
};

export default SourcePill;
