import { KafkaMessage } from "@models/KafkaMessage";
import events = require("events");
import { KafkaConsumer } from "node-rdkafka";

export enum MesssageFetcherEvents {
  messageReceived = "messageReceived",
  noMessages = "noMessages",
  error = "error",
}
export class FetchMessage extends events.EventEmitter {
  private Consumer: KafkaConsumer;
  constructor(consumer: KafkaConsumer) {
    super();
    this.Consumer = consumer;
    this.Consumer.on("data", (data) => {
      const message = KafkaMessage.fromRawMessage(data);
      this.emit(MesssageFetcherEvents.messageReceived, message);
    });
  }
  do() {
    let promise = new Promise((resolve, reject) => {
      this.Consumer.consume(1, (err, message) => {
        if (message.length === 0) {
          this.emit(MesssageFetcherEvents.noMessages);
        } else {
          resolve(message[0]);
        }
      });
    });
    return promise;
  }
}
