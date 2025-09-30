import dotenv from 'dotenv';
import { Commitment } from '@solana/web3.js';
import { logger } from './logger';
import { Logger } from 'winston';

dotenv.config();

const retrieveEnvVariable = (variableName: string, logger: Logger) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    logger.error(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

// Connection
export const NETWORK = 'mainnet-beta';
export const COMMITMENT_LEVEL: Commitment = retrieveEnvVariable('COMMITMENT_LEVEL', logger) as Commitment;
export const RPC_ENDPOINT = retrieveEnvVariable('RPC_ENDPOINT', logger);
export const RPC_WEBSOCKET_ENDPOINT = retrieveEnvVariable('RPC_WEBSOCKET_ENDPOINT', logger);


// Filters
export const ENABLE_FILTER_CHECK = retrieveEnvVariable('ENABLE_FILTER_CHECK', logger) === 'true';
export const CHECK_FREEZE_AUTHORITY = retrieveEnvVariable('CHECK_FREEZE_AUTHORITY', logger) === 'true';
export const CHECK_IF_MINT_IS_RENOUNCED = retrieveEnvVariable('CHECK_IF_MINT_IS_RENOUNCED', logger) === 'true';
export const MAX_ALLOWED_FAILED_FILTERS = Number(retrieveEnvVariable('MAX_ALLOWED_FAILED_FILTERS', logger));
export const MIN_BASIS_POINTS = Number(retrieveEnvVariable('MIN_BASIS_POINTS', logger));
export const MAX_BASIS_POINTS = Number(retrieveEnvVariable('MAX_BASIS_POINTS', logger));
export const CHECK_MINT_FEE = retrieveEnvVariable('CHECK_MINT_FEE', logger) === 'true';
export const ENABLE_FAST_MODE = retrieveEnvVariable('ENABLE_FAST_MODE', logger) === 'true';