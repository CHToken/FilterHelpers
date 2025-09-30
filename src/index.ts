// src/index.ts
import { PublicKey } from "@solana/web3.js";
import { connection } from "./utils/connection";
import { PoolFilterManager } from "./filters/pool-filter";
import { CHECK_FREEZE_AUTHORITY, CHECK_IF_MINT_IS_RENOUNCED, CHECK_MINT_FEE, ENABLE_FAST_MODE } from "./utils";
import { ExtensionType } from "@solana/spl-token";

const mints = [
  new PublicKey("CVXB7XCjKyKCftyz6QqtUzzSJKPBF9ECoaEcaw5XLyyM"),
  new PublicKey("2X1N6hJSuHH9yJY7Hok5evMcsUaCXedE127k3jbMEzny"),
  new PublicKey("UXen71YJpLmm1qect5E8Bww3z2T798n1Wy4Ybs4PVFY"),
  new PublicKey("FdohLbj7wck1Qo3WwMNfMqjZWDTyzZYqYxL3NGTmaqGY"),
];

// --- Define filter options ---
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
  // Pass options and fastMode to manager
  const manager = new PoolFilterManager(connection, filterOptions, 20, ENABLE_FAST_MODE);

  // Execute batch
  await manager.executeMany(mints);
})();
