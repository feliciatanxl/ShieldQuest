import type { DistrictId } from '../../../types';

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="9" rx="18" ry="7" fill="#36775a" opacity=".18" />
      <path d="M0 5V-20" stroke="#956e46" strokeWidth="7" />
      <path d="M-20-18C-25-36-13-54 0-56C18-55 26-36 19-20C10-9-12-8-20-18" fill="#448b62" />
      <path d="M-16-23C-19-40-7-54 1-54C4-36 0-24-16-23" fill="#64a979" />
    </g>
  );
}

function Building({
  x,
  y,
  type,
  color,
}: {
  x: number;
  y: number;
  type: 'school' | 'shop' | 'tower';
  color: string;
}) {
  const height = type === 'tower' ? 116 : 67;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="10" rx="73" ry="23" fill="#285b42" opacity=".15" />
      <polygon points={`-58,0 0,28 0,${28 - height} -58,${-height}`} fill={color} />
      <polygon
        points={`0,28 57,0 57,${-height} 0,${28 - height}`}
        fill={type === 'tower' ? '#8983bb' : '#e6c9a1'}
      />
      <polygon
        points={`-64,${-height} 0,${32 - height} 63,${-height} 0,${-height - 31}`}
        fill={type === 'tower' ? '#b3c4f3' : type === 'school' ? '#d87d5d' : '#ecaa61'}
      />
      {type !== 'tower' && (
        <polygon
          points={`-64,${-height} 0,${-height - 46} 63,${-height} 0,${-height - 23}`}
          fill={type === 'school' ? '#f19973' : '#ffd78e'}
        />
      )}
      {[0, 1, ...(type === 'tower' ? [2, 3] : [])].map((row) => (
        <g key={row} transform={`translate(0 ${-row * 23})`}>
          <path d="M-45-37l12 6v15l-12-6z M-23-26l12 6v15l-12-6z" fill="#f5eac9" />
          <path d="M12-20l12-6v15l-12 6z M34-31l12-6v15l-12 6z" fill="#f9efd0" />
        </g>
      ))}
      {type === 'school' && (
        <>
          <path d="M-9 23V-1Q0-17 9-1V23" fill="#52777a" />
          <path d="M0-110v-26l24 8-24 8" fill="#fff0b7" stroke="#6d7863" strokeWidth="2" />
        </>
      )}
      {type === 'shop' && (
        <>
          <path d="M-60-36L0-7V7l-60-29z" fill="#fff4d3" />
          <path d="M-48-30l12 6v14l-12-6z M-24-18l12 6v14l-12-6z" fill="#e6816d" />
        </>
      )}
      {type === 'tower' && (
        <>
          <path d="M0-147v-19" stroke="#676b9c" strokeWidth="4" />
          <circle cy="-171" r="7" fill="#f6d476" />
          <path d="M-16-121l16-9 16 9-16 9z" fill="#e5e5ff" />
        </>
      )}
    </g>
  );
}

