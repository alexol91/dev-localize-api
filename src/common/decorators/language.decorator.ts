import { createParamDecorator } from '@nestjs/common';

export const Language = createParamDecorator((data, req) => req.lang);
