import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStakingView } from "./Staking/context/StakingViewContext";
import {
  Box,
  Button,
  Card,
  Heading,
  Input,
  ThemeUICSSProperties,
} from "theme-ui";
import { Icon } from "./Icon";
import { Row, StaticAmounts } from "./Trove/Editor";
import { LoadingOverlay } from "./LoadingOverlay";
import { Decimal } from "@liquity/lib-base";
import { Units } from "../strings";
import { prettifyDecimalDiff } from "../utils/number";

interface EditorInputProps {
  originalStake: Decimal;
  editedStake: Decimal;
  setEditedStake(value: Decimal): void;
  walletBalance: Decimal;
  revert(): void;
  inputId: string;
  unit: Units;
}

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

export const EditorInput: React.FC<EditorInputProps> = ({
  children,
  originalStake,
  editedStake,
  setEditedStake,
  walletBalance,
  revert,
  inputId,
  unit,
}) => {
  const { changePending, kind } = useStakingView();
  const inputComponent = useRef<HTMLInputElement>(null);
  const isKindStake = kind === "STAKE";

  const [invalid, setInvalid] = useState(false);

  const [maxAmount, maxedOut] = useMemo((): [Decimal, boolean] => {
    const targetBalance = isKindStake ? walletBalance : originalStake;
    return [targetBalance, editedStake.gt(targetBalance)];
  }, [isKindStake, walletBalance, originalStake, editedStake]);

  useEffect(() => {
    setInvalid(
      maxedOut
    );
  }, [editedStake, originalStake, maxedOut]);

  const setInputChange = useCallback(
    (value: string) => {
      const newValue = parseFloat(value === "" ? "0" : value);

      if (newValue >= 0) {
        setEditedStake(Decimal.from(newValue));
      } else {
        setInvalid(true);
      }
    },
    [setEditedStake, setInvalid]
  );

  const onMaxClick = useCallback(
    (event) => {
      const maxAmountString = maxAmount.toString();
      ((inputComponent.current as unknown) as HTMLInputElement).value = maxAmountString;
      setInputChange(maxAmountString);
      event.stopPropagation();
    },
    [maxAmount, setInputChange]
  );

  const onInputChange = useCallback(
    ({ target: { value } }) => {
      setInputChange(value);
    },
    [setInputChange]
  );

  useEffect(() => {
    if (inputComponent.current) {
      const element = (inputComponent.current as unknown) as HTMLInputElement;
      element.addEventListener("mousewheel", (e) => {
        e.preventDefault();
      });
    }
  }, [inputComponent]);

  const newStakePretty = useMemo(
    () => prettifyDecimalDiff(originalStake, editedStake, isKindStake),
    [isKindStake, originalStake, editedStake]
  );

  return (
    <Card>
      <Heading>
        Staking
        {!changePending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={revert}
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
            amount={
              <>
                {`${originalStake.prettify()} `}
                <Icon name="long-arrow-alt-right" size="sm" />
                {` ${newStakePretty}`}
              </>
            }
            {...{ inputId, unit, invalid }}
          >
            {!maxAmount.isZero && (
              <Button
                sx={{ fontSize: 1, p: 1, px: 3 }}
                onClick={onMaxClick}
                disabled={maxAmount.eq(editedStake)}
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
            sx={{
              ...editableStyle,
              fontWeight: "medium",
              bg: invalid ? "invalid" : "background",
            }}
          />
        </Row>
        {children}
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
