'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
}

/**
 * Global promise chain that ensures Adsterra banner ads load one at a time.
 * Without this, multiple banners on the same page overwrite window.atOptions
 * simultaneously, causing invoke.js to read the wrong config.
 */
let adLoadQueue = Promise.resolve();

function enqueueAdLoad(
  adKey: string,
  width: number,
  height: number,
  container: HTMLElement
): Promise<void> {
  const task = new Promise<void>((resolve) => {
    // Set the atOptions config for this specific ad
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).atOptions = {
      key: adKey,
      format: 'iframe',
      height,
      width,
      params: {},
    };

    // Create invoke script — NOT async, so it reads atOptions synchronously
    const script = document.createElement('script');
    script.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // Don't block the queue on error
    container.appendChild(script);
  });

  return task;
}

/**
 * Safely injects an Adsterra banner ad into a container div.
 * Uses a sequential queue to prevent atOptions conflicts when
 * multiple banner ads are on the same page.
 */
export const AdsterraAd: React.FC<AdsterraAdProps> = ({ adKey, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !adKey) return;

    const container = containerRef.current;

    // Clear any previous content
    container.innerHTML = '';

    // Queue this ad to load after any previously queued ads finish
    const loadPromise = adLoadQueue.then(() =>
      enqueueAdLoad(adKey, width, height, container)
    );

    // Update the global queue (fire-and-forget)
    adLoadQueue = loadPromise.catch(() => {});

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="flex items-center justify-center overflow-hidden"
    />
  );
};
