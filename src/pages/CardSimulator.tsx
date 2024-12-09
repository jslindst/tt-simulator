
import React from "react";
import { SiteAppBar } from "./SiteAppBar";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import styled from "styled-components";
import stringify from 'json-stringify-safe';

//@ts-ignore
import { ActionCard, SpecialActionCards, actionCardTable, simulate } from "../model/cards.ts";
//@ts-ignore
import { nationsByName } from "../model/HistoryTracker.ts";


const Container = styled.div`
  display:flex;
`;

type CardSimulatorState = {
  actionCards: ActionCard[]
};

const stateStructure: CardSimulatorState = {
  actionCards: actionCardTable,
};

function ResetButton() {
  let navigate = useNavigate();

  function handleClick() {
    navigate("/cardDrawSimulator");
    navigate(0);
  }

  return (
    <Button type="button" size="small" color="inherit" onClick={handleClick}>Reset</Button>
  );
}



class CardSimulator extends React.Component<{}, CardSimulatorState> {
  createInitState() {
    const initState = stateStructure;
    return initState;
  }

  constructor(props) {
    super(props);
    this.state = this.createInitState();
    var locationMatch = window.location.search.match(/^\?([a-z0-9#!*|:=%]+)$/i);
    if (locationMatch) {
      const stateUrlUndecoded = decodeURIComponent(locationMatch[1]);
      console.log("reading state from url", stateUrlUndecoded);
      //      this.applyOccupiedStateString(this.state, stateUrlUndecoded);
    }
  }

  render() {

    const simulations = 1000;
    const result = simulate(simulations, 14 + 11 + 11 + 11, actionCardTable);

    const matchesCountry = (country: string, card: ActionCard) => {
      return (
        card.Influence2 === country || country === card.Influence1
        || (SpecialActionCards[card.Special] !== undefined &&
          SpecialActionCards[card.Special].type.indexOf("add") !== -1 &&
          (
            SpecialActionCards[card.Special].Axis.indexOf(country) !== -1 
//            || SpecialActionCards[card.Special].Axis.indexOf("ADJACENT") !== -1
          )
        )
      );
    }

    const hasXMatches = (country: string, cards: ActionCard[], expectedMatches: number) => {
      var count = 0;
      cards.forEach(card => (matchesCountry(country, card)) ? count++ : 0);
      return (count >= expectedMatches);
    }

    var matches = 0;
    var country = "Spain";
    result.forEach(hand => hasXMatches(country, hand, 4) ? matches++ : matches);

    var ts = {
      hello: "name",
      age: 4
    }


    return (
      <div className="App">
        <SiteAppBar title={"Tragedy & Triumph - Card Draw Simulator v1.2"} actionButton={
          <ResetButton />
        } />
        <Container>
          <p>{country} Matches: {matches} / {simulations}</p>
          <p>---</p>
          <p><textarea>{stringify(nationsByName["Spain"])}</textarea></p>
        </Container>
      </div>

    );
  }


}
export default CardSimulator;
