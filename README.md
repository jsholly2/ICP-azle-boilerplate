# ICP-azle-boilerplate
# Tipping System

A Tipping canister built on the ICP network. Users can tip one another on the network

## DEVELOPMENT

Install Node Version Manager (nvm): To install nvm, execute the following command in your terminal:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

Switch to Node.js version 18: To switch to Node.js version 18 using nvm, use the following command:

```bash
nvm use 18
```

Install DFX: To install DFX, execute this command:

``` bash
DFX_VERSION=0.14.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

Add DFX to your path: Now that DFX is installed; Run this command to add DFX to your PATH:

```bash
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```

Next Reload terminal.

To install dependencies

```bash
npm install
```

To start the Local Internet Computer

```bash
dfx start --background
```

To create canister contract

```bash
dfx canister create --all
```

To build canister

```bash
dfx build
```

To install the canister

```bash
dfx canister install --all
```

To deploy canister

```bash
dfx deploy
```

This deploy command builds, and installs the canister.tsx file

## INTERACTING WITH THE CANISTER

## 1. `getAddressFromPrincipal()`:

We can get the address of the user by calling the `getAddressFromPrincipal()` from our canister file. Execute the following command in your terminal, replacing `address` with `bnz7o-iuaaa-aaaaa-qaaaa-cai`
```bash
dfx canister call recipe addRecipe '(principal {"address"})
```
You should get a similar output below

![]()

## 2. `sendTip()`:

We can send a tip by calling the `sendTip()` function from our canister file. Execute the following command in your terminal, replacing `address` with `bnz7o-iuaaa-aaaaa-qaaaa-cai`

