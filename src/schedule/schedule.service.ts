import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Interval, NestDistributedSchedule  } from 'nest-schedule';

import { GroupCodeService } from '../db/services/groupcode.service';

const HOUR = 3600000;

const DAYS_BEFORE_GROUP_CODE_EXPIRATION = 4;

@Injectable()
export class ScheduleService extends NestDistributedSchedule {
  constructor(private groupCodeService: GroupCodeService) {
    super();
  }

  tryLock?(method: string): boolean | (() => void) | Promise<TryRelease> {
    return true;
  }

  @Interval(HOUR, {key: 'groupcodes', immediate: true})
  async changeExpiredGroupCodes() {
    const date = new Date();
    date.setDate(date.getDate() - DAYS_BEFORE_GROUP_CODE_EXPIRATION);
    const codes = await this.groupCodeService.findMany({ createdAt: { $lte: date } });
    await Promise.all(codes.map((code) =>
      this.groupCodeService.updateCode(new ObjectId(code.groupId), code)));
  }
}
