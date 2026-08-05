import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    min-height: 100vh;
    background: #0a0e1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .home-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,168,90,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,168,90,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .home-bg-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,168,90,0.08) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .home-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .home-badge {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c8a85a;
    margin-bottom: 18px;
    border: 1px solid rgba(200,168,90,0.3);
    padding: 6px 18px;
    border-radius: 20px;
    background: rgba(200,168,90,0.05);
  }

  .home-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 6vw, 72px);
    font-weight: 900;
    color: #f0ece0;
    text-align: center;
    line-height: 1.1;
    margin-bottom: 14px;
    letter-spacing: -1px;
  }

  .home-title span {
    color: #c8a85a;
  }

  .home-subtitle {
    font-size: 17px;
    color: rgba(240,236,224,0.5);
    font-weight: 300;
    margin-bottom: 50px;
    letter-spacing: 0.3px;
  }

  /* SVG ANIMATION AREA */
  .home-animation {
    margin-bottom: 52px;
    position: relative;
  }

  .voting-svg {
    width: 280px;
    height: 220px;
    overflow: visible;
    filter: drop-shadow(0 10px 40px rgba(200,168,90,0.15));
  }

  /* BOX BODY */
  .box-body {
    fill: #1a2238;
    stroke: #c8a85a;
    stroke-width: 1.5;
  }

  .box-lid {
    fill: #0f1624;
    stroke: #c8a85a;
    stroke-width: 1.5;
  }

  .box-slot {
    fill: #0a0e1a;
    stroke: #c8a85a;
    stroke-width: 1;
  }

  /* CARD */
  .ballot-card {
    fill: #f0ece0;
    stroke: #c8a85a;
    stroke-width: 1;
    rx: 3;
    animation: cardInsert 2.8s ease-in-out infinite;
    transform-origin: center top;
  }

  .ballot-lines {
    stroke: rgba(10,14,26,0.25);
    stroke-width: 1;
    stroke-linecap: round;
  }

  .ballot-check {
    fill: none;
    stroke: #c8a85a;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* HAND GROUP */
  .hand-group {
    animation: handMove 2.8s ease-in-out infinite;
    transform-origin: 140px 60px;
  }

  @keyframes handMove {
    0%   { transform: translateY(-55px); }
    35%  { transform: translateY(-55px); }
    60%  { transform: translateY(0px); }
    80%  { transform: translateY(0px); }
    100% { transform: translateY(-55px); }
  }

  @keyframes cardInsert {
    0%   { transform: translateY(0px); opacity: 1; }
    35%  { transform: translateY(0px); opacity: 1; }
    60%  { transform: translateY(28px); opacity: 0.3; }
    80%  { transform: translateY(28px); opacity: 0; }
    85%  { transform: translateY(0px); opacity: 0; }
    100% { transform: translateY(0px); opacity: 1; }
  }

  /* GLOW PULSE ON BOX */
  .box-glow {
    fill: none;
    stroke: #c8a85a;
    stroke-width: 1;
    opacity: 0;
    animation: boxGlow 2.8s ease-in-out infinite;
  }

  @keyframes boxGlow {
    0%   { opacity: 0; }
    60%  { opacity: 0; }
    70%  { opacity: 0.6; }
    85%  { opacity: 0; }
    100% { opacity: 0; }
  }

  /* STARS / PARTICLES */
  .particle {
    fill: #c8a85a;
    opacity: 0;
  }
  .particle-1 { animation: particleFly 2.8s ease-in-out infinite 0.72s; }
  .particle-2 { animation: particleFly 2.8s ease-in-out infinite 0.8s; }
  .particle-3 { animation: particleFly 2.8s ease-in-out infinite 0.65s; }

  @keyframes particleFly {
    0%   { opacity: 0; transform: translate(0, 0) scale(1); }
    70%  { opacity: 0; transform: translate(0, 0) scale(1); }
    80%  { opacity: 0.9; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(0, -18px) scale(0.3); }
  }

  /* BUTTONS */
  .home-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-primary {
    padding: 16px 38px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    color: #0a0e1a;
    text-decoration: none;
    border-radius: 8px;
    letter-spacing: 0.3px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 20px rgba(200,168,90,0.3);
    position: relative;
    overflow: hidden;
  }

  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200,168,90,0.45); }

  .btn-secondary {
    padding: 16px 38px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    background: transparent;
    color: #f0ece0;
    text-decoration: none;
    border-radius: 8px;
    letter-spacing: 0.3px;
    border: 1.5px solid rgba(240,236,224,0.2);
    transition: all 0.25s ease;
  }

  .btn-secondary:hover {
    border-color: rgba(200,168,90,0.5);
    color: #c8a85a;
    transform: translateY(-2px);
    background: rgba(200,168,90,0.05);
  }

  .home-footer {
    position: absolute;
    bottom: 28px;
    font-size: 12px;
    color: rgba(240,236,224,0.2);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
`;

function Home() {
  return (
    <>
      <style>{styles}</style>
      <div className="home-root">
        <div className="home-bg-grid" />
        <div className="home-bg-glow" />

        <div className="home-content">
          <div className="home-badge">🏛 Debremarkos University Management Election Portal</div>

          <h1 className="home-title">
            Democracy <span>Digitized</span>
          </h1>
          <p className="home-subtitle">Apply for academic positions with transparency and ease</p>

          {/* ANIMATED SVG */}
          <div className="home-animation">
            <svg className="voting-svg" viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg">
              {/* BOX */}
              <g>
                {/* Box shadow */}
                <ellipse cx="140" cy="205" rx="65" ry="8" fill="rgba(200,168,90,0.08)" />

                {/* Main box body */}
                <rect className="box-body" x="75" y="145" width="130" height="58" rx="4" />

                {/* Box decorative stripes */}
                <rect fill="rgba(200,168,90,0.06)" x="75" y="155" width="130" height="8" />
                <rect fill="rgba(200,168,90,0.04)" x="75" y="175" width="130" height="6" />

                {/* Box lid */}
                <rect className="box-lid" x="70" y="136" width="140" height="16" rx="3" />

                {/* Slot */}
                <rect className="box-slot" x="118" y="139" width="44" height="5" rx="2.5" />

                {/* Lock icon */}
                <circle cx="140" cy="165" r="8" fill="none" stroke="rgba(200,168,90,0.3)" strokeWidth="1" />
                <circle cx="140" cy="165" r="3" fill="rgba(200,168,90,0.25)" />

                {/* Box glow on insert */}
                <rect className="box-glow" x="70" y="136" width="140" height="67" rx="4" />

                {/* Particles */}
                <circle className="particle particle-1" cx="115" cy="140" r="2" />
                <circle className="particle particle-2" cx="165" cy="138" r="1.5" />
                <circle className="particle particle-3" cx="140" cy="136" r="2" />
              </g>

              {/* HAND + CARD GROUP */}
              <g className="hand-group">
                {/* BALLOT CARD */}
                <g className="ballot-card" style={{animation: 'cardInsert 2.8s ease-in-out infinite'}}>
                  <rect x="115" y="68" width="50" height="64" rx="3" fill="#f0ece0" stroke="#c8a85a" strokeWidth="1" />
                  {/* Card lines */}
                  <line className="ballot-lines" x1="122" y1="82" x2="158" y2="82" />
                  <line className="ballot-lines" x1="122" y1="90" x2="158" y2="90" />
                  <line className="ballot-lines" x1="122" y1="98" x2="145" y2="98" />
                  {/* Card checkmark */}
                  <polyline className="ballot-check" points="122,110 127,116 138,105" />
                  {/* Card header accent */}
                  <rect x="115" y="68" width="50" height="10" rx="3" fill="#c8a85a" opacity="0.9" />
                  <text x="125" y="77" fill="#0a0e1a" fontSize="5" fontWeight="600" fontFamily="DM Sans">BALLOT</text>
                </g>

                {/* HAND */}
                <g>
                  {/* Thumb */}
                  <ellipse cx="108" cy="95" rx="7" ry="14" fill="#d4a574" transform="rotate(-25 108 95)" />

                  {/* Palm */}
                  <rect x="110" y="85" width="42" height="38" rx="10" fill="#d4a574" />

                  {/* Fingers */}
                  {/* Index */}
                  <rect x="118" y="62" width="9" height="30" rx="4.5" fill="#d4a574" />
                  {/* Middle */}
                  <rect x="130" y="58" width="9" height="32" rx="4.5" fill="#d4a574" />
                  {/* Ring */}
                  <rect x="142" y="62" width="9" height="30" rx="4.5" fill="#d4a574" />
                  {/* Pinky */}
                  <rect x="153" y="68" width="7" height="24" rx="3.5" fill="#d4a574" />

                  {/* Finger knuckle lines */}
                  <line stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" x1="118" y1="79" x2="127" y2="79" />
                  <line stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" x1="130" y1="77" x2="139" y2="77" />
                  <line stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" x1="142" y1="79" x2="151" y2="79" />

                  {/* Wrist */}
                  <rect x="115" y="118" width="32" height="16" rx="4" fill="#d4a574" />
                  <rect x="119" y="122" width="4" height="8" rx="2" fill="rgba(0,0,0,0.08)" />
                  <rect x="127" y="122" width="4" height="8" rx="2" fill="rgba(0,0,0,0.08)" />
                  <rect x="135" y="122" width="4" height="8" rx="2" fill="rgba(0,0,0,0.08)" />

                  {/* Nail details */}
                  <rect x="120" y="63" width="5" height="8" rx="2.5" fill="rgba(255,255,255,0.35)" />
                  <rect x="132" y="59" width="5" height="8" rx="2.5" fill="rgba(255,255,255,0.35)" />
                  <rect x="144" y="63" width="5" height="8" rx="2.5" fill="rgba(255,255,255,0.35)" />
                  <rect x="155" y="69" width="4" height="7" rx="2" fill="rgba(255,255,255,0.35)" />
                </g>
              </g>
            </svg>
          </div>

          <div className="home-buttons">
            <Link to="/vacancies-list" className="btn-primary">
               View Available Vacancies
            </Link>
            <Link to="/winners" className="btn-secondary" style={{ borderColor: 'rgba(200,168,90,0.4)', color: '#c8a85a' }}>
              View Winners
            </Link>
            <Link to="/login" className="btn-secondary">
              Login to Portal
            </Link>
          </div>
        </div>

        <div className="home-footer">E-Voting System · Secure · Transparent · Democratic</div>
      </div>
    </>
  );
}

export default Home;