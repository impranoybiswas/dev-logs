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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const job_applications_service_1 = require("./job-applications.service");
const create_job_application_dto_1 = require("./dto/create-job-application.dto");
const update_job_application_dto_1 = require("./dto/update-job-application.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let JobApplicationsController = class JobApplicationsController {
    jobApplicationsService;
    constructor(jobApplicationsService) {
        this.jobApplicationsService = jobApplicationsService;
    }
    create(req, createJobApplicationDto) {
        return this.jobApplicationsService.create(req.user.userId, createJobApplicationDto);
    }
    findAll(req) {
        return this.jobApplicationsService.findAll(req.user.userId);
    }
    findOne(req, id) {
        return this.jobApplicationsService.findOne(req.user.userId, id);
    }
    update(req, id, updateJobApplicationDto) {
        return this.jobApplicationsService.update(req.user.userId, id, updateJobApplicationDto);
    }
    remove(req, id) {
        return this.jobApplicationsService.remove(req.user.userId, id);
    }
};
exports.JobApplicationsController = JobApplicationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_job_application_dto_1.CreateJobApplicationDto]),
    __metadata("design:returntype", void 0)
], JobApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_job_application_dto_1.UpdateJobApplicationDto]),
    __metadata("design:returntype", void 0)
], JobApplicationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobApplicationsController.prototype, "remove", null);
exports.JobApplicationsController = JobApplicationsController = __decorate([
    (0, common_1.Controller)('job-applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [job_applications_service_1.JobApplicationsService])
], JobApplicationsController);
//# sourceMappingURL=job-applications.controller.js.map