"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageKitModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const image_kit_service_1 = require("./image-kit.service");
const image_kit_controller_1 = require("./image-kit.controller");
let ImageKitModule = class ImageKitModule {
};
exports.ImageKitModule = ImageKitModule;
exports.ImageKitModule = ImageKitModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [image_kit_controller_1.ImageKitController],
        providers: [image_kit_service_1.ImageKitService],
        exports: [image_kit_service_1.ImageKitService],
    })
], ImageKitModule);
//# sourceMappingURL=image-kit.module.js.map