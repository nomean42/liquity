import {
  Decimal,
  Difference,
  LiquityStoreState,
  StabilityDeposit,
  StabilityDepositChange,
} from "@liquity/lib-base";

import { Units } from "../../../strings";
import { Amount } from "../../ActionDescription";
import { ErrorDescription } from "../../ErrorDescription";
import { StabilityActionDescription } from "../StabilityActionDescription";

export const selectForStabilityDepositChangeValidation = ({
  trove,
  lusdBalance,
  ownFrontend,
  haveUndercollateralizedTroves,
}: LiquityStoreState) => ({
  trove,
  lusdBalance,
  haveOwnFrontend: ownFrontend.status === "registered",
  haveUndercollateralizedTroves,
});

type StabilityDepositChangeValidationContext = ReturnType<
  typeof selectForStabilityDepositChangeValidation
>;

export const validateStabilityDepositChange = (
  originalDeposit: StabilityDeposit,
  editedLUSD: Decimal,
  {
    lusdBalance,
    haveOwnFrontend,
    haveUndercollateralizedTroves,
  }: StabilityDepositChangeValidationContext,
  isKindStake: boolean
): [
  validChange: StabilityDepositChange<Decimal> | undefined,
  description: JSX.Element | undefined
] => {
  if (editedLUSD.isZero) {
    return [undefined, undefined];
  }

  if (haveOwnFrontend) {
    return [
      undefined,
      <ErrorDescription>
        You can’t deposit using a wallet address that is registered as a
        frontend.
      </ErrorDescription>,
    ];
  }

  const isDepositTooMuch = isKindStake && editedLUSD.gt(lusdBalance);
  const isWithdrawTooMuch =
    !isKindStake && editedLUSD.gt(originalDeposit.currentLUSD);

  if (isDepositTooMuch || isWithdrawTooMuch) {
    return [
      undefined,
      <ErrorDescription>
        {`The amount you're trying to ${
          isKindStake ? "deposit" : "withdraw"
        } exceeds your ${isKindStake ? "balance" : "deposit"} by `}
        <Amount>
          {Difference.between(
            isKindStake ? lusdBalance : originalDeposit.currentLUSD,
            editedLUSD
          )?.absoluteValue?.prettify()}{" "}
          {Units.COIN}
        </Amount>
        .
      </ErrorDescription>,
    ];
  }

  const change = isKindStake
    ? originalDeposit.getDepositChange(editedLUSD)
    : originalDeposit.getWithdrawChange(editedLUSD);

  if (!change) {
    return [undefined, undefined];
  }

  if (change.withdrawLUSD && haveUndercollateralizedTroves) {
    return [
      undefined,
      <ErrorDescription>
        You're not allowed to withdraw LUSD from your Stability Deposit when
        there are undercollateralized Troves. Please liquidate those Troves or
        try again later.
      </ErrorDescription>,
    ];
  }

  return [
    change,
    <StabilityActionDescription
      originalDeposit={originalDeposit}
      change={change}
    />,
  ];
};
