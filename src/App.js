import Grid from "@mui/material/Grid"; // Grid version 1
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

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
  forces: [...force("Infantry", 4), ...force("Tank", 4)],
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
      <BlockSvg
        key={index}
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
        <ListItem disablePadding>
          <ListItemText>
            {forceA.name} (CV {CV} {IND > 0 ? `, IND ${IND}` : ""})
          </ListItemText>
          <FormControl size="small">
            <Select
              value={Nations.indexOf(forceA.nation)}
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
        <ListItem disablePadding>
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
                  .map((unit, index) => {
                    return (
                      <MenuItem key={unit.name} value={unit.name}>
                        <BlockSvg
                          key={`index${unit.name}`}
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
        <ListItem disablePadding>
          <ListItemText primary="Units with FirstFire" />
          <FormControl size="small">
            <Select
              id="addFirstFire"
              value=""
              IconComponent={AddIcon}
              onChange={(e) => addFirstFire(e.target.value)}
            >
              {unitTable
                .filter(
                  (unit) =>
                    forceA.FirstFire === undefined ||
                    forceA.FirstFire?.indexOf(unit.name) === -1
                )
                .filter((unit) => unitLookup[unit.name].canFirstFire)
                .map((unit) => {
                  return (
                    <MenuItem key={unit.name} value={unit.name}>
                      {unit.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <ListItemText>
            {forceA.FirstFire?.map((val, index) => {
              return <Chip label={val} onClick={() => removeFirstFire(val)} />;
            })}
          </ListItemText>
        </ListItem>
        <ListItem disablePadding>
          <ListItemText>Target Class priority</ListItemText>
          <AttackOrderList
            key="order"
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function HelpDialogSlide() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="inherit"  onClick={handleClickOpen}>Help</Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle>{"Tragedy & Triumph Combat Simulator"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <p>This is a combat simulator for the <a href="https://www.gmtgames.com/p-722-triumph-and-tragedy-3rd-printing.aspx">Tragedy &amp; Triumph</a> board game by Craig Besinque published by GMT Games LLC.</p>
            
            <p>Here you can simulate the battles over one or more combat rounds for two opposing forces.</p>

            <p><b>BattleForce</b> - <b>Click</b> add pip, <b>Shift+Click</b> remove pip, <b>Right Click</b> remove block</p>

            <p><b>Target Class Priority</b> - This defines the unit classes of the opposing force that are targeted when units are firing. <b>MAX</b> aims to always target the class that has the highest chance of success. 
            <b>Units will skip priorities which they cannot hit.</b> (ie. Tanks will not try to fire at Air Force even when A is the left most (highest) priority. <b>IND</b> is industry, Air Force is assumed to have <b>Precision Bombsight</b> tech.</p>

            <p><b>Combat Rounds</b> - You can add several combat rounds to the simulation, including defining which side initiates the attack (by clicking and switching the arrow). For the first round also DoW and SeaInvasion can be simulated.</p>

            <p><b>Known issues</b>
            <ul>
              <li>Retreats: Not currently simulated. Thus also the carrier evade is not simulated.</li>
              <li>Target Class Priority: Convoys are not separately targetable.</li>
              <li>Target Class Priority: MAX targets the opposing unit class with highest chance of hitting, not damaging - ie. double hits are not considered</li>
              <li>Battlegroups: Currently only one battlegroup is possible on each side, so reinforcements or multiple battlegroups joining are not simulated.</li>
            </ul> 
            </p>
            <p>This simulator was written by kijoe. Please post bugs, feedback, comments, suggestions in the <a href="https://boardgamegeek.com/thread/2931896/combat-simulator-tragedy-triumph">BGG Forums here</a>. </p>
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Tragedy &amp; Triumph Combat Simulator v1.0
            </Typography>
            <HelpDialogSlide />
          </Toolbar>
        </AppBar>
      </Box>
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
        <Divider />
        <ListItem>
          <Container>
            <List
              md={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
              component="nav"
              aria-labelledby="nested-list-subheader"
            >
              <ListItem disablePadding >
                <ListItemText>                
                  <b>Combat Rounds in simulation ({combatRounds.length})</b>
                  <IconButton onClick={() => addCombatRound()}>
                    <AddCircleIcon size="small" />
                  </IconButton>
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
