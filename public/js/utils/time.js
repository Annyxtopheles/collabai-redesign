// Relative time utility matching Figma screenshot: 2m, 1h, 5h, 2d, 1w, Yrs
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'now';
  const now = Date.now();
  const diffMs = now - Number(timestamp);
  
  if (diffMs < 0) return 'now';
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffYear = Math.floor(diffDay / 365);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 52) return `${diffWeek}w`;
  return 'Yrs';
}
