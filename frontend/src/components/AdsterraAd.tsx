'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
}

/**
 * Safely injects an Adsterra banner ad into a container div.
 * Uses a unique ID per instance to avoid atOptions conflicts when
 * multiple banner ads are on the same page.
 */
export const AdsterraAd: React.FC<AdsterraAdProps> = ({ adKey, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptId = `adsterra-${adKey.slice(0, 8)}`;

  useEffect(() => {
    if (!containerRef.current || !adKey) return;

    const container = containerRef.current;

    // Clear any previous content
    container.innerHTML = '';

    // Create the atOptions script
    const optionsScript = document.createElement('script');
    optionsScript.textContent = `
      window['atOptions_${scriptId}'] = {
        'key': '${adKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
      window.atOptions = window['atOptions_${scriptId}'];
    `;
    container.appendChild(optionsScript);

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;
    invokeScript.async = true;
    container.appendChild(invokeScript);

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[`atOptions_${scriptId}`];
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [adKey, width, height, scriptId]);

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="flex items-center justify-center overflow-hidden"
    />
  );
};
