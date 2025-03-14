import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Slide, { SlideProps } from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

// Transition component now wraps the dialog content
const Transition = React.forwardRef<HTMLDivElement, TransitionProps>(
  function Transition(props: TransitionProps, ref: React.ForwardedRef<HTMLDivElement>) {
    return (
      <Slide direction="up" ref={ref} {...props}>
        {/* Wrap children in a div.  Slide *requires* a single child. */}
        <div>{props.children}</div>
      </Slide>
    );
  }
);

interface HelpDialogSlideProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export const HelpDialogSlide: React.FC<HelpDialogSlideProps> = (props) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="inherit" onClick={handleClickOpen}>Help</Button>
      <Dialog
        open={open}
        TransitionComponent={Transition} // Use our custom transition
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>{props.content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};