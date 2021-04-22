import React, { useCallback } from "react";

import { Decimal, LiquityStoreState, LQTYStake } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";

import { StakingInfoLine } from "./StakingInfoLine";
import { EditorInput } from "../EditorInput";

const select = ({ lqtyBalance }: LiquityStoreState) => ({
  lqtyBalance,
});

type StakingEditorProps = {
  stakedLQTY: LQTYStake["stakedLQTY"];
  editedLQTY: Decimal;
  dispatch: (
    action: { type: "setStake"; newValue: Decimal } | { type: "revert" }
  ) => void;
};

export const StakingEditor: React.FC<StakingEditorProps> = ({
  stakedLQTY,
  editedLQTY,
  dispatch,
  children,
}) => {
  const { lqtyBalance } = useLiquitySelector(select);
  const setEditedStake = useCallback(
    (newValue) => dispatch({ type: "setStake", newValue }),
    [dispatch]
  );
  const revert = useCallback(() => dispatch({ type: "revert" }), [
    dispatch,
  ]);

  return (
    <EditorInput
      title="Staking"
      originalStake={stakedLQTY}
      editedStake={editedLQTY}
      setEditedStake={setEditedStake}
      walletBalance={lqtyBalance}
      revert={revert}
      inputId="stake-lqty"
      unit={Units.GT}
    >
      {!stakedLQTY.isZero && <StakingInfoLine editedLQTYAmount={editedLQTY} />}
      {children}
    </EditorInput>
  );
};
