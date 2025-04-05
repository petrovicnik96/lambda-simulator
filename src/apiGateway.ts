import express, { Request, Response, NextFunction } from "express";
import { KinesisEvent, LambdaEvent, LambdaHandler } from "./types";
import { log } from "console";
import { logger } from "./utils/logger";
import { json } from "stream/consumers";
import { runLambda } from "./lambdaRunner";

export class ApiGateway {
    private app: express.Application;
    private routes: Map<
        string,
        { method: string; handler: LambdaHandler; functionName: string }
    >;

    constructor() {
        this.app = express();
        this.routes = new Map();

        this.app.use(express.json);
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`${req.method} ${req.path}`);
            next();
        });

        this.app.use(
            (err: Error, req: Request, res: Response, next: NextFunction) => {
                logger.error("API Gateway error: ", err);
                res.status(500).json({
                    message: "Internal server error",
                    error: err.message,
                });
            }
        );
    }

    registerRoute(
        path: string,
        method: string,
        handler: LambdaHandler,
        functionName: string
    ): void {
        const routeKey = `${method.toUpperCase()}:${path}`;
        this.routes.set(routeKey, {
            method: method.toUpperCase(),
            handler,
            functionName,
        });

        this.app[method.toLowerCase() as "get" | "post" | "put" | "delete"](
            path,
            async (req: Request, res: Response) => {
                try {
                    const event = this.convertRequestToEvent(req);

                    const result = await runLambda(
                        handler,
                        event,
                        functionName
                    );

                    if (result.statusCode) {
                        res.status(result.statusCode);
                    }

                    if (result.headers) {
                        Object.entries(result.headers).forEach(
                            ([key, value]) => {
                                res.setHeader(key, value as string);
                            }
                        );
                    }

                    if (result.body) {
                        const body =
                            typeof result.body === "string"
                                ? result.body
                                : JSON.stringify(result.body);

                        result.send(body);
                    } else {
                        res.send();
                    }
                } catch (error) {
                    logger.error("Error executing Lambda function: ", error);
                    res.status(500).json({
                        message: "Error executing Lambda function",
                        error: (error as Error).message,
                    });
                }
            }
        );
    }

    convertRequestToEvent(req: Request): LambdaEvent {
        return {
            path: req.path,
            httpMethod: req.method,
            headers: req.headers as Record<string, string>,
            queryStringParameters: req.query as Record<string, string>,
            body: req.body ? JSON.stringify(req.body) : null,
            isBase64Encoded: false,
            pathParameters: req.params || null,
            requestContext: {
                requestId: req.get("X-Request-Id") || `req-${Date.now()}`,
                requestTime: new Date().toISOString(),
                identity: {
                    sourceIp: req.ip,
                },
            },
        };
    }

    start(port: number = 3000): void {
        this.app.listen(port, () => {
            logger.info(
                `API Gateway simulator running at http://localhost:${port}`
            );
        });
    }

    getApp(): express.Application {
        return this.app;
    }
}

export const apiGateway = new ApiGateway();