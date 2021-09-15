import { KafkaStatus } from '@health/KafkaStatus';
import { Request, Response } from 'express';

export class HealthStatusController {
    async show(request: Request, response: Response) {
        const appHealth = {
            appStatus: 'alive',
            hash: process.env.ShortHash
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(appHealth));
    }
    async show1(request: Request, response: Response) {
        const kafka = new KafkaStatus();
        const kafkaHealth = await kafka.connect();
        const health = {
            service_name: 'my-project-template',
            version: '1.0',
            properties: {
                hash: process.env.ShortHash
            },
            items: [kafkaHealth]
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(health));
    }
}