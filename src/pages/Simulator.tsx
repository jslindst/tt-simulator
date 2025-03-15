import Grid from "@mui/material/Grid"; // Grid version 1

import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import WestIcon from "@mui/icons-material/West";

import EastIcon from "@mui/icons-material/East";
import Chip from "@mui/material/Chip";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";

import { groupByReduceFunction } from "../utils/utils.ts";

import { HelpDialogSlide } from "../components/HelpDialogSlide.tsx";
import { BlockSvg } from "../components/BlockSvg.tsx";

import { AttackOrderList } from "../components/AttackOrderList.tsx";
import MapVisualization from "../components/MapVisualization";
import { mapData } from "../mapData";

import "../App.css";
import {
  simulate,
  force,
  unitTable,
  unitLookup,
  UnitClassType,
  Nations,
  NationLookup,
  UnitName,
  Technologies,
  blocksToString,
  stringToBlocks,
  stringToTechs,
  techsToString,
  Force,
  CombatRound,
} from "../model/battle.ts";
import React from "react";
import Plot from "react-plotly.js";
import { Tooltip } from "@mui/material";
import { SiteAppBar } from "./SiteAppBar.tsx";

const STANDARD_ATTACK_ORDER = [
  "MAX",
  UnitClassType.G,
  UnitClassType.A,
  UnitClassType.N,
  UnitClassType.S,
  UnitClassType.I,
];

const initialDefenderTnT: Force = {
  name: "BattleForce B",
  attackOrder: [...STANDARD_ATTACK_ORDER],
  forces: [...force("Infantry", "Axis", 4), ...force("Infantry", "Axis", 4)],
  //forces: [...force("Fleet", 4, 2)],
  nationName: "Axis",
  //nationName: "Japanese (CnC)",
  technologies: []
};

const initialAttackerTnT: Force = {
  name: "BattleForce A",
  //forces: [...force("Fleet", 4, 2)],
  forces: [...force("Tank", "West", 3, 3)],
  attackOrder: [...STANDARD_ATTACK_ORDER],
  reduceOrder: ["Tank", "Infantry", "Fortress", "Fleet", "Carrier", "Convoy"],
  nationName: "West",
  technologies: []
};

