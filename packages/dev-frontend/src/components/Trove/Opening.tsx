import React, { useCallback, useEffect, useState } from "react";
import { Flex, Button, Box, Card, Heading } from "theme-ui";
import {
  LiquityStoreState,
  Decimal,
  Trove,
  LUSD_LIQUIDATION_RESERVE,
  LUSD_MINIMUM_NET_DEBT,
  Percent,
} from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { ActionDescription } from "../ActionDescription";
import { useMyTransactionState } from "../Transaction";
import { TroveAction } from "./TroveAction";
import { useTroveView } from "./context/TroveViewContext";
import { Units } from "../../strings";
import { Icon } from "../Icon";
import { LoadingOverlay } from "../LoadingOverlay";
import { CollateralRatioInfoLine } from "./CollateralRatioInfoLine";
import { EditableRow } from "./Editor";
import {
  selectForTroveChangeValidation,
  validateTroveChange,
} from "./validation/validateTroveChange";
import { TroveInfoLine } from "./TroveInfoLine";

const selector = (state: LiquityStoreState) => {
  const { fees, price, accountBalance } = state;
  return {
    fees,
    price,
    accountBalance,
    validationContext: selectForTroveChangeValidation(state),
  };
};

const EMPTY_TROVE = new Trove(Decimal.ZERO, Decimal.ZERO);
const TRANSACTION_ID = "trove-creation";
const GAS_ROOM_ETH = Decimal.from(0.1);

export const Opening: React.FC = () => {
  const { dispatchEvent } = useTroveView();
  const { fees, price, accountBalance, validationContext } = useLiquitySelector(
    selector
  );
  const borrowingRate = fees.borrowingRate();
  const editingState = useState<string>();

  const [collateral, setCollateral] = useState<Decimal>(Decimal.ZERO);
  const [borrowAmount, setBorrowAmount] = useState<Decimal>(Decimal.ZERO);

  const maxBorrowingRate = borrowingRate.add(0.005);

  const fee = borrowAmount.mul(borrowingRate);
  const feePct = new Percent(borrowingRate);
  const totalDebt = borrowAmount.add(LUSD_LIQUIDATION_RESERVE).add(fee);
  const isDirty = !collateral.isZero || !borrowAmount.isZero;
  const trove = isDirty ? new Trove(collateral, totalDebt) : EMPTY_TROVE;
  const maxEth = accountBalance.gt(GAS_ROOM_ETH)
    ? accountBalance.sub(GAS_ROOM_ETH)
    : Decimal.ZERO;
  const maxCollateral = collateral.add(maxEth);
  const collateralMaxedOut = collateral.eq(maxCollateral);
  const collateralRatio =
    !collateral.isZero && !borrowAmount.isZero
      ? trove.collateralRatio(price)
      : undefined;

  const [troveChange, description] = validateTroveChange(
    EMPTY_TROVE,
    trove,
    borrowingRate,
    validationContext
  );

  const transactionState = useMyTransactionState(TRANSACTION_ID);
  const isTransactionPending =
    transactionState.type === "waitingForApproval" ||
    transactionState.type === "waitingForConfirmation";

  const handleCancelPressed = useCallback(() => {
    dispatchEvent("CANCEL_ADJUST_TROVE_PRESSED");
  }, [dispatchEvent]);

  const reset = useCallback(() => {
    setCollateral(Decimal.ZERO);
    setBorrowAmount(Decimal.ZERO);
  }, []);

  useEffect(() => {
    if (!collateral.isZero && borrowAmount.isZero) {
      setBorrowAmount(LUSD_MINIMUM_NET_DEBT);
    }
  }, [collateral, borrowAmount]);

  return (
    <Card>
      <Heading>
        Trove
        {isDirty && !isTransactionPending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={reset}
          >
            <Icon name="history" size="lg" />
          </Button>
        )}
      </Heading>

      <Box sx={{ p: [2, 3] }}>
        <EditableRow
          label="Collateral"
          inputId="trove-collateral"
          amount={collateral.prettify(4)}
          maxAmount={maxCollateral.toString()}
          maxedOut={collateralMaxedOut}
          editingState={editingState}
          unit={Units.ETH}
          editedAmount={collateral.toString(4)}
          setEditedAmount={(amount: string) =>
            setCollateral(Decimal.from(amount))
          }
        />

        <EditableRow
          label="Borrow"
          inputId="trove-borrow-amount"
          amount={borrowAmount.prettify()}
          unit={Units.COIN}
          editingState={editingState}
          editedAmount={borrowAmount.toString(2)}
          setEditedAmount={(amount: string) =>
            setBorrowAmount(Decimal.from(amount))
          }
        />
        <TroveInfoLine
          fee={fee}
          totalDebt={totalDebt}
          isDirty={isDirty}
          borrowingRate={feePct.toString(2)}
        />
        <CollateralRatioInfoLine value={collateralRatio} />

        {description ?? (
          <ActionDescription>
            Start by entering the amount of ETH you'd like to deposit as
            collateral.
          </ActionDescription>
        )}

        <Flex variant="layout.actions">
          <Button variant="cancel" onClick={handleCancelPressed}>
            Cancel
          </Button>

          {troveChange ? (
            <TroveAction
              transactionId={TRANSACTION_ID}
              change={troveChange}
              maxBorrowingRate={maxBorrowingRate}
            >
              Confirm
            </TroveAction>
          ) : (
            <Button disabled>Confirm</Button>
          )}
        </Flex>
      </Box>
      {isTransactionPending && <LoadingOverlay />}
    </Card>
  );
};
