import React, { useState, useEffect } from "react";
import { Card, Box, Heading, Flex, Button, Label, Input } from "theme-ui";

import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { useLiquity } from "../hooks/LiquityContext";

import { Icon } from "./Icon";
import { Transaction } from "./Transaction";
import { useLQTYPrice } from "../hooks/useLQTYPrice";

const selectPrice = ({ price }: LiquityStoreState) => price;
const LABEL_SX = { width: "72px" };

export const PriceManager: React.FC = () => {
  const {
    liquity: {
      send: liquity,
      connection: { _priceFeedIsTestnet: canSetPrice },
    },
  } = useLiquity();

  const price = useLiquitySelector(selectPrice);
  const [editedPrice, setEditedPrice] = useState(price.toString(2));
  const lqtyPrice = useLQTYPrice();

  useEffect(() => {
    setEditedPrice(price.toString(2));
  }, [price]);

  return (
    <Card>
      <Heading>Price feed</Heading>

      <Box sx={{ p: [2, 3] }}>
        <Flex sx={{ alignItems: "stretch" }}>
          <Label sx={LABEL_SX}>ETH</Label>

          <Label variant="unit">$</Label>

          <Input
            type={canSetPrice ? "number" : "text"}
            step="any"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
            disabled={!canSetPrice}
          />

          {canSetPrice && (
            <Flex sx={{ ml: 2, alignItems: "center" }}>
              <Transaction
                id="set-price"
                tooltip="Set"
                tooltipPlacement="bottom"
                send={(overrides) => {
                  if (!editedPrice) {
                    throw new Error("Invalid price");
                  }
                  return liquity.setPrice(Decimal.from(editedPrice), overrides);
                }}
              >
                <Button variant="icon">
                  <Icon name="chart-line" size="lg" />
                </Button>
              </Transaction>
            </Flex>
          )}
        </Flex>
      </Box>
      {lqtyPrice && (
        <Box sx={{ p: [2, 3] }}>
          <Flex sx={{ alignItems: "stretch" }}>
            <Label sx={LABEL_SX}>LQTY</Label>

            <Label variant="unit">$</Label>

            <Input type="number" value={lqtyPrice?.prettify()} disabled />
          </Flex>
        </Box>
      )}
    </Card>
  );
};
