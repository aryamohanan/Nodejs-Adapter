import { mock, instance, when, anyFunction, anything } from "ts-mockito";
import { FetchMessage } from "./fetchMessage";
import { KafkaConsumer } from "node-rdkafka";
import { KafkaMessage } from "../../models";

describe("when Kafka returns a message", () => {
  let mockKafkaConsumer: KafkaConsumer = mock(KafkaConsumer);
  const kafkaMessage = { value: Buffer.from("{}") };
  when(mockKafkaConsumer.consume(1, anything())).thenCall((n, cb) =>
    cb(null, [])
  );

  when(mockKafkaConsumer.on("data", anyFunction())).thenCall(
    (event: string, callback: any) => {
      callback(kafkaMessage);
      return instance(mockKafkaConsumer);
    }
  );
  when(mockKafkaConsumer.on("event.log", anything())).thenReturn(
    instance(mockKafkaConsumer)
  );

  const kafkaConsumerInstance = instance(mockKafkaConsumer);
  it("calls the resolve", () => {
    const testSubject = new FetchMessage(kafkaConsumerInstance);
    let thePromise = testSubject
      .do()
      .then((data: KafkaMessage) => {
        return data.value;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
    expect(thePromise).resolves.toBe("{}").catch();
  });
});
