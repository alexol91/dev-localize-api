import * as adminSdk from 'firebase-admin';

import { FirebaseService } from './firebase.service';

import { generateString } from '../../../test/helpers/generate.helper';

export class FirebaseServiceMock {
  createCustomToken(...obj): Promise<string> {
    return new Promise((resolve, reject) => resolve(generateString(30)));
  }

  getIdToken(): Promise<string> {
    return new Promise((resolve, reject) => resolve(generateString(30)));
  }

  getUser(...obj): Promise<{imageUrl?: string, name: string}> {
    return new Promise((resolve, reject) => resolve({ name: generateString(10) }));
  }

  signInWithCustomToken(...obj): Promise<any> {
    return new Promise((resolve, reject) => resolve());
  }

  signOut() {
    return new Promise((resolve, reject) => resolve());
  }

  verifyToken(token: string): Promise<adminSdk.auth.DecodedIdToken> {
    return new Promise((resolve, reject) => resolve({
      aud: undefined,
      auth_time: undefined,
      uid: generateString(30),
      exp: undefined,
      firebase: undefined,
      iat: undefined,
      iss: undefined,
      sub: undefined,
    }));
  }
}

export const FirebaseServiceProvider = {
  provide: FirebaseService,
  useClass: FirebaseServiceMock,
};
