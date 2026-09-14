// A single deliberate hero moment: a hand-drawn-style route connecting
// four real Atlasmiles destinations, drawn once on page load.
// This is intentionally the one animated flourish on the page — everything
// else stays quiet, per the "spend your boldness in one place" principle.

export default function RouteMap() {
  return (
    <svg
      className="route-map"
      viewBox="0 0 420 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustrated route connecting Goa, Manali, Kerala, and Rajasthan"
    >
      <path
        className="route-path"
        d="M60,290 C110,250 90,180 150,150 C210,120 230,190 290,150 C330,120 300,60 360,50"
        fill="none"
        stroke="#B8862F"
        strokeWidth="2.5"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />

      <g className="route-stop" style={{ animationDelay: "0.9s" }}>
        <circle cx="60" cy="290" r="7" fill="#2F6F62" />
        <text x="74" y="294" className="route-label">Goa</text>
      </g>
      <g className="route-stop" style={{ animationDelay: "1.2s" }}>
        <circle cx="150" cy="150" r="7" fill="#2F6F62" />
        <text x="164" y="154" className="route-label">Kerala</text>
      </g>
      <g className="route-stop" style={{ animationDelay: "1.5s" }}>
        <circle cx="290" cy="150" r="7" fill="#2F6F62" />
        <text x="304" y="154" className="route-label">Rajasthan</text>
      </g>
      <g className="route-stop" style={{ animationDelay: "1.8s" }}>
        <circle cx="360" cy="50" r="7" fill="#B8862F" />
        <text x="330" y="35" className="route-label">Manali</text>
      </g>
    </svg>
  );
}
