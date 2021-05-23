import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";

import { Trove, TroveChange } from "../../generated/schema";

import { decimalize, BIGINT_SCALING_FACTOR, BIGINT_ZERO, DECIMAL_ZERO } from "../utils/bignumbers";
import { calculateCollateralRatio } from "../utils/collateralRatio";

import { isLiquidation, isRedemption } from "../types/TroveOperation";

import {
  decreaseNumberOfLiquidatedTroves,
  decreaseNumberOfRedeemedTroves,
  decreaseNumberOfTrovesClosedByOwner,
  increaseNumberOfLiquidatedTroves,
  increaseNumberOfRedeemedTroves,
  increaseNumberOfOpenTroves,
  increaseNumberOfTrovesClosedByOwner
} from "./Global";
import { beginChange, initChange, finishChange } from "./Change";
import { getCurrentPrice, updateSystemStateByTroveChange } from "./SystemState";
import { getCurrentLiquidation } from "./Liquidation";
import { getCurrentRedemption } from "./Redemption";
import { getUser } from "./User";

function getTrove(_user: Address): Trove {
  let id = _user.toHexString();
  let troveOrNull = Trove.load(id);

  if (troveOrNull != null) {
    return troveOrNull as Trove;
  } else {
    let owner = getUser(_user);
    let newTrove = new Trove(id);

    newTrove.owner = owner.id;
    newTrove.collateral = DECIMAL_ZERO;
    newTrove.debt = DECIMAL_ZERO;

    // Avoid using setTroveStatus, because newTrove's status is not yet initialized
    newTrove.status = "open";
    increaseNumberOfOpenTroves();

    owner.trove = newTrove.id;
    owner.save();

    return newTrove;
  }
}

function setTroveStatus(trove: Trove, status: string): void {
  let statusBefore = trove.status;

  if (status != statusBefore) {
    if (status == "open") {
      if (statusBefore == "closedByOwner") {
        decreaseNumberOfTrovesClosedByOwner();
      } else if (statusBefore == "closedByLiquidation") {
        decreaseNumberOfLiquidatedTroves();
      } else if (statusBefore == "closedByRedemption") {
        decreaseNumberOfRedeemedTroves();
      }
    } else if (status == "closedByOwner") {
      increaseNumberOfTrovesClosedByOwner();
    } else if (status == "closedByLiquidation") {
      increaseNumberOfLiquidatedTroves();
    } else if (status == "closedByRedemption") {
      increaseNumberOfRedeemedTroves();
    }

    trove.status = status;
  }
}

function createTroveChange(event: ethereum.Event): TroveChange {
  let sequenceNumber = beginChange(event);
  let troveChange = new TroveChange(sequenceNumber.toString());
  initChange(troveChange, event, sequenceNumber);

  return troveChange;
}

function finishTroveChange(troveChange: TroveChange): void {
  finishChange(troveChange);
  troveChange.save();
}

export function updateTrove(
  event: ethereum.Event,
  operation: string,
  _borrower: Address,
  _coll: BigInt,
  _debt: BigInt,
  stake: BigInt,
  snapshotETH: BigInt,
  snapshotLUSDDebt: BigInt
): void {
  let trove = getTrove(_borrower);
  let newCollateral = decimalize(_coll);
  let newDebt = decimalize(_debt);

  if (newCollateral == trove.collateral && newDebt == trove.debt) {
    return;
  }

  let troveChange = createTroveChange(event);
  let price = getCurrentPrice();

  troveChange.trove = trove.id;
  troveChange.troveOperation = operation;

  troveChange.collateralBefore = trove.collateral;
  troveChange.debtBefore = trove.debt;
  troveChange.collateralRatioBefore = calculateCollateralRatio(trove.collateral, trove.debt, price);

  trove.collateral = newCollateral;
  trove.debt = newDebt;

  troveChange.collateralAfter = trove.collateral;
  troveChange.debtAfter = trove.debt;
  troveChange.collateralRatioAfter = calculateCollateralRatio(trove.collateral, trove.debt, price);

  troveChange.collateralChange = troveChange.collateralAfter - troveChange.collateralBefore;
  troveChange.debtChange = troveChange.debtAfter - troveChange.debtBefore;

  if (isLiquidation(operation)) {
    let currentLiquidation = getCurrentLiquidation(event);
    troveChange.liquidation = currentLiquidation.id;
  }

  if (isRedemption(operation)) {
    let currentRedemption = getCurrentRedemption(event);
    troveChange.redemption = currentRedemption.id;
  }

  updateSystemStateByTroveChange(troveChange);
  finishTroveChange(troveChange);

  trove.rawCollateral = _coll;
  trove.rawDebt = _debt;
  trove.rawStake = stake;
  trove.rawSnapshotOfTotalRedistributedCollateral = snapshotETH;
  trove.rawSnapshotOfTotalRedistributedDebt = snapshotLUSDDebt;

  if (stake != BIGINT_ZERO) {
    trove.collateralRatioSortKey = (_debt * BIGINT_SCALING_FACTOR) / stake - snapshotLUSDDebt;
  } else {
    trove.collateralRatioSortKey = null;
  }

  if (_coll == BIGINT_ZERO) {
    if (isLiquidation(operation)) {
      setTroveStatus(trove, "closedByLiquidation");
    } else if (isRedemption(operation)) {
      setTroveStatus(trove, "closedByRedemption");
    } else {
      setTroveStatus(trove, "closedByOwner");
    }
  } else {
    setTroveStatus(trove, "open");
  }

  trove.save();
}
