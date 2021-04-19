import React, { useState } from "react";
import { Heading, Box, Card, Button } from "theme-ui";

import {
  Percent,
  Difference,
  Decimalish,
  Decimal,
  Trove,
  LiquityStoreState,
  LUSD_LIQUIDATION_RESERVE,
} from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { Units } from "../../strings";

import { Icon } from "../Icon";
import { EditableRow, StaticRow } from "./Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { CollateralRatio } from "./CollateralRatio";
import { InfoIcon } from "../InfoIcon";

const gasRoomETH = Decimal.from(0.1);

type TroveEditorProps = {
  original: Trove;
  edited: Trove;
  fee: Decimal;
  borrowingRate: Decimal;
  changePending: boolean;
  dispatch: (
    action:
      | { type: "setCollateral" | "setDebt"; newValue: Decimalish }
      | { type: "revert" }
  ) => void;
};

const select = ({ price, accountBalance }: LiquityStoreState) => ({
  price,
  accountBalance,
});

export const TroveEditor: React.FC<TroveEditorProps> = ({
  children,
  original,
  edited,
  fee,
  borrowingRate,
  changePending,
  dispatch,
}) => {
  const { price, accountBalance } = useLiquitySelector(select);

  const editingState = useState<string>();

  const feePct = new Percent(borrowingRate);

  const originalCollateralRatio = !original.isEmpty
    ? original.collateralRatio(price)
    : undefined;
  const collateralRatio = !edited.isEmpty
    ? edited.collateralRatio(price)
    : undefined;
  const collateralRatioChange = Difference.between(
    collateralRatio,
    originalCollateralRatio
  );

  const maxEth = accountBalance.gt(gasRoomETH)
    ? accountBalance.sub(gasRoomETH)
    : Decimal.ZERO;
  const maxCollateral = original.collateral.add(maxEth);
  const collateralMaxedOut = edited.collateral.eq(maxCollateral);

  const dirty = !edited.equals(original);

  return (
    <Card>
      <Heading>
        Trove
        {dirty && !changePending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={() => dispatch({ type: "revert" })}
          >
            <Icon name="history" size="lg" />
          </Button>
        )}
      </Heading>

      <Box sx={{ p: [2, 3] }}>
        <EditableRow
          label="Collateral"
          inputId="trove-collateral"
          amount={edited.collateral.prettify(4)}
          maxAmount={maxCollateral.toString()}
          maxedOut={collateralMaxedOut}
          unit={Units.ETH}
          {...{ editingState }}
          editedAmount={edited.collateral.toString(4)}
          setEditedAmount={(editedCollateral: string) =>
            dispatch({ type: "setCollateral", newValue: editedCollateral })
          }
        />

        <EditableRow
          label="Debt"
          inputId="trove-debt"
          amount={edited.debt.prettify()}
          unit={Units.COIN}
          {...{ editingState }}
          editedAmount={edited.debt.toString(2)}
          setEditedAmount={(editedDebt: string) =>
            dispatch({ type: "setDebt", newValue: editedDebt })
          }
        />

        {original.isEmpty && (
          <StaticRow
            label="Liquidation Reserve"
            inputId="trove-liquidation-reserve"
            amount={`${LUSD_LIQUIDATION_RESERVE}`}
            unit={Units.COIN}
            infoIcon={
              <InfoIcon
                tooltip={
                  <Card variant="tooltip" sx={{ width: "200px" }}>
                    An amount set aside to cover the liquidator’s gas costs if
                    your Trove needs to be liquidated. The amount increases your
                    debt and is refunded if you close your Trove by fully paying
                    off its net debt.
                  </Card>
                }
              />
            }
          />
        )}

        <StaticRow
          label="Borrowing Fee"
          inputId="trove-borrowing-fee"
          amount={fee.toString(2)}
          pendingAmount={feePct.toString(2)}
          unit={Units.COIN}
          infoIcon={
            <InfoIcon
              tooltip={
                <Card variant="tooltip" sx={{ width: "240px" }}>
                  This amount is deducted from the borrowed amount as a one-time
                  fee. There are no recurring fees for borrowing, which is thus
                  interest-free.
                </Card>
              }
            />
          }
        />

        <CollateralRatio
          value={collateralRatio}
          change={collateralRatioChange}
        />

        {children}
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
