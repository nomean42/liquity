import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

interface EditorInputProps {
  headingTitle: string;
  staticRowLabel: string;
  editableRowLabel: string;
  originalStake: Decimal;
  editedStake: Decimal;
  setEditedStake(value: Decimal): void;
  walletBalance: Decimal;
  revert(): void;
  inputId: string;
  unit: Units;
  isKindStake: boolean;
  changePending: boolean;
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
  headingTitle,
  staticRowLabel,
  editableRowLabel,
  originalStake,
  editedStake,
  setEditedStake,
  walletBalance,
  revert,
  inputId,
  unit,
  isKindStake,
  changePending,
  children,
}) => {
  const inputComponent = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);

  const [maxAmount, maxedOut] = useMemo((): [Decimal, boolean] => {
    if (isKindStake) {
      return [walletBalance, editedStake.sub(originalStake).gt(walletBalance)];
    }

    return [originalStake, editedStake.eq(Decimal.ZERO)];
  }, [isKindStake, walletBalance, originalStake, editedStake]);

  useEffect(() => {
    setInvalid(maxedOut);
  }, [editedStake, originalStake, maxedOut]);

  const setInputChange = useCallback(
    (value: string) => {
      const component = (inputComponent.current as unknown) as HTMLInputElement;

      if (component.value !== value) {
        component.value = value;
      }

      const newValue = parseFloat(value === "" ? "0" : value);

      if (newValue >= 0) {
        setEditedStake(Decimal.from(newValue));
      }
    },
    [setEditedStake, inputComponent]
  );

  const onMaxClick = useCallback(
    (event) => {
      setInputChange(maxAmount.toString());
      event.stopPropagation();
    },
    [maxAmount, setInputChange]
  );

  const onRevertClick = useCallback(() => {
    setInputChange("");
    revert();
  }, [setInputChange, revert]);

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

  return (
    <Card>
      <Heading>
        {headingTitle}
        {!editedStake.eq(originalStake) && !changePending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={onRevertClick}
          >
            <Icon name="history" size="lg" />
          </Button>
        )}
      </Heading>
      <Box sx={{ p: [2, 3] }}>
        <Row labelId={`${inputId}-label`} label={staticRowLabel}>
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
                {` ${editedStake.prettify()}`}
              </>
            }
            {...{ inputId, unit, invalid }}
          >
            {!maxAmount.isZero && (
              <Button
                sx={{ fontSize: 1, p: 1, px: 3 }}
                onClick={onMaxClick}
                disabled={maxedOut}
              >
                max
              </Button>
            )}
          </StaticAmounts>
        </Row>
        <Row
          {...{
            label: editableRowLabel,
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
