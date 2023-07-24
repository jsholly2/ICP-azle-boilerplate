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

1. `getAddressFromPrincipal()`:

We can get the address of the user by calling the `getAddressFromPrincipal()` from our canister file. Execute the following command in your terminal, replacing `address` with `bnz7o-iuaaa-aaaaa-qaaaa-cai`
```bash
dfx canister call message_board getAddressFromPrincipal '(principal "address")'
```
You should get a similar output below

![](https://github.com/ozo-vehe/ICP-azle-boilerplate/blob/main/first.png)

2. `sendTip()`:

We can send a tip by calling the `sendTip()` function from our canister file. Execute the following command in your terminal, replacing `tippers_name`, `your_message` and `any_amount` with your desired values. You can add as much tips as you would want.

```bash
dfx canister call message_board sendTip '(record {"name"="tippers_name"; "message"="your_message"; "amount"=any_amount})'
```

You should get a similar output below

![](https://github.com/ozo-vehe/ICP-azle-boilerplate/blob/main/second.png)

3. `getTips()`:

To get all the tips, run the following code in the terminal

```bash
dfx canister call message_board getTips '()'
```

You should get similar output below

![](https://github.com/ozo-vehe/ICP-azle-boilerplate/blob/main/third.png)

4. `getTipById()`:

To get a particular tip bu it's id, run the code below in the terminal, replacing `id` with the id of the tip.

```bash
dfx canister call message_board getTipById '("id")'
```

You should get a similar result as below

![](https://github.com/ozo-vehe/ICP-azle-boilerplate/blob/main/fourth.png)

## CONTRIBUTING
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

- Fork the Project
- Create your new feature branch (git checkout -b feature/new_feature)
- Commit your changes (git commit -m 'icluded a new feature(s)')
- Push to the branch (git push origin feature/new_feature)
- Open a pull request