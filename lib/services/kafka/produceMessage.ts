import { Configurations } from "@config";
import { KafkaMessage } from "@models/KafkaMessage";
import { Producer } from "node-rdkafka";
export class GetKafkaProducer {
  static call(): Promise<Producer> {
    return new Promise((resolve, reject) => {
      console.warn('creating new producer');
      let producer = new Producer({ ...Configurations.KafkaSettings, 'dr_msg_cb': true })

      producer.connect(null, (err) => {
        if (err) {
          console.error("Error on Producer :", err);
        }
      });

      producer.on('ready', () => {
        console.warn('ready');
        resolve(producer);
      });
      producer.on('event.error', (err) => {
        console.log('producer error => ' + JSON.stringify(err));
        producer.disconnect();
        reject(err);
      });
    })
  }
}
const DEFAULT_PARTITION = null;

export class ProduceKafkaMessage {
  private producer: Producer;
  constructor(producer: Producer) {
    this.producer = producer;
  }
  static async call(message: KafkaMessage, topic: string, partition = DEFAULT_PARTITION) {
    const producer = await GetKafkaProducer.call();
    const instance = new ProduceKafkaMessage(producer);
    return instance.call(message, topic, partition);
  }
  call(message: KafkaMessage, topic: string, partition = DEFAULT_PARTITION): Promise<any> {
    return Promise.resolve(this.producer.produce(topic, partition, message.valueBuffer)).then(() => {
      console.warn(`Sucessfully produced to topic: ${topic}`);
      return true;
    });
  }
}