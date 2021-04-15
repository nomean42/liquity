import { usePoolShare } from "../../../hooks/usePoolShare";

export const useStakingPoolShare = (editedLQTYAmount?: number) =>
  usePoolShare(
    ({ lqtyStake, totalStakedLQTY }) => ({
      currentAmount: lqtyStake.stakedLQTY,
      totalAmount: totalStakedLQTY,
    }),
    editedLQTYAmount
  );
