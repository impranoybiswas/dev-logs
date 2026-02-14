import { ConfigService } from '@nestjs/config';
export declare class ImageKitService {
    private configService;
    private imagekit;
    constructor(configService: ConfigService);
    getAuthenticationParameters(): {
        token: string;
        expire: number;
        signature: string;
    };
}
