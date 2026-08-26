export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function sanitizeFilename(name: string): string {
  if (!name) return 'SnapVid_Media';
  const clean = name
    .replace(/[<>:"/\\|?*\x00-\x1F#%&{}\\<>*?/$!'":@+`|=]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 60);

  return clean || 'SnapVid_Media';
}
