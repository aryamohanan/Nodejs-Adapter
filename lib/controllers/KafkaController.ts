import { KafkaMessage } from "@models/KafkaMessage";
import { ProduceKafkaMessage } from "@services/kafka/produceMessage";
import { Request, Response } from 'express';

export class KafkaController {

    async create(request: Request, response: Response) {
        let payload = { value: `${JSON.stringify(request.body)}` };
        console.warn(JSON.stringify(payload));
        let message = KafkaMessage.fromRawMessage(payload);
        return ProduceKafkaMessage.call(message, 'test')//provide your topic here
            .then(() => {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(payload));
            })
    }
}