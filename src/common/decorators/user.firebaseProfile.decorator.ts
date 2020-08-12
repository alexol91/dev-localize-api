import { createParamDecorator } from '@nestjs/common';

export const FirebaseProfile = createParamDecorator((data, req) => req.firebaseUserProfile);
