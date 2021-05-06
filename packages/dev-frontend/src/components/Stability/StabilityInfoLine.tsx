import React from "react";
import { Units } from "../../strings";
import { OneLineInfo } from "../OneLineInfo";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { usePoolShareInfo } from "../../hooks/usePoolShareInfo";
import { useLiquitySelector } from "@liquity/lib-react";
import { InfoIcon } from "../InfoIcon";
import { Card } from "theme-ui";

interface IProps {
  editedLUSD?: Decimal;
}

const selectLUSDBalance = ({
  lusdBalance,
  stabilityDeposit,
}: LiquityStoreState) => ({
  stabilityDeposit,
  lusdBalance,
});

const poolShareSelector = ({
  stabilityDeposit,
  lusdInStabilityPool,
}: LiquityStoreState) => ({
  currentAmount: stabilityDeposit.currentLUSD,
  totalAmount: lusdInStabilityPool,
});

export const StabilityInfoLine: React.FC<IProps> = ({ editedLUSD }) => {
  const { lusdBalance, stabilityDeposit } = useLiquitySelector(
    selectLUSDBalance
  );

  const poolShareInfo = usePoolShareInfo(
    poolShareSelector,
    editedLUSD,
    !lusdBalance.isZero,
    "deposit-share"
  );

  return (
    <OneLineInfo
      infoElements={[
        poolShareInfo,
        {
          title: "Liquidation gain",
          inputId: "deposit-gain",
          amount: stabilityDeposit.collateralGain.prettify(4),
          color: stabilityDeposit.collateralGain.nonZero && "success",
          unit: Units.ETH,
        },
        {
          title: "Reward",
          inputId: "deposit-reward",
          amount: stabilityDeposit.lqtyReward.prettify(),
          color: stabilityDeposit.lqtyReward.nonZero && "success",
          unit: Units.GT,
          infoIcon: (
            <InfoIcon
              tooltip={
                <Card variant="tooltip" sx={{ width: "240px" }}>
                  Although the LQTY rewards accrue every minute, the value on
                  the UI only updates when a user transacts with the Stability
                  Pool. Therefore you may receive more rewards than is displayed
                  when you claim or adjust your deposit.
                </Card>
              }
            />
          ),
        },
      ]}
    />
  );
};
