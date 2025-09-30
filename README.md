# FilterHelpers

**DexTycoon Solana Token Filter Helpers** – A lightweight, efficient utility to check SPL Token 2022 extensions, mint authority, and freeze authority in Solana. Designed to protect users from scam and malicious tokens.

---

## Why Use This Helper?

Solana is a fast-growing ecosystem with thousands of new tokens launching every day. Unfortunately, some tokens are **malicious or scams** that can:

- Have active **mint authority** allowing the creator to mint unlimited tokens.
- Have **freeze authority** that can lock users’ tokens unexpectedly.
- Use **dangerous Token-2022 extensions** (e.g., Transfer Hooks, Permanent Delegates, Pausable Config) to manipulate transfers or steal funds.
- Impose hidden **transfer fees** that can eat away your holdings.

This helper allows developers and traders to **quickly and reliably validate tokens** before interacting with them. By using this, you can:

- Avoid interacting with unsafe tokens.
- Automatically filter out scam or dangerous mints in bots or trading platforms.
- Ensure your Solana projects and liquidity pools only include safe, trustworthy tokens.
- Know explicitly if forbidden extensions are present or absent for each token.

> Think of it as your first line of defense against malicious tokens on Solana.

---

## Features

- ✅ Check for forbidden Token-2022 extensions and report whether any are found or none are present
- ✅ Detect active mint authority or freeze authority
- ✅ Validate transfer fees within allowed ranges
- ✅ Single mint or batch mint checking
- ✅ Optional logging suppression for bulk operations
- ✅ Concurrency control for fast batch execution

---

## Installation

```bash
git clone https://github.com/CHToken/filterhelpers.git
cd filterhelpers
npm install
````

---

## Usage

### Single Mint Check

```ts
import { PublicKey } from "@solana/web3.js";
import { connection } from "./utils/connection";
import { PoolFilterManager } from "./filters/pool-filter";
import { CHECK_FREEZE_AUTHORITY, CHECK_IF_MINT_IS_RENOUNCED, CHECK_MINT_FEE, ENABLE_FAST_MODE } from "./utils";
import { ExtensionType } from "@solana/spl-token";

// Array of mints to check
const mints = [
  new PublicKey("UXen71YJpLmm1qect5E8Bww3z2T798n1Wy4Ybs4PVFY"),
];

// Define filter options
const filterOptions = {
  checkFees: CHECK_MINT_FEE,
  checkMintRenounced: CHECK_IF_MINT_IS_RENOUNCED,
  checkFreezable: CHECK_FREEZE_AUTHORITY,
  forbidden: [
    ExtensionType.MintCloseAuthority,
    ExtensionType.PausableConfig,
    ExtensionType.ConfidentialTransferMint,
    ExtensionType.NonTransferable,
    ExtensionType.TransferHook,
    ExtensionType.PermanentDelegate,
  ],
};

(async () => {
  // Initialize the manager with options and concurrency
  const manager = new PoolFilterManager(connection, filterOptions, 20, ENABLE_FAST_MODE);

  // Execute batch check
  const summary = await manager.executeMany(mints);

  // summary.results will include messages indicating whether forbidden extensions are found or none are present
  console.log(summary);
})();
```

### Batch Mint Check

```ts
import { PublicKey } from "@solana/web3.js";
import { connection } from "./utils/connection";
import { PoolFilterManager } from "./filters/pool-filter";
import { CHECK_FREEZE_AUTHORITY, CHECK_IF_MINT_IS_RENOUNCED, CHECK_MINT_FEE, ENABLE_FAST_MODE } from "./utils";
import { ExtensionType } from "@solana/spl-token";

// Array of mints to check
const mints = [
  new PublicKey("CVXB7XCjKyKCftyz6QqtUzzSJKPBF9ECoaEcaw5XLyyM"),
  new PublicKey("2X1N6hJSuHH9yJY7Hok5evMcsUaCXedE127k3jbMEzny"),
  new PublicKey("UXen71YJpLmm1qect5E8Bww3z2T798n1Wy4Ybs4PVFY"),
  new PublicKey("FdohLbj7wck1Qo3WwMNfMqjZWDTyzZYqYxL3NGTmaqGY"),
];

// Define filter options
const filterOptions = {
  checkFees: CHECK_MINT_FEE,
  checkMintRenounced: CHECK_IF_MINT_IS_RENOUNCED,
  checkFreezable: CHECK_FREEZE_AUTHORITY,
  forbidden: [
    ExtensionType.MintCloseAuthority,
    ExtensionType.PausableConfig,
    ExtensionType.ConfidentialTransferMint,
    ExtensionType.NonTransferable,
    ExtensionType.TransferHook,
    ExtensionType.PermanentDelegate,
  ],
};

(async () => {
  // Initialize the manager with options and concurrency
  const manager = new PoolFilterManager(connection, filterOptions, 20, ENABLE_FAST_MODE);

  // Execute batch check
  const summary = await manager.executeMany(mints);

  // summary.results will include messages indicating whether forbidden extensions are found or none are present
  console.log(summary);
})();
```

---

## Scripts

* `npm run dev` → run helper in development mode (uses ts-node)
* `npm run build` → compile TypeScript
* `npm run start` → compile + run compiled JS

---

## Author

**TechyTro DexTycoon**

* Discord: [@TechyTro](https://discord.com/users/techytro)
* Discord Community: [Join Here](https://discord.gg/zxhKAhn2cT)
* Telegram: [@LordOfDevSalt](https://t.me/lordofdevsalt)
* Github: [CHToken](https://github.com/CHToken)

---

## License

ISC
