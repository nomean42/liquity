import { useMemo } from "react";
import { useLiquitySelector } from "@liquity/lib-react";
import { LiquityStoreState } from "@liquity/lib-base";
import { parseDecimalishToNumber } from "../../../utils/number";

const select = ({ lqtyStake, totalStakedLQTY }: LiquityStoreState) => ({
  lqtyStake,
  totalStakedLQTY,
});

interface IPoolShareStatus {
  poolShareAmount: number;
  poolShareChange?: number;
}

export const usePoolShare = (editedLQTYAmount?: number): IPoolShareStatus => {
  const { lqtyStake, totalStakedLQTY } = useLiquitySelector(select);

  return useMemo(() => {
    const currentPoolShareAmount = parseDecimalishToNumber(
      lqtyStake.stakedLQTY.mulDiv(100, totalStakedLQTY)
    );

    const newPoolShareAmount = editedLQTYAmount
      ? (editedLQTYAmount * 100) / parseDecimalishToNumber(totalStakedLQTY)
      : currentPoolShareAmount;

    const poolShareChange =
      lqtyStake.stakedLQTY.nonZero &&
      newPoolShareAmount - currentPoolShareAmount;

    return {
      poolShareAmount: newPoolShareAmount,
      poolShareChange: poolShareChange !== 0 ? poolShareChange : undefined,
    };
  }, [editedLQTYAmount, totalStakedLQTY, lqtyStake.stakedLQTY]);
};
