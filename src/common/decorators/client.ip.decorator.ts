import { createParamDecorator } from '@nestjs/common';

export const ClientIP = createParamDecorator((data, req) => req.clientIP);