const positions = [
  { x: 294, y: 260 },
  { x: 570, y: 348 },
  { x: 465, y: 178 },
];
export function CityBoard({
  selected,
  onSelect,
}: {
  selected: DistrictId;
  onSelect: (id: DistrictId) => void;
}) {
  const ids: DistrictId[] = ['school', 'retail', 'digital'];
  const names = ['School Street', 'Retail District', 'Digi-District'];
  return (
    <div className="city-map">
      <div className="map-caption">
        <span className="live-dot" /> CITY BOARD <span>01</span>
      </div>
      <svg viewBox="0 0 820 530" role="img" aria-labelledby="board-title board-desc">
        <title id="board-title">Your ShieldQuest city board</title>
        <desc id="board-desc">
          An isometric island with a school, shops and a digital tower. Choose a district using the
          map buttons or the cards below.
        </desc>
        <defs>
          <linearGradient id="island" x2="0" y2="1">
            <stop stopColor="#c3d7a2" />
            <stop offset="1" stopColor="#a4c58b" />
          </linearGradient>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#73926b" opacity=".16" />
          </pattern>
        </defs>
        <ellipse cx="413" cy="411" rx="329" ry="86" fill="#cbd5bd" opacity=".4" />
        <path
          d="M67 282L371 107Q396 93 421 107L754 299V331Q754 347 738 355L438 510Q416 521 395 509L83 330Q67 321 67 307Z"
          fill="#88a977"
        />
        <path
          d="M83 260L378 92Q397 81 419 94L739 276Q764 290 741 307L438 480Q417 492 394 479L83 302Q53 283 83 260"
          fill="url(#island)"
          stroke="#e1e9c9"
          strokeWidth="5"
        />
        <path
          d="M83 260L378 92Q397 81 419 94L739 276Q764 290 741 307L438 480Q417 492 394 479L83 302Q53 283 83 260"
          fill="url(#dots)"
        />
        <path
          d="M171 283L393 154L659 306L425 437Z"
          fill="none"
          stroke="#849f78"
          strokeWidth="41"
          strokeLinejoin="round"
          opacity=".35"
          transform="translate(0 5)"
        />
        <path
          d="M171 277L393 148L659 300L425 431Z"
          fill="none"
          stroke="#fcf8e8"
          strokeWidth="36"
          strokeLinejoin="round"
        />
        <path
          d="M171 277L393 148L659 300L425 431Z"
          fill="none"
          stroke="#c4c9af"
          strokeWidth="27"
          strokeDasharray="2 30"
          strokeLinejoin="round"
        />
        <path d="M222 269L298 225L369 266L293 310Z" fill="#8fb580" />
        <path d="M491 284L567 242L637 282L561 326Z" fill="#8fb580" />
        <path d="M378 203L456 158L521 195L443 240Z" fill="#8fb580" />
        <path d="M329 348l65-37 70 40-65 36z" fill="#83b9b1" stroke="#c7dcc0" strokeWidth="7" />
        <path
          d="M352 348l25-14m14 31 27-15"
          stroke="#b0d6ca"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Building x={451} y={205} type="tower" color="#a5a4d6" />
        <Tree x={351} y={173} scale={0.73} />
        <Tree x={570} y={232} scale={0.85} />
        <Building x={293} y={268} type="school" color="#f5d399" />
        <Building x={570} y={325} type="shop" color="#f5bc91" />
        <Tree x={171} y={234} />
        <Tree x={230} y={343} scale={0.8} />
        <Tree x={314} y={407} />
        <Tree x={654} y={357} scale={0.9} />
        <Tree x={524} y={418} scale={0.75} />
        <Tree x={675} y={263} scale={0.66} />
        <g transform="translate(185 304)">
          <ellipse cy="8" rx="16" ry="7" fill="#557e5c" opacity=".3" />
          <path d="M-13 0q0-27 13-27T13 0z" fill="#326850" />
          <circle cy="-30" r="12" fill="#f8d7a5" />
          <path d="M-14-32l3-17 11 10 11-10 3 17" fill="#e7a14f" />
          <path d="M-5-29h1m8 0h1" stroke="#354d43" strokeWidth="3" strokeLinecap="round" />
          <path d="M-4-7l4-5 4 5-4 6z" fill="#f6d274" />
        </g>
        <g fill="#f4edb7">
          <path d="M120 280l4-8 4 8-4 8z" />
          <path d="M491 450l4-8 4 8-4 8z" />
          <path d="M704 300l4-8 4 8-4 8z" />
        </g>
      </svg>
      {positions.map((point, index) => (
        <button
          key={ids[index]}
          className={`map-label ${selected === ids[index] ? 'selected' : ''}`}
          style={{ left: `${(point.x / 820) * 100}%`, top: `${(point.y / 530) * 100}%` }}
          onClick={() => onSelect(ids[index])}
          aria-pressed={selected === ids[index]}
        >
          <span>{index + 1}</span>
          {names[index]}
        </button>
      ))}
      <div className="map-footnote">
        <span className="token-dot" /> You’re here <span>Choose a district to explore</span>
      </div>
    </div>
  );
}
