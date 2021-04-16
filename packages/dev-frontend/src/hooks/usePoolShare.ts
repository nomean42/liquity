import { useMemo } from "react";
import { Decimal, Decimalish } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { ILiquitySelector } from "@liquity/lib-react/src/hooks/useLiquitySelector";
import { parseDecimalishToNumber } from "../utils/number";

type IPoolShareSelector = ILiquitySelector<{
  currentAmount: Decimal;
  totalAmount: Decimalish;
}>;

interface IPoolShareStatus {
  poolShareAmount: number;
  poolShareChange?: number;
}

export const usePoolShare = (
  selector: IPoolShareSelector,
  editedLQTYAmount?: Decimal
): IPoolShareStatus => {
  const { currentAmount, totalAmount } = useLiquitySelector(selector);

  return useMemo(() => {
    const currentPoolShareAmount = parseDecimalishToNumber(
      currentAmount.mulDiv(100, totalAmount)
    );

    const newPoolShareAmount = editedLQTYAmount
      ? parseDecimalishToNumber(editedLQTYAmount.mulDiv(100, totalAmount))
      : currentPoolShareAmount;

    const poolShareChange =
      currentAmount.nonZero && newPoolShareAmount - currentPoolShareAmount;

    return {
      poolShareAmount: newPoolShareAmount,
      poolShareChange: poolShareChange,
    };
  }, [editedLQTYAmount, currentAmount, totalAmount]);
};
