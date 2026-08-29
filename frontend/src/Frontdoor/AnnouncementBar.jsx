import { useState } from "react";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="announce">
      <span>
        <b>Dib u dhis Soomaaliya</b>
        <span className="hidden sm:inline"> · Digital addressing summit · Nov 14 · Mogadishu</span>
      </span>
      <span className="divider">·</span>
      <span className="cta">Get invite →</span>
      <button className="close" onClick={() => setOpen(false)} aria-label="Dismiss announcement">✕</button>
    </div>
  );
}