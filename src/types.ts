export type LambdaHandler = (
    event: LambdaEvent,
    context: LamdaContext
) => Promise<any>;

export interface LambdaEvent {
    path: string;
    httpMethod: string;
    headers: Record<string, string>;
    queryStringParameters: Record<string, string> | null;
    body: string | null;
    isBase64Encoded: boolean;
    resource?: string;
    pathParameters?: Record<string, string> | null;
    requestContext?: Record<string, any>;
}

export interface LamdaContext {
    functionName: string;
    functionVersion: string;
    invokedFunctionArn: string;
    memoryLimitInMb: string;
    awsRequestId: string;
    logGroupName: string;
    logStreamName: string;
    identity?: {
        cognitoIdentityId?: string;
        cognitoIdentityPoolId?: string;
    } | null;
    clientContext?: {
        client?: {
            installationId?: string;
            appTitle?: string;
            appVersionName?: string;
            appVersionCode?: string;
            appPackageName?: string;
        };
        env?: {
            platformVersion?: string;
            platform?: string;
            make?: string;
            model?: string;
            locale?: string;
        };
    } | null;
    callbackWaitsForEmptyEventLoop: boolean;
    getRemainingTimeInMillis: () => number;
    done: (error?: Error, result?: any) => void;
    fail?: (error: Error | string) => void;
    succeed: (messageOrObject: any) => void;
}

export interface KinesisEvent {
    eventID: string;
    eventType: string;
    eventSource: string;
    data: any;
    timestamp: number;
}

export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    registrationDate: string;
    balance: number;
}

export interface Bet {
    betId: string;
    userId: string;
    gameId: string;
    amount: number;
    odds: number;
    timestamp: string;
    status: "PENDING" | "WON" | "LOST" | "CANCELED";
}

export interface GameResult {
    gameId: string;
    result: string;
    timestamp: string;
}
