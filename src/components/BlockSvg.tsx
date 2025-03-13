import React from "react";
import { Block, unitLookup, UnitName } from "../model/battle.ts";
import BattleshipIcon from "./noun-battleship-44759.svg";
import AirForceIcon from "./spitfire.svg";
import SubIcon from "./noun-submarine-1189639.svg";
import CarrierIcon from "./noun-carrier-1201287.svg";
import FactoryIcon from "./noun-factory-997898.svg";
import AnchorIcon from "./noun-anchor-1089371.svg";
import Icon from "./Icon.tsx";

// Define interfaces for Nation and Block (adjust as needed)
interface Nation {
  color: string;
  darkTone: string;
  pipColor: string;
  edition: string;
  name: string;
  maxPips: (unitName: string) => number; // Make sure your Nation type has maxPips
}


// --- Component Definitions (Example) ---
const InfantryBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => (
  <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
    <polygon points="23,23 23,77 77,77 77,23" />
    <polygon points="23,23 77,77" />
    <polygon points="23,77 77,23" />
  </g>
));
const TankBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => (
  <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
    <polygon points="23,23 23,77 77,77 77,23" />
    <rect x="28" y="40" width="44" height="20" rx="10" />
  </g>
));
const FleetBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => {
  return <Icon unitName={UnitName.Fleet} />
});

const SubBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => {
  return <>
    <g transform={`rotate(-45,50,50),translate(50,50),scale(0.85)`}>
      <g opacity="0.4" fill="white">
        <rect x="-54" y="-12" width="108" height="24" rx="12" />
      </g>
    </g>
    <Icon unitName={UnitName.Sub} />
  </>
});

const CarrierBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => {
  return <>
    <g transform="rotate(-45,50,50)">
      <image x="0" y="0" width="100" height="100" href={CarrierIcon} />
    </g>
    <g transform="translate(68,68),scale(0.3)" opacity="0.4">
      <g transform="rotate(-45,0,0)">
        <image
          fill={blockNation.darkTone}
          x="-50"
          y="-50"
          width="100"
          height="100"
          href={AirForceIcon}
        />
      </g>
    </g>
  </>
});

const FortressBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => {
  return <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
    <polygon
      points="26.4,0 13.1,22.77 -13.1,22.77 -26.4,0 -13.1,-22.77 13.1,-22.77"
      transform="translate(50,50)"
    />
    <text
      x="50"
      y="50"
      fontSize="1.5em"
      fill="white"
      dominantBaseline="central"
      textAnchor="middle"
    >
      F
    </text>
  </g>
});

const MarineBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => (
  <g>
    <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
      {blockNation.name === "Japanese (CnC)" ? (
        <polygon
          points="26.4,0 13.1,22.77 -13.1,22.77 -26.4,0 -13.1,-22.77 13.1,-22.77"
          transform="translate(50,50)"
        />
      ) : (
        <polygon points="23,23 23,77 77,77 77,23" />
      )}
    </g>
    <g transform={`translate(50,50),scale(0.40)`}>
      <image
        fill="white"
        x="-50"
        y="-50"
        width="100"
        height="100"
        href={AnchorIcon}
      />
    </g>
  </g>
));

const MilitiaBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => (
  <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
    <polygon points="23,23 23,77 77,77 77,23" />
    <polygon points="38,38 62,62" />
    <polygon points="38,62 62,38" />
  </g>
));

const ConvoyBlock: React.FC<{ blockNation: Nation }> = React.memo(({ blockNation }) => (
  <g>
    <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
      <polygon points="23,23 23,77 77,77 77,23" />
    </g>
    <g transform="translate(50,50)">
      <g transform="rotate(-45)">
        <text
          x="0"
          y="0"
          fontSize="0.9em"
          fill="white"
          dominantBaseline="central"
          textAnchor="middle"
        >
          CONVOY
        </text>
      </g>
    </g>
  </g>
));

const IndustryBlock: React.FC<{ block: Block, blockNation: Nation }> = React.memo(({ block, blockNation }) => (
  <>
    <rect
      width="84"
      height="84"
      x="8"
      y="8"
      fill="white"
      rx="6"
      stroke="black"
      strokeWidth="4"
    />
    <text
      x="50"
      y="24"
      fontSize="1.5em"
      fill="black"
      dominantBaseline="central"
      textAnchor="middle"
    >
      IND
    </text>
    <g transform="translate(50,60)">
      <g transform="scale(0.6)">
        <image
          x="-50"
          y="-50"
          width="100"
          height="100"
          href={FactoryIcon}
        />
      </g>
    </g>
    <g>
      <circle fill={blockNation.darkTone} cx={80} cy={80} r={20} />
      <text
        x="80"
        y="80"
        fontSize="1.5em"
        fill="white"
        dominantBaseline="central"
        textAnchor="middle"
      >
        {block.strength}
      </text>
    </g>
  </>
));
const DefaultBlock: React.FC = () => {
  return <></>;
}

