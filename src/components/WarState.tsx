import React, { useState } from 'react';
import { Box, FormControlLabel, FormGroup, Switch, useMediaQuery } from '@mui/material'; // Import MUI components



const WarStateControls: React.FC<{ faction1: string, faction2: string, onWarChange: (faction1: string, faction2: string, state: "WAR" | "PEACE") => void }> = ({
  faction1,
  faction2,
  onWarChange
}) => {
  const [toggleState, setToggleState] = useState<boolean>(false);

  const isSmallScreen = useMediaQuery('(max-width:600px)'); // Adjust breakpoint as needed
  const isMediumScreen = useMediaQuery('(max-width:900px)');

  const handleToggleWar = (
    newValue: boolean
  ) => {
    setToggleState(newValue)
    const newState = newValue ? "WAR" : "PEACE";
    onWarChange(faction1, faction2, newState);
  };

  const flabel1 = isSmallScreen || isMediumScreen ? faction1.substring(0, 1) : faction1;
  const flabel2 = isSmallScreen || isMediumScreen ? faction2.substring(0, 1) : faction2;

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
          label={`${flabel1} & ${flabel2} ` + (toggleState ? "War" : "Peace")}
        />
      </FormGroup>
    </Box>
  );
};

export default WarStateControls;