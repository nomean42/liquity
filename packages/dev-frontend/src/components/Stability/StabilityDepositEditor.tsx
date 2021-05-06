import React, { useCallback } from "react";

import {
  Decimal,
  Decimalish,
  StabilityDeposit,
  LiquityStoreState,
} from "@liquity/lib-base";

import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";

import { EditorInput } from "../EditorInput";
import { StabilityInfoLine } from "./StabilityInfoLine";

const selectLUSDBalance = ({ lusdBalance }: LiquityStoreState) => lusdBalance;

type StabilityDepositEditorProps = {
  originalDeposit: StabilityDeposit;
  editedLUSD: Decimal;
  changePending: boolean;
  isKindStake: boolean;
  dispatch: (
    action: { type: "setDeposit"; newValue: Decimalish } | { type: "revert" }
  ) => void;
};

export const StabilityDepositEditor: React.FC<StabilityDepositEditorProps> = ({
  originalDeposit,
  editedLUSD,
  changePending,
  dispatch,
  isKindStake,
  children,
}) => {
  const lusdBalance = useLiquitySelector(selectLUSDBalance);

  const setEditedStake = useCallback(
    (newValue) => dispatch({ type: "setDeposit", newValue }),
    [dispatch]
  );
  const revert = useCallback(() => dispatch({ type: "revert" }), [dispatch]);

  return (
    <EditorInput
      headingTitle="Stability Pool"
      staticRowLabel="Deposit"
      editableRowLabel={isKindStake ? "Deposit" : "Withdraw"}
      originalStake={originalDeposit.currentLUSD}
      editedStake={editedLUSD}
      setEditedStake={setEditedStake}
      walletBalance={lusdBalance}
      revert={revert}
      inputId="deposit-lqty"
      unit={Units.COIN}
      {...{ isKindStake, changePending }}
    >
      {!originalDeposit.initialLUSD.isZero && (
        <StabilityInfoLine editedLUSD={editedLUSD} />
      )}
      {children}
    </EditorInput>
  );
};
