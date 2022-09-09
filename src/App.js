import Grid from "@mui/material/Grid"; // Grid version 1
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Container from "@mui/material/Container";
import ListItem from "@mui/material/ListItem";
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

import { BlockSvg } from "./components/BlockSvg";

import { AttackOrderList } from "./components/AttackOrderList.js";

import "./App.css";
import {
  simulate,
  force,
  unitTable,
  unitLookup,
  UnitClassType,
  UnitName,
} from "./model/battle.ts";
import React from "react";
import Plot from "react-plotly.js";

const Nations = [
  {
    name: "Axis",
    color: "rgb(162,163,162)",
    pipColor: "black",
    darkTone: "rgb(111,113,112)",
    maxPips: 4,
  },
  {
    name: "USSR",
    pipColor: "white",
    color: "rgb(221,72,56)",
    darkTone: "rgb(216,39,31)",
    maxPips: 3,
  },
  {
    name: "West",
    pipColor: "white",
    color: "rgb(30,120,171)",
    darkTone: "rgb(2, 55, 83)",
    maxPips: 4,
  },
];

const initialDefender = {
  name: "BattleForce B",
  attackOrder: [
    "MAX",
    UnitClassType.G,
    UnitClassType.A,
    UnitClassType.N,
    UnitClassType.S,
    UnitClassType.I,
  ],
  forces: [
    ...force("Infantry", 4),
    ...force("Tank", 4),
  ],
  nation: Nations[2],
};

const initialAttacker = {
  name: "BattleForce A",
  forces: [...force("Tank", 3, 2), ...force("Infantry", 3, 1)],
  attackOrder: [
    "MAX",
    UnitClassType.G,
    UnitClassType.A,
    UnitClassType.N,
    UnitClassType.S,
    UnitClassType.I,
  ],
  reduceOrder: ["Tank", "Infantry", "Fortress", "Fleet", "Carrier", "Convoy"],
  DoW: false,
  nation: Nations[1],
};

