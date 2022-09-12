import React from "react";
import { unitLookup, UnitName } from "../model/battle.ts";
import BattleshipIcon from "./noun-battleship-44759.svg";
import AirForceIcon from "./spitfire.svg";
import SubIcon from "./noun-submarine-1189639.svg";
import CarrierIcon from "./noun-carrier-1201287.svg";
import FactoryIcon from "./noun-factory-997898.svg";
import AnchorIcon from "./noun-anchor-1089371.svg";

const PipsElement = ({ maxPips, pipColor, edition }) => {
  if (edition === "CnC")
    return (
      <g fill={pipColor} transform={`rotate(${(maxPips - 1) * 90}, 50, 50)`}>
        {maxPips === 4 ? (
          <g>
            <rect x={82} y={28} width="8" height="8" />
            <rect x={82} y={40} width="8" height="8" />
            <rect x={82} y={52} width="8" height="8" />
            <rect x={82} y={64} width="8" height="8" />
          </g>
        ) : (
          ""
        )}

        {maxPips >= 3 ? (
          <g>
            <rect x={34} y={82} width="8" height="8" />
            <rect x={46} y={82} width="8" height="8" />
            <rect x={58} y={82} width="8" height="8" />F
          </g>
        ) : (
          ""
        )}

        <rect x={10} y={40} width="8" height="8" />
        <rect x={10} y={52} width="8" height="8" />

        <rect x={46} y={10} width="8" height="8" />
      </g>
    );
  return (
    <g fill={pipColor} transform={`rotate(${(maxPips - 1) * 90}, 50, 50)`}>
      {maxPips === 4 ? (
        <g>
          <circle cx={86} cy={32} r="4" />
          <circle cx={86} cy={44} r="4" />
          <circle cx={86} cy={56} r="4" />
          <circle cx={86} cy={68} r="4" />
        </g>
      ) : (
        ""
      )}
      {maxPips >= 3 ? (
        <g>
          <circle cx={38} cy={86} r="4" />
          <circle cx={50} cy={86} r="4" />
          <circle cx={62} cy={86} r="4" />
        </g>
      ) : (
        ""
      )}
      <circle cx={14} cy={44} r="4" />
      <circle cx={14} cy={56} r="4" />

      <circle cx={50} cy={14} r="4" />
    </g>
  );
};

export const BlockSvg = ({ id, nationLookup, nation, block, onClick, onContextMenu }) => {
//  console.log ("Nation", nation);
//  console.log ("NationLookup", nationLookup);

  const blockNation = nation ? nation : nationLookup[block.nationName];
  if (block === null || block === undefined) {
    return (
      <svg
        id={id}
        width="50"
        height="50"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill={blockNation.color}>
          <rect width="100" height="100" />
        </g>
        <g stroke="black" strokeWidth="1" fill="none" fillRule="evenodd">
          <rect width="100" height="100" />
        </g>
        <g stroke="red" strokeWidth="2" fill={blockNation.darkTone}>
          <polygon points="0,0 100,100" />
          <polygon points="0,100 100,0" />
        </g>
        <text
          x="0"
          y="0"
          fontSize="1em"
          fill="white"
          dominantBaseline="central"
          textAnchor="middle"
          transform="translate(50,50)"
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

  var icon = null;
  var scale = 1.0;
  if (block.name === UnitName.Fleet) icon = BattleshipIcon;
  if (block.name === UnitName.AirForce) {
    icon = AirForceIcon;
    scale = 0.7;
  }
  if (block.name === UnitName.Sub) {
    icon = SubIcon;
    scale = 0.85;
  }

  return (
    <svg
      id={id}
      onContextMenu={onContextMenu}
      onClick={onClick}
      width="50"
      height="50"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={transform}>
        <g fill={blockNation.color}>
          <rect width="100" height="100" />
        </g>

        <g stroke="black" strokeWidth="1" fill="none" fillRule="evenodd">
          <rect width="100" height="100" />
        </g>

        {block.name === UnitName.Industry ? (
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
          </>
        ) : (
          ""
        )}

        {block.name === UnitName.Sub ? (
          <g transform={`rotate(-45,50,50),translate(50,50),scale(${scale})`}>
            <g opacity="0.4" fill="white">
              <rect x="-54" y="-12" width="108" height="24" rx="12" />
            </g>
          </g>
        ) : (
          ""
        )}

        {icon ? (
          <g transform={`rotate(-45,50,50),translate(50,50),scale(${scale})`}>
            <image x="-50" y="-50" width="100" height="100" href={icon} />
          </g>
        ) : (
          ""
        )}

        {block.name === UnitName.Carrier ? (
          <>
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
        ) : (
          ""
        )}

        {block.name === UnitName.Fortress ? (
          <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
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
        ) : (
          ""
        )}

        {block.name === UnitName.Infantry ? (
          <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
            <polygon points="23,23 23,77 77,77 77,23" />
            <polygon points="23,23 77,77" />
            <polygon points="23,77 77,23" />
          </g>
        ) : (
          ""
        )}

        {block.name === UnitName.Marine ? (
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
        ) : (
          ""
        )}

        {block.name === UnitName.Militia ? (
          <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
            <polygon points="23,23 23,77 77,77 77,23" />
            <polygon points="38,38 62,62" />
            <polygon points="38,62 62,38" />
          </g>
        ) : (
          ""
        )}

        {block.name === UnitName.Tank ? (
          <g stroke="white" strokeWidth="2" fill={blockNation.darkTone}>
            <polygon points="23,23 23,77 77,77 77,23" />
            <rect x="28" y="40" width="44" height="20" rx="10" />
          </g>
        ) : (
          ""
        )}

        {unitType.name === UnitName.Convoy ? (
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
        ) : (
          ""
        )}

        {unitType.name === UnitName.Industry ? (
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
        ) : (
          <PipsElement
            maxPips={blockNation.maxPips(unitType.name)}
            pipColor={blockNation.pipColor}
            edition={blockNation.edition}
          />
        )}
      </g>
    </svg>
  );
};
