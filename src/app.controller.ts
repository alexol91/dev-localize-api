import { Controller, Get, Render, Res } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get('/apple-app-site-association')
  root(@Res() res) {
    return res.sendFile('apple-app-site-association.json');
  }
}
