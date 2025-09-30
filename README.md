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
import { Connection, PublicKey } from "@solana/web3.js";
import { checkMint } from "./helpers/checkMintHelper";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const mint = new PublicKey("GFQrFKLviLPwfsGTasmQWHq5a9Y4bepUJyxyvbenivsP");

(async () => {
  const result = await checkMint(connection, mint, "token2022");
  console.log(result);
})();
```

### Batch Mint Check

```ts
import { checkMintsBatch } from "./helpers/checkMintHelper";

const mints = [
  new PublicKey("MintAddress1"),
  new PublicKey("MintAddress2")
];

const results = await checkMintsBatch(connection, mints, "token2022");
console.log(results);
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
