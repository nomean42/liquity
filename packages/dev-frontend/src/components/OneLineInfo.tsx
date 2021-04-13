import React from "react";
import { Flex, Label } from "theme-ui";
import { StaticAmounts } from "./Trove/Editor";

interface IInfoConfig {
  title: React.ReactNode | string;
  inputId: string;
  amount: string;
  colorGetter: () => string;
  unit: string;
}

interface IProps {
  infoElements: IInfoConfig[];
}

const createInfoTitleElement = (title: IInfoConfig["title"]): React.ReactNode =>
  title ? (
    React.isValidElement(title) ? (
      title
    ) : (
      <Label sx={{ py: 0, fontSize: 1 }}>{title}</Label>
    )
  ) : null;

const createInfoAmountElement = (
  inputId: IInfoConfig["inputId"],
  amount: IInfoConfig["amount"],
  colorGetter: IInfoConfig["colorGetter"],
  unit: IInfoConfig["unit"]
): React.ReactNode => (
  <StaticAmounts
    sx={{ pt: "0", pl: "2" }}
    inputId={inputId}
    amount={amount}
    color={colorGetter()}
    unit={unit}
  />
);

export const OneLineInfo: React.FC<IProps> = ({ infoElements }) => {
  const { titles, amounts } = infoElements.reduce<{
    titles: React.ReactNode[];
    amounts: React.ReactNode[];
  }>(
    (acc, { title, inputId, amount, colorGetter, unit }) => {
      acc.titles.push(createInfoTitleElement(title));
      acc.amounts.push(
        createInfoAmountElement(inputId, amount, colorGetter, unit)
      );

      return acc;
    },
    { titles: [], amounts: [] }
  );

  return (
    <>
      <Flex sx={{ px: 0, py: 0, justifyContent: "space-between" }}>
        {titles}
      </Flex>
      <Flex sx={{ lineHeight: 1, pb: 3, justifyContent: "space-between" }}>
        {amounts}
      </Flex>
    </>
  );
};
