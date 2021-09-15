export class Configurations {
    public static get port() {
        return process.env.port;
    }
    public static get KafkaSettings(): {} {
        const kafkaConfigurationSetting = {
            'group.id': process.env.kafkaGroupId,
            'metadata.broker.list': `${process.env.kafkaBrokerList}:${process.env.kafkaBrokerPort}`,
            'enable.auto.commit': false
        }
        return kafkaConfigurationSetting
    }
}
