import { useMemo } from "react";
import { Decimal } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { ILiquitySelector } from "@liquity/lib-react/src/hooks/useLiquitySelector";
import { parseDecimalishToNumber, prettifyNumber } from "../utils/number";
import { IInfoConfig } from "../components/OneLineInfo";
import { Units } from "../strings";

type IPoolShareSelector = ILiquitySelector<{
  currentAmount: Decimal;
  totalAmount: Decimal;
}>;

export const usePoolShareInfo = (
  selector: IPoolShareSelector,
  editedLQTYAmount?: Decimal,
  needShowPoolShare = true,
  inputId = "share"
): IInfoConfig => {
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

    return needShowPoolShare
      ? {
          title: "Pool share",
          inputId,
          amount: prettifyNumber(newPoolShareAmount),
          pendingAmount: poolShareChange
            ? prettifyNumber(poolShareChange) + "%"
            : undefined,
          pendingColor:
            poolShareChange && poolShareChange > 0 ? "success" : "danger",
          unit: Units.PERCENT,
        }
      : {
          title: "Pool share",
          inputId: "deposit-share",
          amount: "N/A",
        };
  }, [
    editedLQTYAmount,
    currentAmount,
    totalAmount,
    needShowPoolShare,
    inputId,
  ]);
};
