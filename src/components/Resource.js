export const Resource = ({ amount, color = "black" }) => {
  if (amount === 0) return "";
  return (<svg
    id="resource"
    width="25"
    height="25"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(50,70)">
      <g transform="scale(1.00)">
        <polygon fill={color} points="43.3,25 -43.3,25 0,-50" />
      </g>
    </g>

    <g transform="translate(50,65)">
      <text
        x="0"
        y="0"
        fontSize="3.5em"
        fontWeight="bold"
        fill="white"
        dominantBaseline="central"
        textAnchor="middle"
      >
        {amount}</text>
    </g>

  </svg>)
};

export const Population = ({ amount }) => {
  if (amount === 0) return "";
  return (<svg
    id="resource"
    width="25"
    height="25"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(50,33)">
      <g transform="scale(0.87)">
        <circle stroke="black" strokeWidth="2" fill="black" cx={0} cy={-10} r={20} />
        <rect fill="black" width={60} height={60} x={-30} y={10} rx={20} />
        <rect fill="black" width={60} height={20} x={-30} y={50} rx={20} />
      </g>
    </g>

    <g transform="translate(50,65)">
      <text
        x="0"
        y="0"
        fontSize="3.5em"
        fontWeight="bold"
        fill="white"
        dominantBaseline="central"
        textAnchor="middle"
      >{amount}</text>
    </g>

  </svg>);
}