import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { ControllerResponse } from '../models/api.response.model';

const DEFAULT_MESSAGE = {
  message: 'Unknown error',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const { message, status } = exception.response
      ? this.formatRegularException(exception)
      : (exception.name
          ? this.formatMongoException(exception)
          : DEFAULT_MESSAGE);
    const resp = new ControllerResponse();
    response.code(status).send(resp.Failed(status.toString(), message));
  }

  private formatMongoException(exception: any) {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    return { message, status };
  }

  private formatRegularException(exception: any) {
    const response = exception.response;
    const status = exception.status || DEFAULT_MESSAGE.status;
    const message = typeof response.message === 'string'
      ? response.message
      : (Array.isArray(response.message)
        ? this.formatMessageArrayOfExceptions(response.message)
        : DEFAULT_MESSAGE.message);
    return { message, status };
  }

  private formatMessageArrayOfExceptions(exceptions: any[]) {
    return exceptions.map((e) => Object.keys(e.constraints).map((key) => e.constraints[key]).join(';')).join(';');
  }
}
