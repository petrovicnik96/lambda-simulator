import { apiGateway } from "./apiGateway";
import { eventBus } from "./eventBus";
import { logger, LogLevel } from "./utils/logger";
import config from "./utils/config";

import { handler as userRegistrationHandler } from "./functions/userRegistration";
import { handler as placeBetHandler } from "./functions/placeBet";
import { handler as processResultHandler } from "./functions/processResult";
import { handler as getUserProfileHandler } from "./functions/getUserProfile";

if (config.logLevel === "DEBUG") {
    logger.setLevel(LogLevel.DEBUG);
}

config.streams.forEach((stream) => {
    eventBus.createStream(stream);
});

apiGateway.registerRoute(
    "/users",
    "POST",
    userRegistrationHandler,
    "userRegistration"
);

apiGateway.registerRoute("/bets", "POST", placeBetHandler, "placeBet");

apiGateway.registerRoute(
    "/games/result",
    "POST",
    processResultHandler,
    "processResult"
);

apiGateway.registerRoute(
    "/users/:userId",
    "GET",
    getUserProfileHandler,
    "getUserProfile"
);

eventBus.subscribe("user-event", (event) => {
    logger.info(`Processing user event: ${event.eventType}`);
    logger.debug("Event data: ", event);
});

eventBus.subscribe("bet-events", (event) => {
    logger.info(`Processing bet event: ${event.eventType}`);
    logger.debug("Event data: ", event);

    switch (event.eventType) {
        case "BET_PLACED":
            logger.info(`New bet placed: ${event.data.betId}`);
            break;
        case "BET_WON":
            logger.info(
                `Bet won: ${event.data.betId}, winnings: ${event.data.winnings}`
            );
            break;
        case "BET_LOST":
            logger.info(`Bet lost: ${event.data.betId}`);
            break;
    }
});

eventBus.subscribe("game-events", (event) => {
    logger.info(`Processing game event: ${event.eventType}`);
    logger.debug("Event data: ", event);
});

apiGateway.start();

logger.info(`Lambda Simulator running on port ${config.port}`);
logger.info("Registered endpoints:");
logger.info("  POST /users - Register a new user");
logger.info("  POST /bets - Place a new bet");
logger.info("  POST /games/result - Process a game result");
logger.info("  GET /users/:userId - Get user profile");

process.on("SIGINT", () => {
    logger.info("Shutting down Lambda Simulator...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.info("Shutting down Lambda Simulator...");
    process.exit(0);
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection at:", promise, "reason:", reason);
});
