import { HttpModule, Module } from '@nestjs/common';

import { GoogleService } from './google.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}
