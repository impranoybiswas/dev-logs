"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Pusher = require("pusher");
let PusherService = PusherService_1 = class PusherService {
    configService;
    pusher;
    logger = new common_1.Logger(PusherService_1.name);
    constructor(configService) {
        this.configService = configService;
        const appId = this.configService.get('PUSHER_APP_ID');
        const key = this.configService.get('PUSHER_KEY');
        const secret = this.configService.get('PUSHER_SECRET');
        const cluster = this.configService.get('PUSHER_CLUSTER');
        this.logger.log(`Initializing Pusher with AppID: ${appId}, Key: ${key}, Cluster: ${cluster}`);
        if (!appId || !key || !secret || !cluster) {
            this.logger.error('Pusher configuration is incomplete!');
        }
        this.pusher = new Pusher({
            appId: appId || '',
            key: key || '',
            secret: secret || '',
            cluster: cluster || '',
            useTLS: true,
        });
    }
    async trigger(channel, event, data) {
        try {
            await this.pusher.trigger(channel, event, data);
        }
        catch (error) {
            this.logger.error(`Pusher trigger failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = PusherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PusherService);
//# sourceMappingURL=pusher.service.js.map