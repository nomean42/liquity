import { Decimal, Decimalish } from "@liquity/lib-base";

export const parseDecimalishToNumber = (decimalish: Decimalish): number => {
  switch (typeof decimalish) {
    case "number":
      return decimalish;
    case "string":
      return parseFloat(decimalish);
    default:
      return parseFloat(Decimal.from(decimalish).toString());
  }
};

export const prettifyNumber = (num: number): string => {
  const normalizedNumber = Math.round(num * 100) / 100;
  const [characteristic, mantissa] = String(normalizedNumber).split(".");
  const prettyCharacteristic = characteristic.replace(
    /(\d)(?=(\d{3})+(?!\d))/g,
    "$1,"
  );

  return mantissa !== undefined
    ? prettyCharacteristic + "." + mantissa + (mantissa.length === 1 ? "0" : "")
    : prettyCharacteristic + ".00";
};

export const prettifyDecimalDiff = (
  original: Decimal,
  edited: Decimal,
  isAddPositive: boolean
): string => {
  const editedNumber = parseDecimalishToNumber(edited);

  return prettifyNumber(
    parseDecimalishToNumber(original) +
      (isAddPositive ? +editedNumber : -editedNumber)
  );
};
