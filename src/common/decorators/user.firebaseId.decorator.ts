import { createParamDecorator } from '@nestjs/common';

export const FirebaseId = createParamDecorator((data, req) => req.firebaseUserUid);
