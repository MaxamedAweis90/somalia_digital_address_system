export default function SomaliaMap({ className = "" }) {
  return (
    <svg viewBox="0 0 300 320" className={`w-full h-full ${className}`}>
      <defs>
        <radialGradient id="glowpin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6C453" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F6C453" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>

      <path
        d="M95 18 C120 14 140 26 150 40 C162 34 176 34 186 44 C200 40 214 48 214 62 C226 66 236 78 232 92 C244 100 250 116 240 128 C248 146 244 168 228 180 C232 198 224 216 208 224 C210 240 200 254 184 258 C182 274 168 286 150 286 C146 300 132 310 116 306 C100 312 84 304 80 288 C64 288 52 276 52 260 C40 254 34 240 40 226 C28 216 26 198 36 184 C28 170 30 152 44 140 C40 124 48 108 64 100 C62 84 72 68 90 62 C86 46 90 28 95 18 Z"
        fill="#0f2e4e"
        stroke="#3E7FD1"
        strokeWidth="1.5"
      />
      <rect x="0" y="0" width="300" height="320" fill="url(#grid)" />

      {/* Mogadishu pin */}
      <circle cx="150" cy="160" r="5.5" fill="url(#glowpin)" />
      <circle cx="150" cy="160" r="4" fill="#F6C453" stroke="#0A1F35" strokeWidth="1.5" />

      {/* Secondary city markers */}
      <circle cx="105" cy="120" r="2.5" fill="#8FC7FF" opacity="0.8" />
      <circle cx="175" cy="200" r="2.5" fill="#8FC7FF" opacity="0.6" />
      <circle cx="130" cy="230" r="2.5" fill="#8FC7FF" opacity="0.6" />
    </svg>
  );
}