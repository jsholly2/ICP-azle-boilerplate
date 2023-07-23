// import depedencies

import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  Opt,
  match,
  Result,
  nat64,
  ic,
  Principal,
} from "azle";
import {
  Address,
  binaryAddressFromAddress,
  TransferFee,
  hexAddressFromPrincipal,
  Ledger,
  Tokens,
  TransferResult,
} from "azle/canisters/ledger";

import { v4 as uuidv4 } from "uuid";

//define tip type
type Tip = Record<{
  id: string;
  name: string;
  timestamp: nat64;
  message: string;
}>;

//define tip payload
type TipPayload = Record<{
  name: string;
  message: string;
  amount: nat64;
}>;

// define tip storage
const tipStorage = new StableBTreeMap<string, Tip>(0, 44, 1024);

// create address of message board canister id
const icpCanisterAddress: Address = "bkyz2-fmaaa-aaaaa-qaaaq-cai";

// create a new ledger
const icpCanister = new Ledger(Principal.fromText(icpCanisterAddress));

// set up with default wallet of local network user
const owner: Principal = Principal.fromText("bnz7o-iuaaa-aaaaa-qaaaa-cai");

// get hexadecimal address from principal
$query;
export function getAddressFromPrincipal(principal: Principal): string {
  try {
    return hexAddressFromPrincipal(principal, 0);
  } catch (error) {
    throw new Error(`Failed to convert principal to address: ${error}`);
  }
}

// get total tips
$query;
export function getTips(): Result<Vec<Tip>, string> {
  try {
    return Result.Ok(tipStorage.values());
  } catch (error) {
    return Result.Err(`Error fetching tips: ${error}`);
  }
}

// get a particular tip
$query;
export function getTipById(id: string): Result<Tip, string> {
  return match(tipStorage.get(id), {
    Some: (tip) => Result.Ok<Tip, string>(tip),
    None: () => Result.Err<Tip, string>(`tip with id=${id} was not found`),
  });
}

// send tip
$update;
export async function sendTip(
  payload: TipPayload
): Promise<Result<Tip, string>> {
  const depositResult = await depositTip(payload.amount);
  if (depositResult.Ok) {
    const tip: Tip = { id: uuidv4(), timestamp: ic.time(), ...payload };
    tipStorage.insert(tip.id, tip);
    return Result.Ok<Tip, string>(tip);
  } else {
    return Result.Err<Tip, string>("Deposit failed");
  }
}

// search tips by name
$query;
export function searchTipsByName(name: string): Result<Vec<Tip>, string> {
  // Get the total number of tips in the storage
  const tipLength = tipStorage.len();

  // Create an empty array to store matched tips
  const matchedTips: Vec<Tip> = [];

  // Get all the tips from the storage
  const tips = tipStorage.items();

  // Loop through each tip and check if the name includes the provided search query
  for (let i = 0; i < tipLength; i++) {
    const tip = tips[Number(i)][1];
    if (tip.name.toLowerCase().includes(name.toLowerCase())) {
      matchedTips.push(tip);
    }
  }
  // Return the result of matched names
  return Result.Ok(matchedTips);
}

// deposit tip
async function depositTip(
  amount: nat64
): Promise<Result<TransferResult, string>> {
  // Get the account balance of the caller
  const balance = (await getAccountBalance(ic.caller().toText())).Ok?.e8s;

  // Get the transfer fee
  const transfer_fee = (await getTransferFee()).Ok?.transfer_fee.e8s;

  // Check if the caller's balance is sufficient to cover the tip amount and the transfer fee
  if (balance !== undefined && balance > amount) {
    // Perform the transfer to the ICP Canister with the specified parameters
    return await icpCanister
      .transfer({
        memo: 0n,
        amount: {
          e8s: amount,
        },
        fee: {
          e8s: transfer_fee ? transfer_fee : 10000n,
        },
        from_subaccount: Opt.None,
        to: binaryAddressFromAddress(icpCanisterAddress),
        created_at_time: Opt.None,
      })
      .call();
  } else {
    // If the balance is insufficient, trap the canister with an error message
    ic.trap("make a deposit first");
  }
}

async function getAccountBalance(
  address: Address
): Promise<Result<Tokens, string>> {
  // Call the account_balance function of the ICP Canister with the provided address
  // to retrieve the account balance for the specified address
  return await icpCanister
    .account_balance({
      account: binaryAddressFromAddress(address),
    })
    .call();
}

async function getTransferFee(): Promise<Result<TransferFee, string>> {
  // Call the transfer_fee function of the ICP Canister with an empty object as a parameter
  // to retrieve the transfer fee details
  return await icpCanister.transfer_fee({}).call();
}

// allow owner widthdraw tips
$update;
export async function withdrawTips(
  to: Address,
  amount: nat64
): Promise<Result<TransferResult, string>> {
  // Check if the caller is the owner, only the owner can withdraw funds
  if (ic.caller() !== owner) {
    ic.trap("Only owner can withdraw funds");
  }
  // Get the balance of the ICP Canister
  const balance = (await getAccountBalance(icpCanisterAddress)).Ok?.e8s;

  // Get the transfer fee
  const transfer_fee = (await getTransferFee()).Ok?.transfer_fee.e8s;
  
  // Check if the balance is sufficient to cover the withdrawal amount and the transfer fee
  if (balance !== undefined && balance > amount) {
    // Perform the transfer to the provided address with the specified parameters
    return await icpCanister
      .transfer({
        memo: 0n,
        amount: {
          e8s: amount,
        },
        fee: {
          e8s: transfer_fee ? transfer_fee : 10000n,
        },
        from_subaccount: Opt.None,
        to: binaryAddressFromAddress(to),
        created_at_time: Opt.None,
      })
      .call();
  } else {
    // If the balance is insufficient, trap the canister with an error message
    ic.trap("make a deposit first");
  }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  //@ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
};
