import { KafkaConsumer } from "node-rdkafka";
import { Configurations } from "../../config";
import { HealthCheckItem } from "../models/HealthCheckItem";
import { Status } from "../models/enums/Status";

export class KafkaStatus {
  public kafkaConsumer: KafkaConsumer;
  constructor(kafkaConsumer?: KafkaConsumer) {
    this.kafkaConsumer = kafkaConsumer || new KafkaConsumer(Configurations.KafkaSettings, {})
  }

  connect = () => {
    const promiseResult = new Promise<HealthCheckItem>((resolve, reject) => {
      try {
        const settings = JSON.parse(JSON.stringify(Configurations.KafkaSettings));
        const healthData = `{"name": "Kafka connection check",
            "properties": {"BrokerList":"${settings['metadata.broker.list']}"},
            "descriptionHref":"${settings['group.id']}"}`;
        let healthItem = new HealthCheckItem(healthData);
        this.kafkaConsumer.connect()
          .on('ready', () => {
            healthItem.setHealthStatus(Status.green, 'Successfully connected to Kafka service');
            resolve(healthItem);
          }).on('connection.failure', (err) => {
            healthItem.setHealthStatus(Status.red, err);
            resolve(healthItem);
          });
      }
      catch (Err) {
        console.log('error:', Err);
        reject(Err);
      }
      finally {
        this.kafkaConsumer.disconnect();
      }
    })
    return promiseResult;
  }
}
