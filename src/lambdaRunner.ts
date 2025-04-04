import { LambdaEvent, LambdaHandler, LamdaContext } from "./types";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./utils/logger";

const createContext = (functionName: string): LamdaContext => {
  const awsRequestId = uuidv4();
  const startTime = Date.now();

  return {
    functionName,
    functionVersion: "1.0.0",
    invokedFunctionArn: `arn:aws:lambda:local:123456789012:function:${functionName}`,
    memoryLimitInMb: "128",
    awsRequestId,
    logGroupName: `/aws/lambda/${functionName}`,
    logStreamName: `2023/04/04/[$LATEST]${awsRequestId}`,
    identity: null,
    clientContext: null,
    callbackWaitsForEmptyEventLoop: true,
    
    getRemainingTimeInMillis: () => {
      return Math.max(0, 30000 - (Date.now() - startTime));
    },
    done: (error?: Error, result?: any) => {
      if (error) {
        logger.error("Lambda execution failed:", error);
      } else {
        logger.info("Lambda execution completed successfully");
      }
    },
    fail: (error: Error | string) => {
      logger.error("Lambda execution failed:", error);
    },
    succeed: (messageOrObject: any) => {
      logger.info("Lambda execution completed successfully");
    },
  };
};

export const runLambda = async (
  handler: LambdaHandler,
  event: LambdaEvent,
  functionName: string
): Promise<any> => {
  const context = createContext(functionName);

  logger.info(`Starting Lambda execution: ${functionName}`);
  logger.debug("Event:", JSON.stringify(event, null, 2));

  try {
    const startTime = Date.now();
    const result = await handler(event, context);
    const executionTime = Date.now() - startTime;

    logger.info(`Lambda execution completed in ${executionTime}ms`);
    logger.debug("Result:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    logger.error(`Lambda execution failed: ${error}`);
    throw error;
  }
};
