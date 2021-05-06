import React, { useCallback, useEffect } from "react";
import { Card, Heading, Box, Flex, Button } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";
import { LoadingOverlay } from "../LoadingOverlay";
import { useMyTransactionState } from "../Transaction";
import { DisabledEditableRow } from "../Trove/Editor";
import { ClaimAndMove } from "./actions/ClaimAndMove";
import { ClaimRewards } from "./actions/ClaimRewards";
import { useStabilityView } from "./context/StabilityViewContext";
import { RemainingLQTY } from "./RemainingLQTY";
import { Yield } from "./Yield";
import { StabilityInfoLine } from "./StabilityInfoLine";
import { StabilityDepositKind } from "./StabilityDepositManager";

const selector = ({ stabilityDeposit, trove }: LiquityStoreState) => ({
  stabilityDeposit,
  trove,
});

export const ActiveDeposit: React.FC = () => {
  const { dispatchEvent } = useStabilityView();
  const { stabilityDeposit, trove } = useLiquitySelector(selector);

  const handleAdjustDeposit = useCallback(
    (kind: StabilityDepositKind) => {
      dispatchEvent("ADJUST_DEPOSIT_PRESSED", kind);
    },
    [dispatchEvent]
  );

  const hasReward = !stabilityDeposit.lqtyReward.isZero;
  const hasGain = !stabilityDeposit.collateralGain.isZero;
  const hasTrove = !trove.isEmpty;

  const transactionId = "stability-deposit";
  const transactionState = useMyTransactionState(transactionId);
  const isWaitingForTransaction =
    transactionState.type === "waitingForApproval" ||
    transactionState.type === "waitingForConfirmation";

  useEffect(() => {
    if (transactionState.type === "confirmedOneShot") {
      dispatchEvent("REWARDS_CLAIMED");
    }
  }, [transactionState.type, dispatchEvent]);

  return (
    <Card>
      <Heading>
        Stability Pool
        {!isWaitingForTransaction && (
          <Flex sx={{ justifyContent: "flex-end" }}>
            <RemainingLQTY />
          </Flex>
        )}
      </Heading>
      <Box sx={{ p: [2, 3] }}>
        <Box>
          <DisabledEditableRow
            label="Deposit"
            inputId="deposit-lusd"
            amount={stabilityDeposit.currentLUSD.prettify()}
            unit={Units.COIN}
          />
          <StabilityInfoLine />
          <Flex sx={{ justifyContent: "flex-end", flex: 1 }}>
            <Yield />
          </Flex>
        </Box>

        <Flex sx={{ mt: 2, justifyContent: "space-between" }}>
          <Button
            variant="outline"
            onClick={() => handleAdjustDeposit("DEPOSIT")}
          >
            Deposit
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAdjustDeposit("WITHDRAW")}
          >
            Withdraw
          </Button>

          <ClaimRewards disabled={!hasGain && !hasReward}>Claim</ClaimRewards>
        </Flex>

        {hasTrove && (
          <ClaimAndMove disabled={!hasGain}>
            Claim LQTY and move ETH to Trove
          </ClaimAndMove>
        )}
      </Box>

      {isWaitingForTransaction && <LoadingOverlay />}
    </Card>
  );
};
