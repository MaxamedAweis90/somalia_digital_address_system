import { useState } from "react";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="announce">
     <span>
        <b>National Digital Addressing System</b>
        <span className="hidden sm:inline"> · Official Government Addressing Framework · Mogadishu</span>
      </span>
      <span className="divider">·</span>
      <span className="cta">Get invite →</span>
      <button className="close" onClick={() => setOpen(false)} aria-label="Dismiss announcement">✕</button>
    </div>
  );
}