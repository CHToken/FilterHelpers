// src/filters/pool-filter.ts
import { Connection, PublicKey } from "@solana/web3.js";
import { BatchSummary, checkMintsBatch, FilterOptions } from "./mintHelper.filter";
import {
  ENABLE_FILTER_CHECK,
  MAX_ALLOWED_FAILED_FILTERS,
  ENABLE_FAST_MODE,
} from "../utils";

export class PoolFilterManager {
  private readonly options: FilterOptions;
  private readonly concurrency: number;
  private readonly fastMode: boolean;

  constructor(
    readonly connection: Connection,
    options: FilterOptions = {},
    concurrency = 50,
    fastMode = ENABLE_FAST_MODE
  ) {
    this.options = options;
    this.concurrency = concurrency;
    this.fastMode = fastMode;
    if (ENABLE_FILTER_CHECK) {
      console.log(
        `🔹 FilterHelpers enabled${fastMode ? " (FAST mode)" : ""} (Token-2022 extensions + mint/freeze authority checks).`
      );
    }
  }

  /**
   * Unified check for single or multiple mints.
   * Logs everything in one block for easier debugging.
   */
  public async executeMany(mints: PublicKey[] | PublicKey): Promise<BatchSummary> {
    if (!ENABLE_FILTER_CHECK) {
      console.log("⚠️ Filter check is disabled. Exiting without running any checks.");
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

    const mintArray = Array.isArray(mints) ? mints : [mints];
    const batchStart = performance.now();

    try {
      // --- Determine which filters to run ---
      const effectiveOptions: FilterOptions = this.fastMode
        ? {
            ...this.options,
            checkFees: false,
            checkMintRenounced: this.options.checkMintRenounced ?? true,
            checkFreezable: this.options.checkFreezable ?? true,
            forbidden: [],
          }
        : this.options;

      // Log which filters are active for this batch
      const activeFilters = [
        effectiveOptions.checkFees ? "Fee Check" : null,
        effectiveOptions.checkMintRenounced ? "Mint Renounced" : null,
        effectiveOptions.checkFreezable ? "Freeze Authority" : null,
        effectiveOptions.forbidden && effectiveOptions.forbidden.length > 0 ? "Forbidden Extensions" : null,
        this.fastMode ? "Fast Mode" : null
      ].filter(Boolean);
      console.log(
        `🔹 Running batch with filters: ${activeFilters.join(", ") || "None"}`
      );

      // --- Run the batch ---
      const batchSummary = await checkMintsBatch(
        this.connection,
        mintArray,
        this.concurrency,
        effectiveOptions
      );

      batchSummary.overallSuccess =
        batchSummary.failed <= MAX_ALLOWED_FAILED_FILTERS;

      // --- Unified logging ---
      const unifiedLog = {
        total: batchSummary.total,
        passed: batchSummary.passed,
        failed: batchSummary.failed,
        skipped: batchSummary.skipped,
        overallSuccess: batchSummary.overallSuccess,
        totalDurationMs: batchSummary.totalDurationMs.toFixed(2),
        activeFilters,
        details: batchSummary.results.map((r) => ({
          mint: r.mint,
          success: r.success,
          message: r.result.message || "OK",
        })),
      };
      console.log(JSON.stringify(unifiedLog, null, 2));

      if (!batchSummary.overallSuccess) {
        console.warn(
          `⚠️ Batch check failed: ${batchSummary.failed} mints failed, which exceeds MAX_ALLOWED_FAILED_FILTERS (${MAX_ALLOWED_FAILED_FILTERS}).`
        );
      }

      return batchSummary;
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`❌ Batch filter error: ${msg}`);
      const results = mintArray.map((mint) => ({
        mint: mint.toBase58(),
        result: { ok: false, message: msg },
        success: false,
      }));
      const summary: BatchSummary = {
        total: mintArray.length,
        passed: 0,
        failed: mintArray.length,
        skipped: 0,
        overallSuccess: false,
        totalDurationMs: performance.now() - batchStart,
        results,
      };
      console.log(JSON.stringify(summary, null, 2));
      return summary;
    }
  }
}