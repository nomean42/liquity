import { Decimal } from "@liquity/lib-base";
import { useEffect, useState } from "react";
import { fetchLqtyPrice } from "../components/Stability/context/fetchLqtyPrice";
import { useLiquity } from "./LiquityContext";

export const useLQTYPrice = (): Decimal | undefined => {
  const {
    liquity: {
      connection: { addresses },
    },
  } = useLiquity();
  const [lqtyPrice, setLqtyPrice] = useState<Decimal | undefined>(undefined);
  const lqtyTokenAddress = addresses["lqtyToken"];

  useEffect(() => {
    (async () => {
      try {
        const { lqtyPriceUSD } = await fetchLqtyPrice(lqtyTokenAddress);
        setLqtyPrice(lqtyPriceUSD);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [lqtyTokenAddress]);

  return lqtyPrice;
};
