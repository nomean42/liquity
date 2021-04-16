import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Heading,
  Box,
  Card,
  Button,
  Input,
  ThemeUICSSProperties,
} from "theme-ui";

import { Decimalish, LiquityStoreState, LQTYStake } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { GT } from "../../strings";

import { Icon } from "../Icon";
import { Row, StaticAmounts } from "../Trove/Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { useStakingView } from "./context/StakingViewContext";
import { parseDecimalishToNumber, prettifyNumber } from "../../utils/number";
import { StakingInfoLine } from "./StakingInfoLine";

const select = ({ lqtyBalance }: LiquityStoreState) => ({
  lqtyBalance,
});

type StakingEditorProps = {
  title: string;
  originalStake: LQTYStake;
  editedLQTY: Decimalish;
  dispatch: (
    action: { type: "setStake"; newValue: Decimalish } | { type: "revert" }
  ) => void;
};

const inputId = "stake-lqty";
const unit = GT;
const editableStyle: ThemeUICSSProperties = {
  flexGrow: 1,

  mb: [2, 3],
  pl: 3,
  pr: "11px",
  pb: 2,
  pt: "28px",

  fontSize: 4,

  boxShadow: [1, 2],
  border: 1,
  borderColor: "muted",
};

export const StakingEditor: React.FC<StakingEditorProps> = ({
  children,
  title,
  originalStake,
  editedLQTY,
  dispatch,
}) => {
  const { lqtyBalance } = useLiquitySelector(select);
  const { changePending, kind } = useStakingView();
  const [invalid, setInvalid] = useState(false);
  const inputComponent = useRef(null);
  const isKindStake = kind === "STAKE";

  const [editedLQTYAmount, setEditedLQTYAmount]: [
    number,
    (newValue: number) => void
  ] = [
    parseDecimalishToNumber(editedLQTY),
    useCallback(
      (newValue: Decimalish) => dispatch({ type: "setStake", newValue }),
      [dispatch]
    ),
  ];
  const [inputAmount, setInputAmount] = useState(NaN);

  const maxAmount =
    Math.floor(
      parseDecimalishToNumber(
        isKindStake ? lqtyBalance : originalStake.stakedLQTY
      ) * 10e5
    ) / 10e5;
  const maxedOut = isKindStake
    ? editedLQTYAmount === maxAmount
    : editedLQTYAmount === 0;

  const onInputChange = useCallback(
    ({ target: { value } }) => {
      const newValue = parseFloat(value);
      const isInvalid = Number.isNaN(newValue) || newValue < 0 ;

      setInvalid(isInvalid || maxedOut);
      if (!isInvalid) {
        setInputAmount(newValue);
      }
    },
    [setInputAmount, setInvalid, maxedOut]
  );

  useEffect(() => {
    if (!Number.isNaN(inputAmount)) {
      const stakedLQTY = parseDecimalishToNumber(originalStake.stakedLQTY);

      setEditedLQTYAmount(
        isKindStake ? stakedLQTY + inputAmount : stakedLQTY - inputAmount
      );
    }
  }, [inputAmount, isKindStake, originalStake.stakedLQTY, setEditedLQTYAmount]);

  useEffect(() => {
    if (inputComponent.current && inputAmount <= maxAmount) {
      ((inputComponent.current as unknown) as HTMLInputElement).value = inputAmount.toString();
    }
  }, [inputAmount, inputComponent, maxAmount]);

  useEffect(() => {
    if (inputComponent.current) {
      const element = (inputComponent.current as unknown) as HTMLInputElement;
      element.addEventListener("mousewheel", (e) => {
        e.preventDefault();
      });
    }
  }, [inputComponent]);

  return (
    <Card>
      <Heading>
        {title}
        {!changePending && (
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
        <Row labelId={`${inputId}-label`} label="Stake">
          <StaticAmounts
            sx={{
              ...editableStyle,
              bg: "background",
            }}
            labelledBy={`${inputId}-label`}
            amount={`${originalStake.stakedLQTY.prettify()} -> ${prettifyNumber(
              editedLQTYAmount
            )}`}
            {...{ inputId, unit, invalid }}
          >
            {maxAmount !== 0 && (
              <Button
                sx={{ fontSize: 1, p: 1, px: 3 }}
                onClick={(event) => {
                  setInputAmount(maxAmount);
                  event.stopPropagation();
                }}
                disabled={maxedOut}
              >
                max
              </Button>
            )}
          </StaticAmounts>
        </Row>
        <Row
          {...{
            label: isKindStake ? "Stake" : "Withdraw",
            labelFor: inputId,
            unit,
          }}
        >
          <Input
            ref={inputComponent}
            lang={"en"}
            min={0}
            autoFocus
            id={inputId}
            type="number"
            step="any"
            onChange={onInputChange}
            onBlur={() => {
              setInvalid(false);
            }}
            sx={{
              ...editableStyle,
              fontWeight: "medium",
              bg: invalid ? "invalid" : "background",
            }}
          />
        </Row>

        {!originalStake.isEmpty && (
          <StakingInfoLine editedLQTYAmount={editedLQTYAmount} />
        )}

        {children}
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
