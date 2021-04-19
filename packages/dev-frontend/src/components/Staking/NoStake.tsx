import { Card, Heading, Box, Flex, Button } from "theme-ui";

import { Units } from "../../strings";

import { InfoMessage } from "../InfoMessage";
import { useStakingView } from "./context/StakingViewContext";

export const NoStake: React.FC = () => {
  const { dispatch } = useStakingView();

  return (
    <Card>
      <Heading>Staking</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title={`You haven't staked ${Units.GT} yet.`}>
          Stake {Units.GT} to earn a share of borrowing and redemption
          fees.
        </InfoMessage>

        <Flex variant="layout.actions">
          <Button
            onClick={() => dispatch({ type: "startAdjusting", kind: "STAKE" })}
          >
            Start staking
          </Button>
        </Flex>
      </Box>
    </Card>
  );
};
