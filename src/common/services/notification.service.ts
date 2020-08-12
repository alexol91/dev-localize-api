import { Injectable } from '@nestjs/common';
import * as adminSdk from 'firebase-admin';
import { ObjectId } from 'mongodb';

import { UserAppService } from '../../db/services/user.app.service';
import { FirebaseService } from './firebase.service';

const deleteAppErrorCodes = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
];

@Injectable()
export class NotificationService {
  private admin: adminSdk.app.App;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userAppService: UserAppService,
  ) {
    this.admin = this.firebaseService.adminSdk;
  }

  async sendNotification(usertokens: Array<{token: string, userId: ObjectId}>, notification: adminSdk.messaging.NotificationMessagePayload) {
    try {
      await this.admin.messaging().sendToDevice(usertokens.map((t) => t.token), { notification })
        .then((response) =>
          this.analyzeErrors(response.results.reduce((acc, result, index) => {
            if (result.error) { acc.push({ usertoken: usertokens[index], body: result.error }); }
            return acc;
          }, [])));
    } catch (error) { throw error; }
  }

  async sendSilentNotification(usertokens: Array<{token: string, userId: ObjectId}>, data: adminSdk.messaging.DataMessagePayload) {
    try {
      await this.admin.messaging().sendToDevice(usertokens.map((t) => t.token), { data })
        .then((response) =>
          this.analyzeErrors(response.results.reduce((acc, result, index) => {
            if (result.error) { acc.push({usertoken: usertokens[index], body: result.error }); }
            return acc;
          }, [])));
    } catch (error) { throw error; }
  }

  private analyzeErrors(errors: Array<{usertoken: {token: string, userId: ObjectId}, body: adminSdk.FirebaseError}>) {
    errors.filter((e) => deleteAppErrorCodes.includes(e.body.code))
      .forEach((e) => this.userAppService.deleteOne({ userId: e.usertoken.userId, registrationToken: e.usertoken.token  }));
  }
}
