import { ResumeService, Resume } from './resume.service';
export declare class ResumeController {
    private readonly resumeService;
    constructor(resumeService: ResumeService);
    getResume(req: any): Promise<Resume | null>;
    updateResume(req: any, data: any): Promise<Resume | null>;
}
