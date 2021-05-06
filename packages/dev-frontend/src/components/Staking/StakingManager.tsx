import React from "react";
import { Button, Flex } from "theme-ui";

import {
  Decimal,
  Difference,
  LiquityStoreState,
  LQTYStake,
  LQTYStakeChange,
} from "@liquity/lib-base";

import {
  LiquityStoreUpdate,
  useLiquityReducer,
  useLiquitySelector,
} from "@liquity/lib-react";

import { Units } from "../../strings";

import { useStakingView } from "./context/StakingViewContext";
import { StakingEditor } from "./StakingEditor";
import { StakingManagerAction } from "./StakingManagerAction";
import { ActionDescription, Amount } from "../ActionDescription";
import { ErrorDescription } from "../ErrorDescription";

const init = ({ lqtyStake }: LiquityStoreState) => ({
  originalStake: lqtyStake,
  editedLQTY: Decimal.ZERO,
});

type StakeManagerState = ReturnType<typeof init>;
type StakeManagerAction =
  | LiquityStoreUpdate
  | { type: "revert" }
  | { type: "setStake"; newValue: Decimal };

const reduce = (
  state: StakeManagerState,
  action: StakeManagerAction
): StakeManagerState => {
  const { originalStake, editedLQTY } = state;

  switch (action.type) {
    case "setStake":
      return { ...state, editedLQTY: action.newValue };

    case "revert":
      return { ...state, editedLQTY: Decimal.ZERO };

    case "updateStore": {
      const {
        stateChange: { lqtyStake: updatedStake },
      } = action;

      if (updatedStake) {
        return {
          originalStake: updatedStake,
          editedLQTY: updatedStake.apply(originalStake.whatChanged(editedLQTY)),
        };
      }
    }
  }

  return state;
};

const selectLQTYBalance = ({ lqtyBalance }: LiquityStoreState) => lqtyBalance;

type StakingManagerActionDescriptionProps = {
  originalStake: LQTYStake;
  change: LQTYStakeChange<Decimal>;
};

const StakingManagerActionDescription: React.FC<StakingManagerActionDescriptionProps> = ({
  originalStake,
  change,
}) => {
  const stakeLQTY = change.stakeLQTY?.prettify().concat(" ", Units.GT);
  const unstakeLQTY = change.unstakeLQTY?.prettify().concat(" ", Units.GT);
  const collateralGain = originalStake.collateralGain.nonZero
    ?.prettify(4)
    .concat(" ETH");
  const lusdGain = originalStake.lusdGain.nonZero
    ?.prettify()
    .concat(" ", Units.COIN);

  if (originalStake.isEmpty && stakeLQTY) {
    return (
      <ActionDescription>
        You are staking <Amount>{stakeLQTY}</Amount>.
      </ActionDescription>
    );
  }

  return (
    <ActionDescription>
      {stakeLQTY && (
        <>
          You are adding <Amount>{stakeLQTY}</Amount> to your stake
        </>
      )}
      {unstakeLQTY && (
        <>
          You are withdrawing <Amount>{unstakeLQTY}</Amount> to your wallet
        </>
      )}
      {(collateralGain || lusdGain) && (
        <>
          {" "}
          and claiming{" "}
          {collateralGain && lusdGain ? (
            <>
              <Amount>{collateralGain}</Amount> and <Amount>{lusdGain}</Amount>
            </>
          ) : (
            <>
              <Amount>{collateralGain ?? lusdGain}</Amount>
            </>
          )}
        </>
      )}
      .
    </ActionDescription>
  );
};

export const StakingManager: React.FC = () => {
  const { dispatch: dispatchStakingViewAction, kind } = useStakingView();
  const [{ originalStake, editedLQTY }, dispatch] = useLiquityReducer(
    reduce,
    init
  );
  const lqtyBalance = useLiquitySelector(selectLQTYBalance);
  const isKindStake = kind === "STAKE";
  const { stakedLQTY } = originalStake;

  const getValidChange = (): [
    LQTYStakeChange<Decimal> | undefined,
    React.ReactNode
  ] => {
    if (editedLQTY.isZero) {
      return [undefined, undefined];
    }

    const isStakeTooMuch = isKindStake && editedLQTY.gt(lqtyBalance);
    const isWithdrawTooMuch = !isKindStake && editedLQTY.gt(stakedLQTY);

    if (isStakeTooMuch || isWithdrawTooMuch) {
      return [
        undefined,
        <ErrorDescription>
          {`The amount you're trying to ${
            isKindStake ? "stake" : "withdraw"
          } exceeds your ${isKindStake ? "balance" : "stake"} by `}
          <Amount>
            {Difference.between(
              stakedLQTY,
              editedLQTY
            )?.absoluteValue?.prettify()}{" "}
            {Units.GT}
          </Amount>
          .
        </ErrorDescription>,
      ];
    }

    const change = isKindStake
      ? originalStake.getStakeChange(editedLQTY)
      : originalStake.getWithdrawChange(editedLQTY);

    return change
      ? [
          change,
          <StakingManagerActionDescription
            originalStake={originalStake}
            change={change}
          />,
        ]
      : [undefined, undefined];
  };
  const [validChange, description] = getValidChange();

  const actionTitle = isKindStake ? "Stake" : "Withdraw";

  return (
    <StakingEditor
      {...{
        stakedLQTY,
        editedLQTY: isKindStake
          ? stakedLQTY.add(editedLQTY)
          : editedLQTY.gt(stakedLQTY)
          ? Decimal.ZERO
          : stakedLQTY.sub(editedLQTY),
        dispatch,
      }}
    >
      {description}
      <Flex variant="layout.actions">
        <Button
          variant="cancel"
          onClick={() =>
            dispatchStakingViewAction({ type: "cancelAdjusting", kind })
          }
        >
          Cancel
        </Button>

        {validChange ? (
          <StakingManagerAction change={validChange}>
            {actionTitle}
          </StakingManagerAction>
        ) : (
          <Button disabled>{actionTitle}</Button>
        )}
      </Flex>
    </StakingEditor>
  );
};
