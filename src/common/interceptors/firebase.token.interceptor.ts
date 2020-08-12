import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { UsersService } from '../../db/services/users.service';
import { FirebaseService } from '../services/firebase.service';

import { IUser } from '../../db/interfaces/user.interface';

const ERRORS = {
  INVALIDTOKEN: new UnauthorizedException('Token is not valid.'),
  NOBEARERTOKEN: new BadRequestException('Authorization header should have Bearer token.'),
  NOFIREBASEACCOUNT: new UnauthorizedException('Token doesn\'t belong to a Firebase account.'),
  NOHEADER: new BadRequestException('Authorization header not found.'),
};

@Injectable()
export class FirebaseTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UsersService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const request = context.switchToHttp().getRequest();
        const authHeader: string = request.headers['authorization'];
        request.firebaseUserUid = await this.verifyToken(authHeader);
        request.firebaseUserProfile = await this.firebaseService.getUser(request.firebaseUserUid);
        if (!request.firebaseUserProfile) { throw ERRORS.NOFIREBASEACCOUNT; }
        request.databaseUserId = await this.getUserId(request.firebaseUserUid);
        resolve(next.handle());
      } catch (error) { reject(error); }
    });
  }

  private async createUser(uid: string): Promise<IUser> {
    try {
      const token = await this.firebaseService.createCustomToken(uid);
      const { user } = await this.firebaseService.signInWithCustomToken(token);
      return await this.userService.addUser({ uid: user.uid });
    } catch (error) { throw error; }
  }

  private async getUserId(uid: string): Promise<string> {
    try {
      return await this.userService.getUserByFirebaseUid(uid)
        .then((user) => user.id)
        .catch(async () => (await this.createUser(uid)).id);
    } catch (error) { throw error; }
  }

  private async verifyToken(header: string): Promise<string> {
    try {
      if (!header) { throw ERRORS.NOHEADER; }
      if (!header.startsWith('Bearer ')) { throw ERRORS.NOBEARERTOKEN; }
      const token = header.substring(7, header.length);
      const firebaseUser = await this.firebaseService.verifyToken(token)
        .catch(() => { throw ERRORS.INVALIDTOKEN; });
      return firebaseUser.uid;
    } catch (error) { throw error; }
  }
}
