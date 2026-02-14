import { ImageKitService } from './image-kit.service';
export declare class ImageKitController {
    private readonly imageKitService;
    constructor(imageKitService: ImageKitService);
    getAuthParameters(): {
        token: string;
        expire: number;
        signature: string;
    };
}
