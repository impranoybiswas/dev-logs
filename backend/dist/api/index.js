"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let cachedApp;
const bootstrap = async () => {
    if (!cachedApp) {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        await app.init();
        cachedApp = app;
    }
    return server;
};
exports.bootstrap = bootstrap;
exports.default = async (req, res) => {
    const app = await (0, exports.bootstrap)();
    return app(req, res);
};
//# sourceMappingURL=index.js.map