const UnitComponentMap = {
  [UnitName.Infantry]: InfantryBlock,
  [UnitName.Tank]: TankBlock,
  [UnitName.Fleet]: FleetBlock,
  [UnitName.AirForce]: Icon,
  [UnitName.Sub]: SubBlock,
  [UnitName.Carrier]: CarrierBlock,
  [UnitName.Fortress]: FortressBlock,
  [UnitName.Marine]: MarineBlock,
  [UnitName.Militia]: MilitiaBlock,
  [UnitName.Convoy]: ConvoyBlock,
  [UnitName.Industry]: IndustryBlock
};

// PipsElement (Simplified a bit - you can further optimize the rotation logic if needed)
const PipsElement: React.FC<{ maxPips: number; pipColor: string; edition: string }> = ({
  maxPips,
  pipColor,
  edition,
}) => {
  const rotation = `rotate(${(maxPips - 1) * 90}, 50, 50)`;
  return (
    <g fill={pipColor} transform={rotation}>
      {maxPips === 4 && (
        <g>
          {edition === "CnC" ? (
            <>
              <rect x={82} y={28} width="8" height="8" />
              <rect x={82} y={40} width="8" height="8" />
              <rect x={82} y={52} width="8" height="8" />
              <rect x={82} y={64} width="8" height="8" />
            </>
          ) : (
            <>
              <circle cx={86} cy={32} r="4" />
              <circle cx={86} cy={44} r="4" />
              <circle cx={86} cy={56} r="4" />
              <circle cx={86} cy={68} r="4" />
            </>
          )}
        </g>
      )}
      {maxPips >= 3 && (
        <g>
          {edition === "CnC" ? (
            <>
              <rect x={34} y={82} width="8" height="8" />
              <rect x={46} y={82} width="8" height="8" />
              <rect x={58} y={82} width="8" height="8" />
            </>
          ) : (
            <>
              <circle cx={38} cy={86} r="4" />
              <circle cx={50} cy={86} r="4" />
              <circle cx={62} cy={86} r="4" />
            </>
          )}
        </g>
      )}
      {edition === "CnC" ? (
        <>
          <rect x={10} y={40} width="8" height="8" />
          <rect x={10} y={52} width="8" height="8" />
          <rect x={46} y={10} width="8" height="8" />
        </>

      ) : (
        <>
          <circle cx={14} cy={44} r="4" />
          <circle cx={14} cy={56} r="4" />
          <circle cx={50} cy={14} r="4" />
        </>
      )}
    </g>
  );
};

// --- Main BlockSvg Component ---

interface BlockSvgProps {
  id: string;
  nationLookup?: { [key: string]: Nation }; // More precise type
  nation?: Nation; // More precise type
  block?: Block; // More precise type
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

export const BlockSvg: React.FC<BlockSvgProps> = ({
  id,
  nationLookup = null,
  nation,
  block = null,
  onClick = null,
  onContextMenu = null,
}) => {
  const blockNation = nation ? nation : (nationLookup && block ? nationLookup[block.nationName] : undefined);

  if (!block || !blockNation) {
    return (
      <svg
        id={id}
        width="50"
        height="50"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill={blockNation ? blockNation.color : "grey"}>
          <rect width="100" height="100" />
        </g>
        <g stroke="black" strokeWidth="1" fill="none" fillRule="evenodd">
          <rect width="100" height="100" />
        </g>
        <g stroke="red" strokeWidth="2" fill={blockNation ? blockNation.darkTone : "darkred"}>
          <polygon points="0,0 100,100" />
          <polygon points="0,100 100,0" />
        </g>
        <text
          x="50"
          y="50"
          fontSize="1em"
          fill="white"
          dominantBaseline="central"
          textAnchor="middle"
        >
          ELIMINATED
        </text>
      </svg>
    );
  }

  const unitType = unitLookup[block.name];
  const transform = unitType.special
    ? ""
    : `rotate(${(block.strength - blockNation.maxPips(block.name)) * 90},50,50)`;

  const SpecificUnitComponent = UnitComponentMap[block.name] || DefaultBlock;

  return (
    <svg
      id={id}
      //@ts-ignore
      onContextMenu={onContextMenu} onClick={onClick}
      width="50"
      height="50"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={transform}>
        {/* Common parts: background, border */}
        <g fill={blockNation.color}>
          <rect width="100" height="100" />
        </g>
        <g stroke="black" strokeWidth="1" fill="none" fillRule="evenodd">
          <rect width="100" height="100" />
        </g>

        {/* Render the specific unit component */}
        {/* Note the change here! We pass block and potentially other props */}
        <SpecificUnitComponent unitName={block.name} blockNation={blockNation} block={block} />

        <PipsElement
          maxPips={blockNation.maxPips(unitType.name)}
          pipColor={blockNation.pipColor}
          edition={blockNation.edition}
        />
      </g>
    </svg>
  );
};