const VisualizeForce = ({
  attacker,
  removeBlock,
  modifyBlock,
  canModify = true,
}) => {
  if (attacker?.forces === undefined || attacker.forces.length === 0) {
    return <BlockSvg key={0} nation={attacker.nation} />;
  }
  return attacker?.forces?.map((item, index) => {
    return (
      <BlockSvg key={index}
        nation={attacker.nation}
        block={item}
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

const ForcePanel = ({ attacker, onUpdate }) => {
  function changeNation(index) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      copy.nation = Nations[index];
      copy.forces.forEach((block) => {
        if (unitLookup[block.name].special) return;
        block.strength = Math.min(block.strength, copy.nation.maxPips);
      });
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
      var val = block.strength + value;
      if (!unitLookup[block.name].special) {
        while (val <= 0) val += copy.nation.maxPips;
        while (val > copy.nation.maxPips) val -= copy.nation.maxPips;
      } else {
        if (val <= 0) copy.forces.splice(index, 1);
      }
      block.strength = val;
      return copy;
    });
  }
  function addBlock(unitType) {
    onUpdate((old) => {
      console.log("Add Block");
      const copy = JSON.parse(JSON.stringify(old));
      const strength = unitLookup[unitType].special ? 10 : copy.nation.maxPips;
      copy.forces.push(...force(unitType, strength));
      return copy;
    });
  }

  function addFirstFire(type) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      if (copy.FirstFire === undefined) copy.FirstFire = [];
      if (copy.FirstFire.indexOf(type) !== -1) return;
      copy.FirstFire.push(type);
      return copy;
    });
  }

  function updateAttackOrder(order) {
    onUpdate((old) => {
      console.log("Updated order", order);
      const copy = JSON.parse(JSON.stringify(old));
      copy.attackOrder = order;
      console.log(copy);
      return copy;
    });
  }

  function removeFirstFire(type) {
    onUpdate((old) => {
      const copy = JSON.parse(JSON.stringify(old));
      const index = copy.FirstFire.indexOf(type);
      if (index === -1) return;
      copy.FirstFire.splice(index, 1);
      return copy;
    });
  }

  const forceA = attacker;

  const CV = forceA.forces
    .filter((item) => item.name !== "Industry")
    .reduce((total, item) => total + item.strength, 0);
  const IND = forceA.forces
    .filter((item) => item.name === "Industry")
    .reduce((total, item) => total + item.strength, 0);

  return (
    <Container>
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <ListSubheader component="div">
          {forceA.name} (CV {CV}
          {IND > 0 ? `, IND ${IND}` : ""}){" "}
          <FormControl size="small">
            <Select value="" onChange={(e) => changeNation(e.target.value)}>
              {Nations.map((nation, index) => {
                return <MenuItem key={index} value={index}>{nation.name}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </ListSubheader>
        <ListItem disablePadding>
          <VisualizeForce key="force"
            attacker={forceA}
            removeBlock={removeBlock}
            modifyBlock={modifyBlock}
          />
          <ListItemText>
            <FormControl size="small">
              <Select id="addBlock" value="" onChange={(e) => addBlock(e.target.value)}>
                {unitTable
                  .filter((unit) => unit.special === false || IND === 0)
                  .map((unit, index) => {
                    return (
                      <MenuItem key={unit.name} value={unit.name}>
                        <BlockSvg key={`index${unit.name}`}
                          nation={forceA.nation}
                          block={{
                            name: unit.name,
                            strength: unit.special ? 10 : forceA.nation.maxPips,
                          }}
                        />
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </ListItemText>
        </ListItem>
        <ListSubheader component="div">
          Units with FirstFire{" "}
          <FormControl size="small">
            <Select id="addFirstFire" value="" onChange={(e) => addFirstFire(e.target.value)}>
              {unitTable
                .filter(
                  (unit) =>
                    forceA.FirstFire === undefined ||
                    forceA.FirstFire?.indexOf(unit.name) === -1
                )
                .map((unit) => {
                  return <MenuItem key={unit.name} value={unit.name}>{unit.name}</MenuItem>;
                })}
            </Select>
          </FormControl>
        </ListSubheader>
        <ListItem>
          <ListItemText>
            {forceA.FirstFire?.map((val, index) => {
              return <Chip label={val} onClick={() => removeFirstFire(val)} />;
            })}
          </ListItemText>
        </ListItem>
        <ListSubheader component="div" id="nested-list-subheader">
          Target class priority
        </ListSubheader>
        <ListItem>
          <AttackOrderList key="order"
            items={forceA.attackOrder}
            onOrderChanged={(items) => updateAttackOrder(items)}
          />
        </ListItem>
      </List>
    </Container>
  );
};

export const groupByReduceFunction = (data, lambda) => {
  if (data === undefined) return [];
  // @ts-ignore
  return data.reduce((group, item) => {
    if (item === undefined) return group;
    var property = lambda(item);
    group[property] = group[property] ?? [];
    group[property].push(item);
    return group;
  }, {});
};

function App() {
  const [combatRounds, setCombatRounds] = React.useState([
    { attacker: "A", hasDoWFirstFire: true },
    { attacker: "B" },
  ]);
  const [battleforceA, setBattleforceA] = React.useState(initialAttacker);
  const [battleforceB, setBattleforceB] = React.useState(initialDefender);

  const simulations = 10000;

  const [aResults, oResults] = simulate(
    battleforceA,
    battleforceB,
    combatRounds,
    simulations
  );

  function findExample(resultData) {
    const Aresults = groupByReduceFunction(resultData, (result) => {
      return result.forces.reduce((val, item) => {
        return item.strength ? val + item.strength : val;
      }, 0);
    });
    const Acounts = Object.keys(Aresults).sort(
      (a, b) => Aresults[b].length - Aresults[a].length
    );
    return Aresults[Acounts[0]][0];
  }
  const Aexample = findExample(aResults);
  const Oexample = findExample(oResults);

  function setDoW(value) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    if (copy?.length > 0) {
      console.log(copy, value);
      copy[0].hasDoWFirstFire = value;
      console.log(copy);
      setCombatRounds(copy);
    }
  }

  function setSeaInvasion(index, value) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy[index].seaInvasion = value;
    setCombatRounds(copy);
  }

  function removeCombatRound(index) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy.splice(index, 1);
    setCombatRounds(copy);
  }

  function addCombatRound() {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy.push({ attacker: "A" });
    setCombatRounds(copy);
  }

  function setCombatRoundAttacker(index, attacker) {
    const copy = JSON.parse(JSON.stringify(combatRounds));
    copy[index].attacker = attacker;
    setCombatRounds(copy);
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
    console.log("attacker update");
    setBattleforceA((old) => updateFunction(old));
  }

  function updateDefender(updateFunction) {
    console.log("defender update");
    setBattleforceB((old) => updateFunction(old));
  }

  return (
    <div className="App">
      <List>
        <ListItem>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <ForcePanel attacker={battleforceA} onUpdate={updateAttacker} />
            </Grid>
            <Grid item xs={6}>
              <ForcePanel attacker={battleforceB} onUpdate={updateDefender} />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Container>
            <List
              md={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Combat Rounds in simulation ({combatRounds.length})
                  <IconButton onClick={() => addCombatRound()}>
                    <AddCircleIcon size="small" />
                  </IconButton>
                </ListSubheader>
              }
            >
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
                              label="test"
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
                              label="test"
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
          </Container>
        </ListItem>
        <Divider />
        <ListSubheader>Simulation results (most likely outcome)</ListSubheader>
        <ListItem>
          {" "}
          <Grid container>
            <Grid item xs={6}>
              <VisualizeForce attacker={Aexample} canModify={false} />
            </Grid>
            <Grid item xs={6}>
              <VisualizeForce attacker={Oexample} canModify={false} />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
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
                    color: battleforceA.nation.color,
                  },
                },
                {
                  x: remainingOwner,
                  type: "histogram",
                  name: battleforceB.name,
                  opacity: 0.8,
                  marker: {
                    color: battleforceB.nation.color,
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

export default App;
