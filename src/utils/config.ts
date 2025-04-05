import { log } from "console";

interface Config {
    port: number;
    logLevel: string;
    region: string;
    accountId: string;
    lambdaTimeoutMs: number;
    streams: string[];
}

const defaultConfig: Config = {
    port: 3000,
    logLevel: "INFO",
    region: "local",
    accountId: "1234567890",
    lambdaTimeoutMs: 30000,
    streams: ["user-events", "game-events", "bet-events"],
};

export const config: Config = {
    port: parseInt(process.env.PORT || defaultConfig.port.toString(), 10),
    logLevel: process.env.LOG_LEVEL || defaultConfig.logLevel,
    region: process.env.REGION || defaultConfig.region,
    accountId: process.env.ACCOUNT_ID || defaultConfig.accountId,
    lambdaTimeoutMs: parseInt(
        process.env.LAMBDA_TIMEOUT_MS ||
            defaultConfig.lambdaTimeoutMs.toString(),
        10
    ),
    streams: process.env.STREAMS
        ? process.env.STREAMS.split(",")
        : defaultConfig.streams,
};

export default config;
