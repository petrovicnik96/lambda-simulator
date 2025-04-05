import { eventBus } from "../eventBus";
import { LambdaHandler, UserProfile } from "../types";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

const users: Record<string, UserProfile> = {};

export const handler: LambdaHandler = async (event, context) => {
    logger.info("User registration function invoked");

    try {
        const body = event.body ? JSON.parse(event.body) : {};

        if (!body.username || !body.email) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message:
                        "Missing required fields: username and email are required.",
                }),
            };
        }

        const existingUser = Object.values(users).find(
            (user) =>
                user.email === body.email || user.username === body.username
        );

        if (existingUser) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: "User with this username or email already exists",
                }),
            };
        }

        const userId = uuidv4();
        const now = new Date().toISOString();

        const newUser: UserProfile = {
            userId,
            username: body.username,
            email: body.email,
            registrationDate: now,
            balance: 1000,
        };

        users[userId] = newUser;

        eventBus.putEvent("user-events", "USER-CREATED", {
            userId,
            username: body.username,
            email: body.email,
            timeStamp: now,
        });

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "User registered successfully",
                user: {
                    userId,
                    username: body.username,
                    email: body.email,
                    registrationDate: now,
                },
            }),
        };
    } catch (error) {
        logger.error("Error in user registration: ", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error: (error as Error).message,
            }),
        };
    }
};

export { users };