import { EventEmitter } from "stream";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";
import { KinesisEvent } from "./types";

class EventBus {
    private emitter: EventEmitter;
    private streams: Map<string, any[]>;

    constructor() {
        this.emitter = new EventEmitter();
        this.streams = new Map();

        this.emitter.setMaxListeners(100);
        logger.info("Event Bus initialized.");
    }

    createStream(streamName: string): void {
        if (!this.streams.has(streamName)) {
            this.streams.set(streamName, []);
            logger.info(`Created new stream: ${streamName}`);
        }
    }

    putEvent(streamName: string, eventType: string, data: any): string {
        if (!this.streams.has(streamName)) {
            this.createStream(streamName);
        }

        const eventId = uuidv4();
        const timestamp = Date.now();

        const event: KinesisEvent = {
            eventID: eventId,
            eventType,
            eventSource: streamName,
            data,
            timestamp,
        };

        const stream = this.streams.get(streamName);
        if (stream) {
            stream.push(event);

            // Simulate Kinesis retention (push last 1000 events)
            if (stream.length > 1000) {
                stream.shift();
            }
        }

        this.emitter.emit(streamName, event);

        logger.info(`Event published to stream ${streamName}: ${eventType}`);
        logger.debug("Event data: ", JSON.stringify(event, null, 2));

        return eventId;
    }

    subscribe(
        streamName: string,
        callback: (event: KinesisEvent) => void
    ): void {
        if (!this.streams.has(streamName)) {
            this.createStream(streamName);
        }

        this.emitter.on(streamName, callback);
        logger.info(`New subscriber added to stream: ${streamName}`);
    }

    unsubscribe(
        streamName: string,
        callback: (event: KinesisEvent) => void
    ): void {
        this.emitter.off(streamName, callback);
        logger.info(`Subscriber removed from stream: ${streamName}`);
    }

    getEvents(streamName: string, limit: number = 10): KinesisEvent[] {
        if (!this.streams.has(streamName)) {
            logger.warn(`Stream ${streamName} does not exist`);
            return [];
        }

        const stream = this.streams.get(streamName) || [];
        const events = stream.slice(-limit);

        logger.info(
            `Rertrievend ${events?.length} events from stream ${streamName}`
        );

        return events;
    }
}

export const eventBus = new EventBus();
