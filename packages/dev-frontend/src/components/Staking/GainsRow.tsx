import React from "react";
import { Flex, Label } from "theme-ui";
import { StaticAmounts } from "../Trove/Editor";
import { Units } from "../../strings";
import { LQTYStake } from "@liquity/lib-base/src/LQTYStake";

type IProps = { lqtyStake: LQTYStake | any };

export const GainsRow: React.FC<IProps> = ({ lqtyStake }) => (
  <>
    <Flex sx={{ px: 0, py: 0, justifyContent: "space-between" }}>
      <Label sx={{ py: 0, fontSize: 1 }}>Redemption gain</Label>
      <Label sx={{ py: 0, fontSize: 1 }}>Issuance gain</Label>
    </Flex>
    <Flex sx={{ lineHeight: 1, pb: 3, justifyContent: "space-between" }}>
      <StaticAmounts
        sx={{ pt: "0", pl: "2" }}
        inputId="stake-gain-eth"
        amount={lqtyStake.collateralGain.prettify(4)}
        color={lqtyStake.collateralGain.nonZero && "success"}
        unit={Units.ETH}
      />
      <StaticAmounts
        sx={{ pt: "0", pr: "2" }}
        labelledBy="Issuance gain"
        inputId="stake-gain-lusd"
        amount={lqtyStake.lusdGain.prettify()}
        color={lqtyStake.lusdGain.nonZero && "success"}
        unit={Units.COIN}
      />
    </Flex>
  </>
);
