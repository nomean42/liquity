import React from "react";
import { Button, Flex } from "theme-ui";

import {
  Decimal,
  Decimalish,
  LiquityStoreState,
  LQTYStake,
  LQTYStakeChange,
} from "@liquity/lib-base";

import {
  LiquityStoreUpdate,
  useLiquityReducer,
  useLiquitySelector,
} from "@liquity/lib-react";

import { GT, COIN } from "../../strings";

import { useStakingView } from "./context/StakingViewContext";
import {
  parseDecimalishToNumber,
  prettifyNumber,
  StakingEditor,
} from "./StakingEditor";
import { StakingManagerAction } from "./StakingManagerAction";
import { ActionDescription, Amount } from "../ActionDescription";
import { ErrorDescription } from "../ErrorDescription";

const init = ({ lqtyStake }: LiquityStoreState) => ({
  originalStake: lqtyStake,
  editedLQTY: lqtyStake.stakedLQTY as Decimalish,
});

type StakeManagerState = ReturnType<typeof init>;
type StakeManagerAction =
  | LiquityStoreUpdate
  | { type: "revert" }
  | { type: "setStake"; newValue: Decimalish };

const reduce = (
  state: StakeManagerState,
  action: StakeManagerAction
): StakeManagerState => {
  // console.log(state);
  // console.log(action);

  const { originalStake, editedLQTY } = state;

  switch (action.type) {
    case "setStake":
      return { ...state, editedLQTY: action.newValue };

    case "revert":
      return { ...state, editedLQTY: 0 };

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
  const stakeLQTY = change.stakeLQTY?.prettify().concat(" ", GT);
  const unstakeLQTY = change.unstakeLQTY?.prettify().concat(" ", GT);
  const collateralGain = originalStake.collateralGain.nonZero
    ?.prettify(4)
    .concat(" ETH");
  const lusdGain = originalStake.lusdGain.nonZero?.prettify().concat(" ", COIN);

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
  const [
    { originalStake, editedLQTY: editedLQTYOriginal },
    dispatch,
  ] = useLiquityReducer(reduce, init);
  const editedLQTY = parseDecimalishToNumber(editedLQTYOriginal);
  const stakedLQTY = parseDecimalishToNumber(originalStake.stakedLQTY);
  const lqtyBalance = parseDecimalishToNumber(
    useLiquitySelector(selectLQTYBalance)
  );
  const isStakeKind = kind === "STAKE";

  const editedDiffLQTY = isStakeKind
    ? editedLQTY - stakedLQTY
    : stakedLQTY - editedLQTY;

  const getValidChange = (): [
    LQTYStakeChange<Decimal> | undefined,
    React.ReactNode
  ] => {
    const change = isStakeKind
      ? originalStake.getStakeChange(editedDiffLQTY)
      : originalStake.getWithdrawChange(editedDiffLQTY);

    if (!change) {
      return [undefined, undefined];
    }

    if (isStakeKind && editedDiffLQTY > lqtyBalance) {
      return [
        undefined,
        <ErrorDescription>
          The amount you're trying to stake exceeds your balance by{" "}
          <Amount>
            {prettifyNumber(editedLQTY - stakedLQTY)} {GT}
          </Amount>
          .
        </ErrorDescription>,
      ];
    }

    if (!isStakeKind && editedDiffLQTY > stakedLQTY) {
      return [
        undefined,
        <ErrorDescription>
          The amount you're trying to withdraw exceeds your stake by{" "}
          <Amount>
            {prettifyNumber(editedDiffLQTY - stakedLQTY)} {GT}
          </Amount>
          .
        </ErrorDescription>,
      ];
    }

    return [
      change,
      <StakingManagerActionDescription
        originalStake={originalStake}
        change={change}
      />,
    ];
  };
  const [validChange, description] = getValidChange();

  const actionTitle = isStakeKind ? "Stake" : "Withdraw";

  return (
    <StakingEditor title="Staking" {...{ originalStake, editedLQTY, dispatch }}>
      {description ?? (
        <ActionDescription>
          Enter the amount of {GT} you'd like{" "}
          {isStakeKind ? "stake" : "withdraw"}.
        </ActionDescription>
      )}

      <Flex variant="layout.actions">
        <Button
          variant="cancel"
          onClick={() =>
            dispatchStakingViewAction({ type: "cancelAdjusting", kind })
          }
        >
          Cancel
        </Button>

        {validChange && editedDiffLQTY !== 0 ? (
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