const SIMULATOR_HELP_TEXT = () => (
  <>
    <p>
      This is a combat simulator for the{" "}
      <a href="https://www.gmtgames.com/p-722-triumph-and-tragedy-3rd-printing.aspx">
        Tragedy &amp; Triumph</a>{" "}
      <a href="https://www.gmtgames.com/p-840-conquest-and-consequence.aspx">
        Conquest &amp; Consequence</a>{" "}board game by Craig Besinque published by GMT Games LLC.</p>

    <p>
      Here you can simulate the battles over one or more combat rounds for
      two opposing forces.
    </p>

    <p>
      <b>BattleForce</b> - <b>Click</b> add pip, <b>Shift+Click</b> remove
      pip, <b>Right Click</b> remove block
    </p>

    <p>
      <b>Target Class Priority</b> - This defines the unit classes of the
      opposing force that are targeted when units are firing. <b>MAX</b>{" "}
      aims to always target the class that has the highest chance of
      success.
      <b>Units will skip priorities which they cannot hit.</b> (ie. Tanks
      will not try to fire at Air Force even when A is the left most
      (highest) priority. <b>IND</b> is industry.
    </p>

    <p>
      <b>Combat Rounds</b> - You can add several combat rounds to the
      simulation, including defining which side initiates the attack (by
      clicking and switching the arrow). For the first round also DoW and
      SeaInvasion can be simulated.
    </p>

    <p>
      <b>Known issues</b>
    </p>

    <ul>
      <li>
        Retreats: Not currently simulated. Thus also the carrier evade is
        not simulated.
      </li>
      <li>
        Target Class Priority: Convoys are not separately targetable.
      </li>
      <li>
        Target Class Priority: MAX targets the opposing unit class with
        highest chance of hitting, not damaging - ie. double hits are not
        considered.
      </li>
      <li>
        Battlegroups: Currently only one battlegroup is possible on each
        side, so reinforcements or multiple battlegroups joining are not
        simulated.
      </li>
      <li>CnC - Kamikaze: Option not implemented.</li>
    </ul>

    <p>
      This simulator was written by kijoe. Please post bugs, feedback,
      comments, suggestions in the{" "}
      <a href="https://boardgamegeek.com/thread/2931896/combat-simulator-tragedy-triumph">
        BGG Forums here
      </a>
      .{" "}
    </p></>);


const VisualizeForce = ({
  attacker,
  removeBlock = (index: number) => { },
  modifyBlock = (index: number, change: number) => { },
  canModify = true,
}) => {
  const nation = NationLookup[attacker.nationName];

  if (attacker?.forces === undefined || attacker.forces.length === 0) {
    return <BlockSvg id={`${nation.name}-defeated`} key={0} nation={nation} />;
  }
  return attacker?.forces?.map((unit, index) => {
    return (
      <BlockSvg
        id={`${nation.name}-${unit.name}-${unit.strength}`}
        key={`${index}-${nation.name}-${unit.name}-${unit.strength}`}
        nationLookup={NationLookup}
        block={unit}
        onClick={(e) => {
          if (!canModify) return;
          if (e.shiftKey) modifyBlock(index, -1);
          else modifyBlock(index, 1);
        }}
        onContextMenu={(e) => {
          if (!canModify) return;
          e.preventDefault();
          removeBlock(index);
        }}
      />
    );
  });
};

const ForceStrength = ({ force }) => {
  const CV = force.forces
    .filter((item) => item.name !== UnitName.Industry)
    .reduce((total, item) => total + item.strength, 0);
  const IND = force.forces
    .filter((item) => item.name === UnitName.Industry)
    .reduce((total, item) => total + item.strength, 0);
  return (
    <>
      (CV {CV}
      {IND > 0 ? `, IND ${Number(IND)}` : ""})
    </>
  );
};

const ForceTitle = ({ force }) => {
  return (
    <>
      {force.name} <ForceStrength force={force} />
    </>
  );
};

const validateBlocks = (force: Force) => {
  const nation = NationLookup[force.nationName];

  force.forces.forEach((block) => {
    if (unitLookup[block.name].special) return;
    block.strength = Math.min(block.strength, nation.maxPips(block.name));
  });
  force.forces = force.forces.filter(
    (block) => nation.units.indexOf(unitLookup[block.name].shortName) !== -1
  );
  return force;
};

const ForcePanel = ({ attacker, onUpdate }) => {
  function changeNation(index) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      const oldNation = NationLookup[copy.nationName];
      const newNation = Nations[index];
      copy.nationName = newNation.name;
      copy.forces.forEach((block) => (block.nationName = newNation.name));
      return validateBlocks(copy);
    });
  }

  function removeBlocks() {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      copy.forces = [];
      return copy;
    });
  }

  function removeBlock(index) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      copy.forces.splice(index, 1);
      return copy;
    });
  }

  function modifyBlock(index, value) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      const block = copy.forces[index];
      const nation = NationLookup[copy.nationName];
      var val = block.strength + value;
      if (!unitLookup[block.name].special) {
        while (val <= 0) val += nation.maxPips(block.name);
        while (val > nation.maxPips(block.name))
          val -= nation.maxPips(block.name);
      } else {
        if (val <= 0) copy.forces.splice(index, 1);
      }
      block.strength = val;
      return copy;
    });
  }
  function addBlock(unitType) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));

      const nation = NationLookup[copy.nationName];
      const strength = unitLookup[unitType].special
        ? 10
        : nation.maxPips(unitType);
      copy.forces.push(...force(unitType, nation.name, strength));
      return copy;
    });
  }

  function addTechnology(tech) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      if (copy.technologies === undefined) copy.technologies = [];
      if (copy.technologies.indexOf(tech) !== -1) return;
      copy.technologies.push(tech);
      return copy;
    });
  }

  function updateAttackOrder(order) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      copy.attackOrder = order;
      return copy;
    });
  }

  function removeTechnology(tech) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      const index = copy.technologies.indexOf(tech);
      if (index === -1) return;
      copy.technologies.splice(index, 1);
      return copy;
    });
  }

  const toRichText = (value) => {
    if (value === undefined || value === null) return "";
    var texts = value.split("\n").filter((text) => text.trim().length > 0);
    if (texts.length === 0) return "";
    return (
      <>
        {texts.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </>
    );
  };

  const forceA = attacker;
  const nation = NationLookup[attacker.nationName];

  const CV = forceA.forces
    .filter((item) => item.name !== "Industry")
    .reduce((total, item) => total + item.strength, 0);
  const IND = forceA.forces
    .filter((item) => item.name === "Industry")
    .reduce((total, item) => total + item.strength, 0);

  return (
    <List
      sx={{ width: "100%", maxWidth: 420, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItem disablePadding key="title">
        <ListItemText>
          <ForceTitle force={forceA} />
        </ListItemText>
        {nation.description ? (
          <Tooltip title={toRichText(nation.description)} arrow>
            <InfoIcon
              style={{
                transform: "scale(0.8)",
                padding: -3,
                margin: -3,
                verticalAlign: "bottom",
                color: "orange",
              }}
              fontSize="small"
            />
          </Tooltip>
        ) : (
          ""
        )}

        <FormControl size="small">
          <Select
            value={Nations.map((nation) => nation.name).indexOf(
              forceA.nationName
            )}
            onChange={(e) => changeNation(e.target.value)}
          >
            {Nations.map((nation, index) => {
              return (
                <MenuItem key={index} value={index}>
                  {nation.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </ListItem>
      <ListItem disablePadding key="forces">
        <IconButton onClick={removeBlocks}>
          <HighlightOffIcon />
        </IconButton>
        <VisualizeForce
          key="force"
          attacker={forceA}
          removeBlock={removeBlock}
          modifyBlock={modifyBlock}
        />
        <ListItemText>
          <FormControl size="small">
            <Select
              id="addBlock"
              value=""
              variant="filled"
              IconComponent={AddIcon}
              onChange={(e) => addBlock(e.target.value)}
            >
              {unitTable
                .filter((unit) => unit.special === false || IND === 0)
                .filter(
                  (unit) =>
                    NationLookup[forceA.nationName].units.indexOf(
                      unit.shortName
                    ) !== -1
                )
                .map((unit, index) => {
                  return (
                    <MenuItem key={unit.name} value={unit.name}>
                      <BlockSvg
                        id={`${forceA.nationName}-${unit.name}-${NationLookup[
                          forceA.nationName
                        ].maxPips(unit.name)}`}
                        key={`index${unit.name}`}
                        nationLookup={NationLookup}
                        block={{
                          name: unit.name,
                          nationName: forceA.nationName,
                          strength: unit.special
                            ? 10
                            : NationLookup[forceA.nationName].maxPips(
                              unit.name
                            ),
                        }}
                      />
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </ListItemText>
      </ListItem>
      <ListItem disablePadding key="techs">
        <ListItemText primary="Technologies" />
        <FormControl size="small">
          <Select
            id="addTechnology"
            value=""
            IconComponent={AddIcon}
            onChange={(e) => addTechnology(e.target.value)}
          >
            {Technologies.filter(
              (tech) =>
                tech.selectable && !forceA.technologies?.includes(tech.name)
            ).map((tech) => {
              return (
                <MenuItem key={tech.name} value={tech.name}>
                  {tech.name} ({tech.edition})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </ListItem>
      <ListItem key="techList">
        <ListItemText>
          {NationLookup[forceA.nationName].specialTechnologies?.map(
            (val, index) => {
              return <Chip disabled={true} label={val} />;
            }
          )}
          {forceA.technologies?.map((val, index) => {
            return <Chip label={val} onClick={() => removeTechnology(val)} />;
          })}
        </ListItemText>
      </ListItem>
      <ListItem disablePadding key="priorities">
        <ListItemText>Target Class priority</ListItemText>
        <AttackOrderList
          key="order"
          items={forceA.attackOrder}
          onOrderChanged={(items) => updateAttackOrder(items)}
        />
      </ListItem>
    </List>
  );
};

function Simulator() {
  var locationString = window.location.search;

  const validString = locationString.match(
    /^\?(cnc)?([a-z0-9|!]*):([a-z0-9|!]*)(:[a-z]*)?$/i
  );

  //  console.log("valid", validString);

  const AForceString = validString ? validString[2] : "!wt3|wt3!012345";
  const BForceString = validString ? validString[3] : "!ai4|ai2!012345";

  const initializeFromString = (string, force) => {
    try {
      const split = string.split("!");
      if (split.length < 2 || split.length > 3) {
        initializeFromString("!wt3|wt3!012345", force);
        return;
      }
      const techString = split[0];
      const forceString = split[1];
      const orderString = split.length >= 3 ? split[2] : "";
      force.forces = stringToBlocks(forceString);
      force.technologies = stringToTechs(techString);

      const newOrderIdx = orderString.replace(/[^0-5]/gi, "").split("");
      newOrderIdx.push(...STANDARD_ATTACK_ORDER.map((item, idx) => "" + idx));
      force.attackOrder = newOrderIdx
        .filter(function (item, pos) {
          return newOrderIdx.indexOf(item) === pos;
        })
        .map((idx) => STANDARD_ATTACK_ORDER[idx]);
    } catch (e) {
      console.log(e);
    }
  };

  const formatForceString = (force: Force) => {
    return (
      techsToString(force.technologies) +
      "!" +
      blocksToString(force.forces) +
      "!" +
      force.attackOrder
        ?.map((order) => STANDARD_ATTACK_ORDER.indexOf(order))
        .join("")
    );
  };

  initializeFromString(AForceString, initialAttackerTnT);
  initializeFromString(BForceString, initialDefenderTnT);

  const initialCombatRounds: CombatRound[] = [];

  const formatCombatRoundsString = (combatRounds) => {
    return combatRounds.map((round) => {
      return round.attacker + (round.hasDoWFirstFire ? "d" : "x") + (round.seaInvasion ? "s" : "n");
    }).join("");
  };

  const initializeCombatRoundsFromString = (
    combatRoundsString,
    initialCombatRounds
  ) => {
    const matches = combatRoundsString.match(/([AB][dx][sn]){1}/g);
    if (!matches) return;

    initialCombatRounds.push(
      ...matches.map((round) => {
        const item = {
          attacker: round.charAt(0),
          hasDoWFirstFire: round.charAt(1) === "d",
          seaInvasion: round.charAt(2) === "s",
        };
        return item;
      })
    );
  };

  initializeCombatRoundsFromString(validString && validString.length > 3 ? validString[4] : "Axn",
    initialCombatRounds
  );

  if (locationString.match(/cnc/gi)) {
    locationString = locationString.replace(/cnc/gi, "");

    initialAttackerTnT.nationName = "US (CnC)";
    initialDefenderTnT.nationName = "Japanese (CnC)";

    initialAttackerTnT.forces.forEach(
      (block) => (block.nationName = initialAttackerTnT.nationName)
    );
    initialDefenderTnT.forces.forEach(
      (block) => (block.nationName = initialDefenderTnT.nationName)
    );
  }
  validateBlocks(initialAttackerTnT);
  validateBlocks(initialDefenderTnT);

  if (initialAttackerTnT.forces.length > 0) {
    initialAttackerTnT.nationName =
      initialAttackerTnT.forces[
        initialAttackerTnT.forces.length - 1
      ].nationName;
  }

  if (initialDefenderTnT.forces.length > 0) {
    initialDefenderTnT.nationName =
      initialDefenderTnT.forces[
        initialDefenderTnT.forces.length - 1
      ].nationName;
  }

  const [combatRounds, setCombatRounds] = React.useState(initialCombatRounds);
  const [battleforceA, setBattleforceA] = React.useState(initialAttackerTnT);
  const [battleforceB, setBattleforceB] = React.useState(initialDefenderTnT);

  //  const str = blocksToString(battleforceA.forces)
  //  console.log(str);
  //  console.log(stringToBlocks(str));

  const simulations = 10000;

  const [aResults, oResults] = simulate(
    battleforceA,
    battleforceB,
    combatRounds,
    simulations
  );

  function findExample(resultData: Force[], number = 1) {
    const Aresults = groupByReduceFunction(resultData, (result) => {
      return result.forces.reduce((hash, block) => {
        return hash + Math.pow(24, unitLookup[block.name].id) * block.strength;
      }, 0);
    });
    const hashesSorted = Object.keys(Aresults).sort(
      (a, b) => Aresults[b].length - Aresults[a].length
    );

    const examples: { result: Force, count: number }[] = [];
    for (var i = 0; i < number && i < hashesSorted.length; i++) {
      examples.push({
        result: Aresults[hashesSorted[i]][0],
        count: Aresults[hashesSorted[i]].length,
      });
    }
    return examples;
  }
  const likelyResultsForA = findExample(aResults, 5);
  const likelyResultsForB = findExample(oResults, 5);
  //  console.log(likelyResultsForA);


  const updateURL = ({ updateAttacker = battleforceA, updateDefender = battleforceB, updateRounds = combatRounds }) => {
    //    console.log("Updating URL ", updateAttacker, updateDefender);
    window.history.replaceState(
      { page: 2 },
      "Combat Simulator",
      `?${formatForceString(updateAttacker)}:${formatForceString(updateDefender)}:${formatCombatRoundsString(updateRounds)}`
    );
  }

  function setDoW(value) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    if (copy?.length > 0) {
      //    console.log(copy, value);
      copy[0].hasDoWFirstFire = value;
      setCombatRounds(copy);
      updateURL({ updateRounds: copy });
    }
  }

  function setSeaInvasion(index, value) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy[index].seaInvasion = value;
    setCombatRounds(copy);
    updateURL({ updateRounds: copy });
  }

  function removeCombatRound(index) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy.splice(index, 1);
    setCombatRounds(copy);
    updateURL({ updateRounds: copy });
  }

  function addCombatRound() {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy.push({ attacker: "A" });
    setCombatRounds(copy);
    updateURL({ updateRounds: copy });
  }

  function setCombatRoundAttacker(index, attacker) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy[index].attacker = attacker;
    setCombatRounds(copy);
    updateURL({ updateRounds: copy });
  }

  const remainingAggressor = aResults.map((result) =>
    result.forces.reduce((val, item) => {
      return item.strength ? val + item.strength : val;
    }, 0)
  );
  const remainingOwner = oResults.map((result) =>
    result.forces.reduce((val, item) => {
      return item.strength ? val + item.strength : val;
    }, 0)
  );

  function updateAttacker(updateFunction) {
    setBattleforceA((old) => {
      const updated = updateFunction(old);
      updateURL({ updateAttacker: updated });
      return updated;
    });
  }

  function updateDefender(updateFunction) {
    setBattleforceB((old) => {
      const updated = updateFunction(old);
      updateURL({ updateDefender: updated });
      return updated;
    });
  }

  return (
    <div className="App">
      <SiteAppBar
        title={"Tragedy & Triumph / Conquest & Consequence - Combat Simulator v1.12"}
        help={<HelpDialogSlide
          title={"Tragedy & Triumph / Conquest & Consequence - Combat Simulator"}
          content={SIMULATOR_HELP_TEXT()}
        />} />
      <List>
        <ListItem key="forces">
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <ForcePanel attacker={battleforceA} onUpdate={updateAttacker} />
            </Grid>
            <Grid item xs={6}>
              <ForcePanel attacker={battleforceB} onUpdate={updateDefender} />
            </Grid>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem key="combatRounds">
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
          >
            <ListItem disablePadding>
              <ListItemText>
                <b>Combat Rounds in simulation ({combatRounds.length})</b>
                <IconButton onClick={() => addCombatRound()}>
                  <AddCircleIcon />
                </IconButton>
                <span className="instruction">
                  (Combat Round involves an exchange of fire between both sides,
                  Defender first, unless DoW or FirstFire apply){" "}
                </span>
              </ListItemText>
            </ListItem>
            {combatRounds.map((round, index) => {
              return (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() =>
                      setCombatRoundAttacker(
                        index,
                        round.attacker === "A" ? "B" : "A"
                      )
                    }
                  >
                    <Grid
                      component="label"
                      container
                      alignItems="center"
                      spacing={1}
                    >
                      <Grid item>{battleforceA.name}</Grid>
                      <Grid item>
                        {round.attacker === "A" ? <EastIcon /> : <WestIcon />}
                      </Grid>
                      <Grid item>{battleforceB.name}</Grid>
                    </Grid>
                  </ListItemButton>
                  <ListItemText>
                    <FormGroup>
                      <FormControlLabel
                        disabled={index !== 0}
                        control={
                          <Checkbox
                            disabled={index !== 0}
                            checked={round.hasDoWFirstFire}
                            onChange={() => setDoW(!round.hasDoWFirstFire)}
                          />
                        }
                        label="DoW?"
                      />
                    </FormGroup>
                  </ListItemText>
                  <ListItemText>
                    <FormGroup>
                      <FormControlLabel
                        disabled={index !== 0}
                        control={
                          <Checkbox
                            disabled={index !== 0}
                            checked={round.seaInvasion}
                            onChange={() =>
                              setSeaInvasion(index, !round.seaInvasion)
                            }
                          />
                        }
                        label="SeaInvasion?"
                      />
                    </FormGroup>
                  </ListItemText>
                  <ListItemText>
                    <IconButton
                      edge="end"
                      aria-label="comments"
                      onClick={() => removeCombatRound(index)}
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        </ListItem>
        <Divider />
        <ListItem key="subHeaderOutcome">
          Simulation results (most likely outcome)
        </ListItem>
        <ListItem key="outcomes">
          <Grid container>
            <Grid item xs={6}>
              <List>
                {likelyResultsForA.map((res, index) => (
                  <ListItem key={index}>
                    <VisualizeForce attacker={res.result} canModify={false} />
                    <ListItemText>
                      <ForceStrength force={res.result} />
                      {" - "}
                      {Math.round((res.count / simulations) * 1000) / 10} %
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={6}>
              <List>
                {likelyResultsForB.map((res, index) => (
                  <ListItem key={index}>
                    <VisualizeForce attacker={res.result} canModify={false} />
                    <ListItemText>
                      <ForceStrength force={res.result} />
                      {" - "}
                      {Math.round((res.count / simulations) * 1000) / 10} %
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </ListItem>
        <ListItem key="graph">
          <Container>
            <Plot
              config={{ displayModeBar: false, responsive: true }}
              data={[
                {
                  x: remainingAggressor,
                  type: "histogram",
                  name: battleforceA.name,
                  opacity: 0.8,
                  marker: {
                    color: NationLookup[battleforceA.nationName].color,
                  },
                },
                {
                  x: remainingOwner,
                  type: "histogram",
                  name: battleforceB.name,
                  opacity: 0.8,
                  marker: {
                    color: NationLookup[battleforceB.nationName].color,
                  },
                },
              ]}
              layout={{
                barmode: "overlay",
                height: 480,
                showlegend: false,
                title: `Result of ${simulations} Combat simulations`,
              }}
            />
          </Container>
        </ListItem>
      </List>
    </div>
  );
}

export default Simulator;
