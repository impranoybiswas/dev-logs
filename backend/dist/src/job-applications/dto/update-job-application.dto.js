"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateJobApplicationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_job_application_dto_1 = require("./create-job-application.dto");
class UpdateJobApplicationDto extends (0, mapped_types_1.PartialType)(create_job_application_dto_1.CreateJobApplicationDto) {
}
exports.UpdateJobApplicationDto = UpdateJobApplicationDto;
//# sourceMappingURL=update-job-application.dto.js.map