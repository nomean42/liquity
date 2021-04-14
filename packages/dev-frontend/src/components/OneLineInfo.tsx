import React from "react";
import { Box, Flex, Label } from "theme-ui";
import { StaticAmounts, StaticAmountsProps } from "./Trove/Editor";

interface IInfoConfig extends StaticAmountsProps {
  title: React.ReactNode | string;
}

interface IProps {
  infoElements: IInfoConfig[];
}

const createInfoTitleElement = (title: IInfoConfig["title"]): React.ReactNode =>
  title ? (
    React.isValidElement(title) ? (
      title
    ) : (
      <Label sx={{ py: 0, px: 0, fontSize: 1 }}>{title}</Label>
    )
  ) : null;

const createInfoAmountElement = (
  props: StaticAmountsProps
): React.ReactNode => <StaticAmounts sx={{ p: "0" }} {...props} />;

export const OneLineInfo: React.FC<IProps> = ({ infoElements }) => (
  <Flex sx={{ p: 0, justifyContent: "space-between", alignItems: "center" }}>
    {infoElements.map(({ title, ...staticAmountProps }) => (
      <Box sx={{ px: 2 }}>
        {createInfoTitleElement(title)}
        {createInfoAmountElement(staticAmountProps)}
      </Box>
    ))}
  </Flex>
);
