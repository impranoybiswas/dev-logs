import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// NOTE: We MUST use 'import Pusher = require("pusher")' because the pusher library
// uses 'module.exports = Pusher'. Using 'import Pusher from "pusher"' with
// esModuleInterop results in 'pusher.default' being undefined at runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Pusher = require('pusher');

@Injectable()
export class PusherService {
  private pusher: Pusher;
  private readonly logger = new Logger(PusherService.name);

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('PUSHER_APP_ID');
    const key = this.configService.get<string>('PUSHER_KEY');
    const secret = this.configService.get<string>('PUSHER_SECRET');
    const cluster = this.configService.get<string>('PUSHER_CLUSTER');

    this.logger.log(
      `Initializing Pusher with AppID: ${appId}, Key: ${key}, Cluster: ${cluster}`,
    );

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

  async trigger(channel: string, event: string, data: any) {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      this.logger.error(
        `Pusher trigger failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
