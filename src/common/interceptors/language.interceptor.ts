import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    let lang: string = request.headers['accept-language'];
    if (!lang || lang.length < 2) { lang = 'en'; }
    if (lang.length > 2) { lang = lang.toLowerCase().substring(0, 2); }
    request.lang = lang;
    return next.handle();
  }
}
