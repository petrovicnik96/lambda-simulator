import { LambdaHandler } from "../types";
import { logger } from "../utils/logger";
import { bets } from "./placeBet";
import { users } from "./userRegistration";

export const handler: LambdaHandler = async (event, context) => {
    logger.info("Get user profile function invoked");

    try {
        const userId = event.pathParameters?.userId;

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missiing requried parameter: userId",
                }),
            };
        }

        const user = users[userId];

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found",
                }),
            };
        }

        const userBets = Object.values(bets).filter(
            (bet) => bet.userId === userId
        );

        const totalBets = userBets.length;
        const wonBets = userBets.filter((bet) => bet.status === "WON").length;
        const lostBets = userBets.filter((bet) => bet.status === "LOST").length;
        const pendingBets = userBets.filter(
            (bet) => bet.status === "PENDING"
        ).length;

        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
        return {
            statusCode: 200,
            body: JSON.stringify({
                userId: user.userId,
                username: user.username,
                email: user.email,
                registrationDate: user.registrationDate,
                balance: user.balance,
                bettingStats: {
                    totalBets,
                    wonBets,
                    lostBets,
                    pendingBets,
                    winRate: winRate.toFixed(2) + "%",
                },
            }),
        };
    } catch (error) {
        logger.error("Error getting user profile:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error: (error as Error).message,
            }),
        };
    }
};
