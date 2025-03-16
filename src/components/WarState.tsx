import React, { useState } from 'react';
import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material'; // Import MUI components



const WarStateControls: React.FC<{ faction1: string, faction2: string, onWarChange: (faction1: string, faction2: string, state: "WAR" | "PEACE") => void }> = ({
  faction1,
  faction2,
  onWarChange
}) => {
  const [toggleState, setToggleState] = useState<boolean>(false);

  const handleToggleWar = (
    newValue: boolean
  ) => {
    setToggleState(newValue)
    const newState = newValue ? "WAR" : "PEACE";
    onWarChange(faction1, faction2, newState);
  };

  return (
    <Box >
      <FormGroup sx={{ display: "flex", flexDirection: "row" }}> {/* Group the switches */}
        <FormControlLabel
          control={
            <Switch
              checked={toggleState}
              onChange={(e) => handleToggleWar(e.target.checked)}
              name="axisVsWest"
            />
          }
          label={`${faction1} & ${faction2} ` + (toggleState ? "War" : "Peace")}
        />
      </FormGroup>
    </Box>
  );
};

export default WarStateControls;