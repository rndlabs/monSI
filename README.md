# monsi

A monitor for the upcoming Storage Incentives (SI) for the Ethersphere Bee swarm written in Typescript for node.js

![monsi Terminal User Interface!](/assets/screenshot.png 'monsi TUI')

## Installing node / npm packages

To get started the following commands, or their equivalents, should work if you don't already have node and/or `npm`

```bash
sudo apt-get install nodejs
sudo apt-get install npm
```

Or for Windows or macOS, https://nodejs.org/en/download/

You'll also need git to clone this repository: https://git-scm.com/download/win

## Installation of monsi

monsi is available for install as a standard `npmjs` package for *non-Windows* users. Once you have `node` and `npm` installed, you can install `monsi` simply by:

```bash
npm install -g "@rndlabs/monsi"
```

This will install the package and make available the `monsi` symlink on your command line environment's path.

*Windows* users will need to follow the [Extending / developing monsi](#extending--developing-monsi) instructions below.

### Configuring

All parameters can be specified on the command line and some are supported in environment values (or `.env` file)

### Running

Finally, to run `monsi`, use the following command in a shell or command prompt window:

```bash
monsi --rpc-endpoint ws://<YourGoerliRPCIP:port>
```

This command will compile the typescript application and run it. Your screen should clear and boxes should appear with values. monsi defaults to going back 4 complete Schelling game rounds at startup. It also loads ALL stake events from the blockchain on every invocation.

### Usage

```
Monitor Storage Incentives for Swarm

Arguments:
  overlays                   Overlay addresses for highlighting

Options:
  -V, --version              output the version number
  --mainnet                  Use Swarm mainnet (default: false)
  --rpc-endpoint <string>    RPC endpoint for the blockchain node (default: "ws://goerli-geth.dappnode:8546", env:
                             RPC_URL)
  -r, --rounds [rounds]      Load the last number of rounds from the blockchain (default: 4)
  -b, --block [block]        Block number to start loading from
  -R, --round [round]        Round number to start loading from
  -S, --singleRound [round]  Load a single round and stop
  -h, --help                 display help for command
```

### Extending / developing monsi

If you're developing and want to build / extend on monsi - first, thank you! Community development and pull requests are always appreciated ❤️. To get started quickly developing:

```bash
git clone https://github.com/rndlabs/monsi # clone the source to your disk
npm i # install npm dependencies
```

After you have made the modifications for your PR / branch, you may start `monsi` using `ts-node` by:

```bash
node --experimental-specifier-resolution=node --loader=ts-node/esm ./src/index.ts --rpc-endpoint ws://<YourGoerliRPCIP:port>
```

monsi uses [blessed](https://www.npmjs.com/package/blessed) for drawing its TUI (Text User Interface) and [ethers](https://docs.ethers.io/) for blockchain RPC

#### Typechain / ES6

This package is written as an ES6 module and `typechain` to generate ethers bindings for contract interaction. Currently, `typechain` does not support generation of ES6-compatible modules, so the generated bindings need to be manually edited to ensure that the import paths are ES6-compliant.

Steps:

1. If contract ABI is modified, remove all previously generated bindings in `src/types/contracts`.
2. Generate the bindings using: `npm run typechain --target ethers-v5 --out-dir src/types/contracts "./contracts/**/*.json"`
3. Manually edit the generated bindings to ensure that all import paths include the `.js` suffix, or when importing a directory, they import the `index.js` within that directory.

## Acknowledgements

monsi was originally written by @ldeffenb and was heavily based on monBee. @mfw78 graciously offered to restructure the original grungy monolithic code into something much more understandable, extendible, and maintainable. The result of this collaboration is the monsi that you see here.

## Warning

Just don't run monsi for a long time if you use infura.io's (or any other provider's) free account because monsi monitors every single block and will eat up your 100,000 API hits in short order. No gETH, but every query is counted at infura.io, and monsi does LOTS of blockchain queries!

Having your own local goerli (gnosis in the future) RPC provider is **strongly** recommended!
