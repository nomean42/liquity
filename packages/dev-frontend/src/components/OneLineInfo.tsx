import React from "react";
import { Box, Flex, Label } from "theme-ui";
import { StaticAmounts, StaticAmountsProps } from "./Trove/Editor";
import {InfoIconProps} from "./InfoIcon";

export interface IInfoConfig extends StaticAmountsProps {
  title: React.ReactNode | string;
  infoIcon?: React.ReactElement<InfoIconProps>;
}

interface IProps {
  infoElements: IInfoConfig[];
}

const createInfoTitleElement = (
  title: IInfoConfig["title"],
  infoIcon: IInfoConfig["infoIcon"]
): React.ReactNode => {
  const titleNode = title ? (
    React.isValidElement(title) ? (
      title
    ) : (
      <Label sx={{ py: 0, px: 0, fontSize: 1 }}>{title}</Label>
    )
  ) : null;

  return (
    <Flex sx={{ alignItems: "center" }}>
      {titleNode}
      {infoIcon}
    </Flex>
  );
};

const createInfoAmountElement = (
  props: StaticAmountsProps
): React.ReactNode => <StaticAmounts sx={{ p: "0" }} {...props} />;

export const OneLineInfo: React.FC<IProps> = ({ infoElements }) => (
  <Flex sx={{ p: 0, justifyContent: "space-between", alignItems: "center" }}>
    {infoElements.map(({ title, infoIcon, ...staticAmountProps }) => (
      <Box key={title?.toString()} sx={{ px: 2 }}>
        {createInfoTitleElement(title, infoIcon)}
        {createInfoAmountElement(staticAmountProps)}
      </Box>
    ))}
  </Flex>
);
