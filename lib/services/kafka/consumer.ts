import events = require('events');
import { KafkaConsumer } from 'node-rdkafka';
import { Configurations } from '@config';
import { createConnection, getConnection } from 'typeorm';
import { FetchMessage } from './fetchMessage';
import { CommitMessage } from './commitMessage';
import { GetKafkaProducer, ProduceKafkaMessage } from './produceMessage';
import { KafkaMessage } from '@models';


export enum MesssageFetcherEvents {
    messageReceived = "messageReceived",
    noMessages = "noMessages"
}
export enum MessageProcessingEvents {   
    finished = 'finished',
    failed = 'failed',
    provisioningDatabaseOutage = 'ProvisioningDatabaseOutage'
}
export class Consumer extends events.EventEmitter {
    private kafkaConsumer: KafkaConsumer
    private messageFetcher: FetchMessage
    private commitMessage: CommitMessage
    private isBrokersAvailable: boolean = true
    private isKafkaConnected: boolean = false
    private produceKafkaMessage: ProduceKafkaMessage
    constructor(kafkaConsumer?: KafkaConsumer) {
        super()
        this.kafkaConsumer = kafkaConsumer || new KafkaConsumer(
            {
                ...Configurations.KafkaSettings,
                offset_commit_cb: (err, topicPartitions) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log(JSON.stringify(topicPartitions));
                },
            },
            {}
        );
        this.on("brokersAvailablityCheck", () => {
            setTimeout(() => {
                this.handleKafkaBrokerDown()
            }, 1000 * 60 * 1);
        })

        this.messageFetcher = new FetchMessage(this.kafkaConsumer);
        this.commitMessage = new CommitMessage(this.kafkaConsumer); 
        this.emit("brokersAvailablityCheck");
       
    }
    do() {
        let promise = new Promise((resolve, reject) => {
            try {
                this.connectToKafka();
                this.kafkaConsumer
                    .on('event.error', (err) => {
                     console.error(`kafkaConsumer failed: error => ${err}`);
                     });
                this.kafkaConsumer.on('ready', () => {
                    console.log('Consumer is ready');
                    this.isBrokersAvailable = true;
                    this.isKafkaConnected = true;
                    console.log('Configurations.getkafkaTopicPendingLegacyRequests,',"topic");
                    this.kafkaConsumer.subscribe(["topic"]);
                    this.startProcessingRequests()
                        .then((result) => resolve(result))
                        .catch((error) => {
                            reject(error);
                            throw error;
                        });
                });
            } catch (error) {
                reject(error);
            }
        });
        return promise;
    }
    private connectToKafka() {
        this.kafkaConsumer.connect({}, (err, data) => { 
            if (err) {
                console.log("Error when initializing connector", err);
            }
         });
        this.kafkaConsumer.on('event.error', (log) => {
            console.error(`Error on Kafka Consumer. ${log}`);
                if (this.kafkaConsumer) {
                    this.kafkaConsumer.disconnect((err, info) => {
                        console.log('Broker unavailability: Disconnected the consumer..');
                    });
                }
                this.kafkaConsumer = null;
                this.isBrokersAvailable = false;
            });
    }
    private handleKafkaBrokerDown()
    {
        if (this.kafkaConsumer) {
            console.log("Active consumer available..")
            this.emit("brokersAvailablityCheck")
            if (!this.isKafkaConnected) {
                this.connectToKafka();
            }
        }
        else
        {
            console.log("No active consumer available. Creating new consumer..")
            const consumer = new Consumer()
            consumer.do()
        }

    }
    private async startProcessingRequests() {
        const producer = await GetKafkaProducer.call();
        this.produceKafkaMessage = new ProduceKafkaMessage(producer);
        this.messageFetcher.on(MesssageFetcherEvents.messageReceived, this.handleRequestReceived.bind(this));
        this.messageFetcher.on(MesssageFetcherEvents.noMessages, this.handleNoRequestsReceived.bind(this));
        return this.fetch();
    }

    private fetch() {
        if (this.isBrokersAvailable)
            return this.messageFetcher.do();
    }
    private handleRequestReceived(message: KafkaMessage) {
       
    }
    private handleNoRequestsReceived(args) {
        setTimeout(() => {
            this.fetch();
        }, 1000);
    }
    private async handleRequestProcessingFinished(message: KafkaMessage) {
        console.log(`Finished processing request`);
        await this.commitMessage.do(message).catch(error => {
            console.error(`ERROR: Unable to commitMessage. ${error}`)
        });
        console.log(`fetching new requests..`);
        this.fetch();
    }
    private async handleRequestProcessingFailed(message: KafkaMessage) {
        await this.commitMessage.do(message).catch(error => {
            console.error(`ERROR: Unable to commitMessage. ${error}`)
        });
        console.log(`fetching new requests..`);
        this.fetch();
    }
    private async handleDBFailure(message: KafkaMessage) {
        await this.commitMessage.seek(message);
        const connection = await getConnection('default');
        connection.close();
        this.stopIntermittently();
    }

    private stopIntermittently(){
        setTimeout(async() => {
            const isDBAvailable = await this.isDBAvailable();
            if(isDBAvailable) {
                this.fetch();
            } else {
                this.stopIntermittently();
            }
        }, 1 * 1000);        
    }

    private async isDBAvailable() {
        try {
            await createConnection('default');
            return true;
        } catch (error) {
            return false;
        }        
    }
}
