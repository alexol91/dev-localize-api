import { NotificationService } from './notification.service';

export class NotificationServiceMock {
  sendNotification() {
    return new Promise((resolve, reject) => resolve());
  }
}

export const NotificationServiceProvider = {
  provide: NotificationService,
  useClass: NotificationServiceMock,
};
