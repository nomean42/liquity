import React from "react";
import { Units } from "../../strings";
import { OneLineInfo } from "../OneLineInfo";
import { useLiquitySelector } from "@liquity/lib-react";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { usePoolShareInfo } from "../../hooks/usePoolShareInfo";

interface IProps {
  editedLQTYAmount?: Decimal;
}

const select = ({ lqtyStake }: LiquityStoreState) => lqtyStake;
const poolShareSelector = ({
  lqtyStake,
  totalStakedLQTY,
}: LiquityStoreState) => ({
  currentAmount: lqtyStake.stakedLQTY,
  totalAmount: totalStakedLQTY,
});

export const StakingInfoLine: React.FC<IProps> = ({ editedLQTYAmount }) => {
  const lqtyStake = useLiquitySelector(select);
  const poolShareInfo = usePoolShareInfo(
    poolShareSelector,
    editedLQTYAmount,
    !lqtyStake.stakedLQTY.isZero,
    "stake-share"
  );

  return (
    <OneLineInfo
      infoElements={[
        poolShareInfo,
        {
          title: "Redemption gain",
          inputId: "stake-gain-eth",
          amount: lqtyStake.collateralGain.prettify(4),
          color: lqtyStake.collateralGain.nonZero && "success",
          unit: Units.ETH,
        },
        {
          title: "Issuance gain",
          inputId: "stake-gain-lusd",
          amount: lqtyStake.lusdGain.prettify(),
          color: lqtyStake.lusdGain.nonZero && "success",
          unit: Units.COIN,
        },
      ]}
    />
  );
};
