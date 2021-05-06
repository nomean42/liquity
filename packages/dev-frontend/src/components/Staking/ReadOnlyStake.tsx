import { Heading, Box, Card, Flex, Button } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";

import { DisabledEditableRow } from "../Trove/Editor";
import { LoadingOverlay } from "../LoadingOverlay";

import { useStakingView } from "./context/StakingViewContext";
import { StakingGainsAction } from "./StakingGainsAction";
import React from "react";
import { StakingInfoLine } from "./StakingInfoLine";

const selectLQTYStake = ({ lqtyStake }: LiquityStoreState) => lqtyStake;

export const ReadOnlyStake: React.FC = () => {
  const { changePending, dispatch } = useStakingView();
  const lqtyStake = useLiquitySelector(selectLQTYStake);

  return (
    <Card>
      <Heading>Staking</Heading>

      <Box sx={{ p: [2, 3] }}>
        <DisabledEditableRow
          label="Stake"
          inputId="stake-lqty"
          amount={lqtyStake.stakedLQTY.prettify()}
          unit={Units.GT}
        />
        <StakingInfoLine />
        <Flex sx={{ mt: 2, justifyContent: "space-between" }}>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "startAdjusting", kind: "STAKE" })}
          >
            Stake
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              dispatch({ type: "startAdjusting", kind: "WITHDRAW" })
            }
          >
            Withdraw
          </Button>

          <StakingGainsAction />
        </Flex>
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
