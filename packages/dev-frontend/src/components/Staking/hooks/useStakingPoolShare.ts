import { Decimal } from "@liquity/lib-base";
import { usePoolShare } from "../../../hooks/usePoolShare";

export const useStakingPoolShare = (editedLQTYAmount?: Decimal) =>
  usePoolShare(
    ({ lqtyStake, totalStakedLQTY }) => ({
      currentAmount: lqtyStake.stakedLQTY,
      totalAmount: totalStakedLQTY,
    }),
    editedLQTYAmount
  );
