import { createContext, useContext } from "react";
import type { StabilityView, StabilityEvent } from "./types";
import { StabilityDepositKind } from "../StabilityDepositManager";

type StabilityViewContextType = {
  view: StabilityView;
  kind?: StabilityDepositKind;
  dispatchEvent: (event: StabilityEvent, kind?: StabilityDepositKind) => void;
};

export const StabilityViewContext = createContext<StabilityViewContextType | null>(
  null
);

export const useStabilityView = (): StabilityViewContextType => {
  const context: StabilityViewContextType | null = useContext(
    StabilityViewContext
  );

  if (context === null) {
    throw new Error(
      "You must add a <StabilityViewProvider> into the React tree"
    );
  }

  return context;
};
