export function Heart({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export function LikeButton({ liked, count, onClick, className = "" }: {
  liked: boolean; count: number; onClick: () => void; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-pressed={liked}
      aria-label={liked ? `Unlike (${count} likes)` : `Like (${count} likes)`}
      className={`flex min-h-9 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[13px] font-semibold backdrop-blur transition-colors ${liked ? "text-heart" : "text-paper hover:text-white"} ${className}`}
    >
      <Heart filled={liked} />
      {count}
    </button>
  );
}
