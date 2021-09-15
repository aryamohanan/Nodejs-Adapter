import { mock, instance, when, anyFunction } from "ts-mockito";
import { KafkaStatus } from "./KafkaStatus";
import { KafkaConsumer } from "node-rdkafka";

describe('when KafkaStatus is called ', () => {  
  let mockKafkaConsumer: KafkaConsumer = mock(KafkaConsumer);
  const kafkaConsumerInstance = instance(mockKafkaConsumer);
  when(mockKafkaConsumer.connect()).thenReturn(instance(mockKafkaConsumer));  
  
  it('should return OK(200) status once it got connected', async () => {
    when(mockKafkaConsumer.on('ready', anyFunction())).thenCall((_event: string, callback) => {
      callback();
      return instance(mockKafkaConsumer);
    });
    const testSubject = new KafkaStatus(kafkaConsumerInstance);
    let thePromise = await testSubject.connect();   
    expect(thePromise.status).toStrictEqual('green');
  });
});
