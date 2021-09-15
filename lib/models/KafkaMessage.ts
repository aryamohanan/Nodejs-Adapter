export class KafkaMessage {
    raw: any;
    value: string;
    constructor() { }

    get toJSON() {
        return {
            value: this.value,
        }
    }
    get valueBuffer(): Buffer {
        return Buffer.from(this.value);
    }
    static fromRawMessage(raw) {
        const instance = new KafkaMessage();
        instance.raw = raw;
        instance.value = raw.value.toString();
        return instance;
    }
}
