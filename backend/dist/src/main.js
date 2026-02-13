"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedApp;
async function bootstrap() {
    if (!cachedApp) {
        const server = (0, express_1.default)();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors({
            origin: process.env.FRONTEND_URL || '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
            allowedHeaders: 'Content-Type, Accept, Authorization',
        });
        await app.init();
        cachedApp = app;
    }
    return cachedApp;
}
exports.default = async (req, res) => {
    const app = await bootstrap();
    const instance = app.getHttpAdapter().getInstance();
    instance(req, res);
};
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    bootstrap()
        .then(async (app) => {
        await app.listen(process.env.PORT ?? 3001);
        console.log(`Application is running on: ${await app.getUrl()}`);
    })
        .catch((error) => console.error(error));
}
//# sourceMappingURL=main.js.map