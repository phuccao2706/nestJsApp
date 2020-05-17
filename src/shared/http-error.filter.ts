import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const userResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: req.url,
      method: req.method,
      message: exception.getResponse()['error'] || exception.getResponse(),
    };

    Logger.error(
      `${req.method} ${req.url}`,
      JSON.stringify(userResponse),
      'Exception Filter',
    );

    res.status(status).json(userResponse);
  }
}
