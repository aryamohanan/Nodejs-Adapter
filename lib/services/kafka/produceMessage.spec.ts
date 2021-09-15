import { ProduceKafkaMessage } from "./produceMessage";
import { Producer } from "node-rdkafka";
import { mock, instance, when, anything } from "ts-mockito";
import { KafkaMessage } from "@models";

let producerMock = mock(Producer);
when(producerMock.produce(anything(), anything(), anything())).thenReturn(true);
let producer: Producer = instance(producerMock);

describe('Kafka Produce - tests', () => {

  describe('when attempting to produce a kafka message', () => {

    describe('with valid parameters', () => {
      it('correctly sends it to kafka', async () => {
        let testCase = KafkaMessage.fromRawMessage({"value":"sample"});
        let testSubject = new ProduceKafkaMessage(producer);
        await testSubject.call(testCase, 'topic_name').then(testResult => {
          return expect(testResult).toBe(true);
        });
      });
    });
  });
});