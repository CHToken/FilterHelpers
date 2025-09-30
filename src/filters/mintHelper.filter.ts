// src/filters/mintHelper.filter.ts
import { Connection, PublicKey, AccountInfo } from "@solana/web3.js";
import pLimit from "p-limit";
import {
  unpackMint,
  getExtensionTypes,
  ExtensionType,
  getTransferFeeConfig,
  TOKEN_2022_PROGRAM_ID,
  MintLayout,
} from "@solana/spl-token";
import { CHECK_FREEZE_AUTHORITY, CHECK_IF_MINT_IS_RENOUNCED, CHECK_MINT_FEE, MAX_BASIS_POINTS, MIN_BASIS_POINTS } from "../utils";

export interface FilterOptions {
  forbidden?: ExtensionType[];
  minBasisPoints?: number;
  maxBasisPoints?: number;
  checkFees?: boolean;
  checkMintRenounced?: boolean;
  checkFreezable?: boolean;
}

export interface FilterResult {
  ok: boolean;
  message?: string;
}

export interface BatchResult {
  mint: string;
  result: FilterResult;
  success: boolean;
}

export interface BatchSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  overallSuccess: boolean;
  totalDurationMs: number;
  results: BatchResult[];
}

/** Internal: check a single mint */
export async function _checkMint(
  mint: PublicKey,
  preFetched: AccountInfo<Buffer> | null,
  options: FilterOptions = {}
): Promise<FilterResult> {
  if (!preFetched) return { ok: false, message: "Mint account not found" };

  const forbidden = options.forbidden ?? [
    ExtensionType.MintCloseAuthority,
    ExtensionType.PausableConfig,
    ExtensionType.ConfidentialTransferMint,
    ExtensionType.NonTransferable,
    ExtensionType.TransferHook,
    ExtensionType.PermanentDelegate,
  ];
  const minBps = options.minBasisPoints ?? MIN_BASIS_POINTS;
  const maxBps = options.maxBasisPoints ?? MAX_BASIS_POINTS;
  const checkFees = options.checkFees ?? CHECK_MINT_FEE;
  const checkMintRenounced = options.checkMintRenounced ?? CHECK_IF_MINT_IS_RENOUNCED;
  const checkFreezable = options.checkFreezable ?? CHECK_FREEZE_AUTHORITY;

  let mintStruct: any = null;
  let extensions: ExtensionType[] = [];
  let isToken2022 = false;

  try {
    mintStruct = unpackMint(mint, preFetched, TOKEN_2022_PROGRAM_ID);
    extensions = getExtensionTypes(mintStruct.tlvData);
    isToken2022 = true;
  } catch (err: any) {
    if (err.name === "TokenInvalidAccountOwnerError") {
      isToken2022 = false;
    } else {
      return { ok: false, message: `Error unpacking mint: ${err.message}` };
    }
  }

  const decodedLegacy = MintLayout.decode(preFetched.data);
  const mintAuthorityOption = decodedLegacy.mintAuthorityOption;
  const freezeAuthorityOption = decodedLegacy.freezeAuthorityOption;

  const failMessages: string[] = [];
  const forbiddenFound: string[] = [];

  if (isToken2022) {
    for (const ext of extensions) {
      if (forbidden.includes(ext)) forbiddenFound.push(ExtensionType[ext]);
    }

    if (forbiddenFound.length > 0) {
      failMessages.push(`Disallowed extensions found: ${forbiddenFound.join(", ")}`);
    } else {
      failMessages.push("No forbidden extensions found");
    }

    if (checkFees && mintStruct) {
      const feeConfig = getTransferFeeConfig(mintStruct);
      if (feeConfig) {
        const feeBps = feeConfig.newerTransferFee.transferFeeBasisPoints;
        if (feeBps < minBps) failMessages.push(`fee bps ${feeBps} below min ${minBps}`);
        else if (feeBps > maxBps) failMessages.push(`fee bps ${feeBps} above max ${maxBps}`);
      }
    }
  }

  if ((checkMintRenounced && mintAuthorityOption !== 0) || (checkFreezable && freezeAuthorityOption !== 0)) {
    if (checkMintRenounced && mintAuthorityOption !== 0) failMessages.push(`Mint authority not renounced`);
    if (checkFreezable && freezeAuthorityOption !== 0) failMessages.push(`Token has active freeze authority`);
  }

  // If all checks passed but we want to report forbidden extensions explicitly
  const hasFailures = failMessages.some(msg => !msg.includes("No forbidden extensions found"));
  return hasFailures ? { ok: false, message: failMessages.join(" | ") } : { ok: true, message: failMessages.join(" | ") };
}

/**
 * Public: check multiple mints and return detailed summary
 * @param preFetchedInfos optional array of AccountInfo<Buffer> matching mints[]
 */
export async function checkMintsBatch(
  connection: Connection,
  mints: PublicKey[],
  concurrency = 20,
  options: FilterOptions = {},
  preFetchedInfos?: (AccountInfo<Buffer> | null)[]
): Promise<BatchSummary> {
  const batchStart = performance.now();

  if (mints.length === 0) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      overallSuccess: true,
      totalDurationMs: 0,
      results: [],
    };
  }

  const infos = preFetchedInfos ?? (await connection.getMultipleAccountsInfo(mints, "processed"));
  const limit = pLimit(concurrency);

  const results = await Promise.all(
    mints.map((mint, i) => limit(() => _checkMint(mint, infos[i], options)))
  );

  const batchResults: BatchResult[] = mints.map((mint, i) => ({
    mint: mint.toBase58(),
    result: results[i],
    success: results[i].ok,
  }));

  const passed = batchResults.filter(r => r.success).length;
  const failed = batchResults.filter(r => !r.success).length;
  const skipped = 0;
  const total = mints.length;
  const totalDurationMs = performance.now() - batchStart;
  const overallSuccess = failed === 0;

  return {
    total,
    passed,
    failed,
    skipped,
    overallSuccess,
    totalDurationMs,
    results: batchResults,
  };
}
