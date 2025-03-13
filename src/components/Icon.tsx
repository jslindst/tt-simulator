// Icon.tsx
import React from 'react';
import { UnitName } from '../model/battle.ts';
import BattleshipIcon from "./noun-battleship-44759.svg";
import AirForceIcon from "./spitfire.svg";
import SubIcon from "./noun-submarine-1189639.svg";
// ... other imports

interface IconProps {
  unitName: string;
}

const Icon: React.FC<IconProps> = ({ unitName }) => {
  let iconSrc: string | null = null;
  let scale = 1.0;

  switch (unitName) {
    case UnitName.Fleet:
      iconSrc = BattleshipIcon;
      break;
    case UnitName.AirForce:
      iconSrc = AirForceIcon;
      scale = 0.7;
      break;
    case UnitName.Sub:
      iconSrc = SubIcon;
      scale = 0.85;
      break;
    // ... other cases
    default:
      return null; // Or a placeholder icon
  }

  if (!iconSrc) return null;

  return (
    <g transform={`rotate(-45,50,50),translate(50,50),scale(${scale})`
    }>
      <image x="-50" y="-50" width="100" height="100" href={iconSrc} />
    </g>
  );
};

export default Icon;
