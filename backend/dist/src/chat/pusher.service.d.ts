import { ConfigService } from '@nestjs/config';
export declare class PusherService {
    private configService;
    private pusher;
    private readonly logger;
    constructor(configService: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
}
