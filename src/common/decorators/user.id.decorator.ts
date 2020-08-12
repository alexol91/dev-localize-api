import { createParamDecorator } from '@nestjs/common';

export const UserId = createParamDecorator((data, req) => req.databaseUserId);
