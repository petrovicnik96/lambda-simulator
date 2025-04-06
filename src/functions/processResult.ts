import { eventBus } from "../eventBus";
import { GameResult, LambdaHandler } from "../types";
import { logger } from "../utils/logger";
import { bets } from "./placeBet";
import { users } from "./userRegistration";

export const handler: LambdaHandler = async (event, context) => {
    logger.info("Process game result function invoked");

    try {
        const body = event.body ? JSON.parse(event.body) : {};

        if (!body.gameId || !body.result) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message:
                        "Missing requried fileds: gameId and result are required",
                }),
            };
        }

        const now = new Date().toISOString();
        const gameResult: GameResult = {
            gameId: body.gameId,
            result: body.result,
            timestamp: now,
        };

        const gameBets = Object.values(bets).filter((bet) => {
            bet.gameId === body.gameId && bet.status === "PENDING";
        });

        if (gameBets.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "No pending bets found for this game",
                }),
            };
        }

        const procesedBets = gameBets.map((bet) => {
            const isWin = body.result === "WIN";
            const newStatus = isWin ? "WON" : "LOST";

            bet.status = newStatus;

            if (isWin) {
                const user = users[bet.userId];

                if (user) {
                    const winnings = bet.amount * bet.odds;
                    user.balance += winnings;

                    eventBus.putEvent("bet-events", "BET_WON", {
                        betId: bet.betId,
                        userId: bet.userId,
                        gameId: bet.gameId,
                        amount: bet.amount,
                        winnings,
                        timestamp: now,
                    });
                }
            } else {
                eventBus.putEvent("bet-event", "BET_LOST", {
                    betId: bet.betId,
                    userId: bet.userId,
                    gameId: bet.gameId,
                    amount: bet.amount,
                    timestamp: now,
                });
            }

            return {
                betId: bet.betId,
                userId: bet.userId,
                status: newStatus,
            };
        });

        eventBus.putEvent("game-events", "GAME_RESULT", {
            gameId: body.gameId,
            result: body.result,
            processedBets: procesedBets.length,
            timestamp: now,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Game result processed successfully",
                game: {
                    gameId: body.gameId,
                    result: body.result,
                    timestamp: now,
                },
                betsProcessed: procesedBets,
            }),
        };
    } catch (error) {
        logger.error("Error processing game result: ", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error: (error as Error).message,
            }),
        };
    }
};

export { bets };