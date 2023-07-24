// import depedencies

import { $query, $update, Record, StableBTreeMap, Vec, Opt, match, Result, nat64, ic, Principal } from "azle";
import {Address, binaryAddressFromAddress, TransferFee, hexAddressFromPrincipal, Ledger, Tokens, TransferResult} from 'azle/canisters/ledger';

import { v4 as uuidv4 } from 'uuid';

//define tip type
type Tip = Record<{
    id: string;
    name: string;
    timestamp: nat64;
    message: string;
}>

//define tip payload
type TipPayload = Record<{
    name: string;
    message: string;
    amount: nat64
}>


// define tip storage
const tipStorage = new StableBTreeMap<string, Tip>(0, 44, 1024);



// create address of message board canister id
const icpCanisterAddress: Address = "bkyz2-fmaaa-aaaaa-qaaaq-cai"

// create a new ledger
const icpCanister = new Ledger(
    Principal.fromText(icpCanisterAddress)
);

// set up with default wallet of local network user 
const owner: Principal = Principal.fromText("bnz7o-iuaaa-aaaaa-qaaaa-cai")


// get hexadecimal address from principal
$query;
export function getAddressFromPrincipal(principal: Principal): string {
    return hexAddressFromPrincipal(principal, 0);
}



// get total tips
$query;
export function getTips(): Result<Vec<Tip>, string> {
    return Result.Ok(tipStorage.values());
}


// get a particular tip
$query;
export function getTipById(id: string): Result<Tip, string> {
    return match(tipStorage.get(id), {
        Some: (tip) => Result.Ok<Tip, string>(tip),
        None: () => Result.Err<Tip, string>(`tip with id=${id} not found`)
    });
}



// send tip
$update;
export async function sendTip(payload: TipPayload): Promise<Result<Tip, string>> {
    if (!payload.name || !payload.message || payload.amount <= 0) {
        return Result.Err<Tip, string>("Invalid tip payload");
    }

    await depositTip(payload.amount);
    const tip: Tip = { id: uuidv4(), timestamp: ic.time(), ...payload };
    tipStorage.insert(tip.id, tip);
    return  Result.Ok<Tip, string>(tip)
}



// search tips by name
$query;
export function searchTipsByName(name: string): Result<Vec<Tip>, string> {
    const tipLength = tipStorage.len(); 
    const matchedTips: Vec<Tip> = [];
    const tips = tipStorage.items(); 

    
    for (let i = 0; i < tipLength; i++) { 
        const tip = tips[Number(i)][1];
        if (tip.name.toLowerCase().includes(name.toLowerCase())) {
            matchedTips.push(tip);
        } 
    }
    // Return the result of matched names
    return Result.Ok(matchedTips);
}


// returns the amount of cycles available in the canister
$query;
export function canisterBalance(): nat64 {
    return ic.canisterBalance();
}




// deposit tip
$update
export async function depositTip(
    amount: nat64
): Promise<Result<TransferResult, string>> {
    if (amount <= 0) {
        return Result.Err<TransferResult, string>("Invalid tip amount");
    }

    const balance = (await getAccountBalance(ic.caller().toText())).Ok?.e8s;
    const transfer_fee = (await getTransferFee()).Ok?.transfer_fee.e8s

    if(balance !== undefined && balance > amount){
        return await icpCanister
            .transfer({
                memo: 0n,
                amount: {
                    e8s: amount
                },
                fee: {
                    e8s: transfer_fee? transfer_fee : 10000n 
                },
                from_subaccount: Opt.None,
                to: binaryAddressFromAddress(icpCanisterAddress),
                created_at_time: Opt.None
            })
            .call();
    } else{
        return Result.Err<TransferResult, string>("Insufficient balance or invalid amount");
    }
}


// get account balance
async function getAccountBalance(
    address: Address
): Promise<Result<Tokens, string>> {
    const result = await icpCanister.account_balance({
        account: binaryAddressFromAddress(address)
    }).call();

    if (result) {
        return result;
    } else {
        return Result.Err<Tokens, string>("Failed to retrieve account balance");
    }
}

$update;
export async function getTransferFee(): Promise<Result<TransferFee, string>> {
    return await icpCanister.transfer_fee({}).call();
}


// allow owner widthdraw tips
$update;
export async function withdrawTips(
    to: Address,
    amount: nat64,
): Promise<Result<TransferResult, string>> {
    if(ic.caller() !== owner){
        return Result.Err<TransferResult, string>("Only owner can withdraw funds");
    }
    const balance = (await getAccountBalance(icpCanisterAddress)).Ok?.e8s;
    const transfer_fee = (await getTransferFee()).Ok?.transfer_fee.e8s;

    if(balance !== undefined && balance > amount){
        return await icpCanister
        .transfer({
            memo: 0n,
            amount: {
                e8s: amount
            },
            fee: {
                e8s: transfer_fee? transfer_fee : 10000n 
            },
            from_subaccount: Opt.None,
            to: binaryAddressFromAddress(to),
            created_at_time: Opt.None
        })
        .call();
    }else{
        return Result.Err<TransferResult, string>("Insufficient balance or invalid amount");
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
    }
};
