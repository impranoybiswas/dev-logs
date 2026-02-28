import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Allow the request to proceed even if there is no valid JWT
  handleRequest<TUser = any>(
    _err: any,
    user: TUser,
    _info: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    //TODO : Should I remove context?
    _context: ExecutionContext,
  ): TUser {
    // If no user is found (no token or invalid token), just return null (no throw)
    return user || (null as TUser);
  }
}
