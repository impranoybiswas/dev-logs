import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<{
        id: string;
        email: string;
        name: string;
    } | null>;
    login(user: {
        email: string;
        id: string;
        name: string;
    }): {
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
    register(data: RegisterDto): Promise<import("../users/users.service").SafeUser>;
}
