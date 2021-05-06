import React, { useCallback } from "react";

import { Decimal, LiquityStoreState, LQTYStake } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";

import { StakingInfoLine } from "./StakingInfoLine";
import { EditorInput } from "../EditorInput";
import { useStakingView } from "./context/StakingViewContext";

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
  const { changePending, kind } = useStakingView();
  const isKindStake = kind === "STAKE";

  const { lqtyBalance } = useLiquitySelector(select);
  const setEditedStake = useCallback(
    (newValue) => dispatch({ type: "setStake", newValue }),
    [dispatch]
  );
  const revert = useCallback(() => dispatch({ type: "revert" }), [dispatch]);

  return (
    <EditorInput
      headingTitle="Staking"
      staticRowLabel="Stake"
      editableRowLabel={isKindStake ? "Stake" : "Withdraw"}
      originalStake={stakedLQTY}
      editedStake={editedLQTY}
      setEditedStake={setEditedStake}
      walletBalance={lqtyBalance}
      revert={revert}
      inputId="stake-lqty"
      unit={Units.GT}
      {...{ isKindStake, changePending }}
    >
      {!stakedLQTY.isZero && <StakingInfoLine editedLQTYAmount={editedLQTY} />}
      {children}
    </EditorInput>
  );
};
