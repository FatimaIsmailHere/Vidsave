import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Connecting to platform and extracting media information...',
}) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-violet-600/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 border border-violet-500/40 flex items-center justify-center shadow-lg shadow-violet-900/30">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-500 text-black">
          <Sparkles className="w-3 h-3 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Analyzing Media URL</h3>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>

      {/* Shimmer progress indicator */}
      <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 w-full animate-shimmer-bar rounded-full" />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Platform Verified
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          Resolving Formats
        </span>
      </div>
    </div>
  );
};
