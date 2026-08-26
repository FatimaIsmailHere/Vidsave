import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-md p-4 sm:p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-red-200">Unable to Process Media</h4>
          <p className="text-xs sm:text-sm text-red-300/80 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold border border-red-500/40 flex items-center gap-1.5 shrink-0 transition-colors self-end sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
