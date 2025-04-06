import { eventBus } from "../eventBus";
import { Bet, LambdaHandler } from "../types";
import { logger } from "../utils/logger";
import { users } from "./userRegistration";
import { v4 as uuidv4 } from "uuid";

export const bets: Record<string, Bet> = {};

export const handler: LambdaHandler = async (event, context) => {
    logger.info("Place bet function invoked");

    try {
        const body = event.body ? JSON.parse(event.body) : {};

        if (!body.userId || !body.gameId || !body.amount || !body.odds) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message:
                        "Missing required fields: userId, gameId, amount, and odds are required",
                }),
            };
        }

        const user = users[body.userId];
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found",
                }),
            };
        }

        if (user.balance < body.amount) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Insufficient balance",
                }),
            };
        }

        const betId = uuidv4();
        const now = new Date().toISOString();

        const bet: Bet = {
            betId,
            userId: body.userId,
            gameId: body.gameId,
            amount: body.amount,
            odds: body.odds,
            timestamp: now,
            status: "PENDING",
        };

        user.balance -= body.balance;
        bets[betId] = bet;

        eventBus.putEvent("bet-events", "BET_PLACED", {
            betId,
            userId: body.userId,
            gameId: body.gameId,
            amount: body.amount,
            odds: body.odds,
            timestamp: now,
        });
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Bet placed successfully",
                bet: {
                    betId,
                    gameId: body.gameId,
                    amount: body.amount,
                    odds: body.odds,
                    timestamp: now,
                    status: "PENDING",
                },
                currentBalance: user.balance,
            }),
        };
    } catch (error) {
        logger.error("Error in placing bet:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error: (error as Error).message,
            }),
        };
    }
};