import React, { useCallback, useEffect } from "react";
import { Button, Flex } from "theme-ui";

import {
  Decimal,
  Decimalish,
  LiquityStoreState,
  StabilityDeposit,
} from "@liquity/lib-base";
import {
  LiquityStoreUpdate,
  useLiquityReducer,
  useLiquitySelector,
} from "@liquity/lib-react";

import { Units } from "../../strings";

import { ActionDescription } from "../ActionDescription";
import { useMyTransactionState } from "../Transaction";

import { StabilityDepositEditor } from "./StabilityDepositEditor";
import { StabilityDepositAction } from "./StabilityDepositAction";
import { useStabilityView } from "./context/StabilityViewContext";
import {
  selectForStabilityDepositChangeValidation,
  validateStabilityDepositChange,
} from "./validation/validateStabilityDepositChange";

interface StabilityDepositManagerState {
  originalDeposit: StabilityDeposit;
  editedLUSD: Decimal;
  changePending: boolean;
  kind?: StabilityDepositKind;
}

const init = ({
  stabilityDeposit,
}: LiquityStoreState): StabilityDepositManagerState => ({
  originalDeposit: stabilityDeposit,
  editedLUSD: Decimal.ZERO,
  changePending: false,
});

export type StabilityDepositKind = "DEPOSIT" | "WITHDRAW";
type StabilityDepositManagerAction =
  | LiquityStoreUpdate
  | {
      type: "startChange" | "finishChange" | "revert";
      kind?: StabilityDepositKind;
    }
  | { type: "setDeposit"; newValue: Decimalish };

const reduceWith = (action: StabilityDepositManagerAction) => (
  state: StabilityDepositManagerState
): StabilityDepositManagerState => reduce(state, action);

const finishChange = reduceWith({ type: "finishChange" });
const revert = reduceWith({ type: "revert" });

const reduce = (
  state: StabilityDepositManagerState,
  action: StabilityDepositManagerAction
): StabilityDepositManagerState => {
  const { originalDeposit, editedLUSD, changePending } = state;

  switch (action.type) {
    case "startChange": {
      return { ...state, changePending: true, kind: action.kind };
    }

    case "finishChange":
      return { ...state, changePending: false };

    case "setDeposit":
      return { ...state, editedLUSD: Decimal.from(action.newValue) };

    case "revert":
      return { ...state, editedLUSD: originalDeposit.currentLUSD };

    case "updateStore": {
      const {
        stateChange: { stabilityDeposit: updatedDeposit },
      } = action;

      if (!updatedDeposit) {
        return state;
      }

      const newState = { ...state, originalDeposit: updatedDeposit };

      const changeCommitted =
        !updatedDeposit.initialLUSD.eq(originalDeposit.initialLUSD) ||
        updatedDeposit.currentLUSD.gt(originalDeposit.currentLUSD) ||
        updatedDeposit.collateralGain.lt(originalDeposit.collateralGain) ||
        updatedDeposit.lqtyReward.lt(originalDeposit.lqtyReward);

      if (changePending && changeCommitted) {
        return finishChange(revert(newState));
      }

      return {
        ...newState,
        editedLUSD: updatedDeposit.apply(
          originalDeposit.whatChanged(editedLUSD)
        ),
      };
    }
  }
};

const transactionId = "stability-deposit";

export const StabilityDepositManager: React.FC = () => {
  const [
    { originalDeposit, editedLUSD, changePending },
    dispatch,
  ] = useLiquityReducer(reduce, init);
  const validationContext = useLiquitySelector(
    selectForStabilityDepositChangeValidation
  );
  const { dispatchEvent, kind } = useStabilityView();

  const handleCancel = useCallback(() => {
    dispatchEvent("CANCEL_PRESSED");
  }, [dispatchEvent]);

  const isKindStake = kind === "DEPOSIT";
  const [validChange, description] = validateStabilityDepositChange(
    originalDeposit,
    editedLUSD,
    validationContext,
    isKindStake
  );

  const makingNewDeposit = originalDeposit.isEmpty;

  const myTransactionState = useMyTransactionState(transactionId);

  useEffect(() => {
    if (
      myTransactionState.type === "waitingForApproval" ||
      myTransactionState.type === "waitingForConfirmation"
    ) {
      dispatch({ type: "startChange" });
    } else if (
      myTransactionState.type === "failed" ||
      myTransactionState.type === "cancelled"
    ) {
      dispatch({ type: "finishChange" });
    } else if (myTransactionState.type === "confirmedOneShot") {
      dispatchEvent("DEPOSIT_CONFIRMED");
    }
  }, [myTransactionState.type, dispatch, dispatchEvent]);

  const editedLUSDNormalized = isKindStake
    ? originalDeposit.currentLUSD.add(editedLUSD)
    : editedLUSD.gte(originalDeposit.currentLUSD)
    ? Decimal.ZERO
    : originalDeposit.currentLUSD.sub(editedLUSD);

  return (
    <StabilityDepositEditor
      originalDeposit={originalDeposit}
      editedLUSD={editedLUSDNormalized}
      changePending={changePending}
      dispatch={dispatch}
      isKindStake={isKindStake}
    >
      {description ??
        (makingNewDeposit ? (
          <ActionDescription>
            Enter the amount of {Units.COIN} you'd like to deposit.
          </ActionDescription>
        ) : (
          <ActionDescription>
            Adjust the {Units.COIN} amount to deposit or withdraw.
          </ActionDescription>
        ))}

      <Flex variant="layout.actions">
        <Button variant="cancel" onClick={handleCancel}>
          Cancel
        </Button>

        {validChange ? (
          <StabilityDepositAction
            transactionId={transactionId}
            change={validChange}
          >
            Confirm
          </StabilityDepositAction>
        ) : (
          <Button disabled>Confirm</Button>
        )}
      </Flex>
    </StabilityDepositEditor>
  );
};
