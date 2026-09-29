export function VerifiedBadge() {
  return (
    <span
      title="Verified publisher: audience numbers reviewed by Anvara"
      className="inline-flex items-center gap-1 text-xs font-medium text-primary"
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.4 1.8 3 .1.9 2.8 2.2 2-1 2.8.6 2.9-2.5 1.6-1.2 2.7-2.9-.4L10 18.5l-2.4-1.9-2.9.4-1.2-2.7-2.5-1.6.6-2.9-1-2.8 2.2-2 .9-2.8 3-.1L10 1.5zm3.7 6.2a.75.75 0 00-1.1-1l-3.6 4-1.6-1.6a.75.75 0 10-1.1 1.1l2.2 2.1a.75.75 0 001.1 0l4.1-4.6z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}
