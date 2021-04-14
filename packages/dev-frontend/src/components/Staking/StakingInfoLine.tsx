import React from "react";
import { COIN, ETH } from "../../strings";
import { OneLineInfo } from "../OneLineInfo";
import { prettifyNumber } from "../../utils/number";
import { usePoolShare } from "./hooks/usePoolShare";
import {useLiquitySelector} from "@liquity/lib-react";
import {LiquityStoreState} from "@liquity/lib-base";

interface IProps {
  editedLQTYAmount?: number;
}

const select = ({ lqtyStake }: LiquityStoreState) => ({
  lqtyStake,
});

export const StakingInfoLine: React.FC<IProps> = ({ editedLQTYAmount }) => {
  const { lqtyStake } = useLiquitySelector(select);
  const { poolShareAmount, poolShareChange } = usePoolShare(editedLQTYAmount);

  return (
    <OneLineInfo
      infoElements = {[
        poolShareAmount !== 0
          ? {
            title: "Pool share",
            inputId: "stake-share",
            amount: prettifyNumber(poolShareAmount),
            pendingAmount:
              poolShareChange && poolShareChange !== 0 ? prettifyNumber(poolShareChange) + "%" : undefined,
            pendingColor:
              poolShareChange && poolShareChange > 0 ? "success" : "danger",
            unit: "%",
          }
          : {
            title: "Pool share",
            inputId: "stake-share",
            amount: "N/A",
          },
        {
          title: "Redemption gain",
          inputId: "stake-gain-eth",
          amount: lqtyStake.collateralGain.prettify(4),
          color: lqtyStake.collateralGain.nonZero && "success",
          unit: ETH,
        },
        {
          title: "Issuance gain",
          inputId: "stake-gain-lusd",
          amount: lqtyStake.lusdGain.prettify(),
          color: lqtyStake.lusdGain.nonZero && "success",
          unit: COIN,
        },
      ]}
    />
  );
};

