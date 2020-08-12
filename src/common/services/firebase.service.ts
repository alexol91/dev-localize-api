import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase';
import * as adminSdk from 'firebase-admin';
import { ObjectId } from 'mongodb';

import { UsersService } from '../../db/services/users.service';

@Injectable()
export class FirebaseService {
  private admin: adminSdk.app.App;
  private app: firebase.app.App;

  get adminSdk() { return this.admin; }

  constructor(private readonly usersService: UsersService) {
    this.setupFirebase();
    this.setupFirebaseAdminSDK();
  }

  createCustomToken(uid: string): Promise<string> {
    return new Promise((resolve, reject) =>
      this.admin.auth().createCustomToken(uid)
        .then((token) => resolve(token))
        .catch((err) => reject(err)));
  }

  getIdToken(): Promise<string> {
    return new Promise((resolve, reject) =>
      this.app.auth().currentUser.getIdToken()
        .then((token) => resolve(token))
        .catch((err) => reject(err)));
  }

  getUser(uid: string): Promise<{imageUrl?: string, name: string}> {
    return new Promise((resolve, reject) =>
      this.admin.auth().getUser(uid)
        .then((user) => resolve({
          imageUrl: user.photoURL,
          name: user.displayName || user.email.split('@')[0],
        }))
        .catch(async (err) => {
          if (err.errorInfo && err.errorInfo.code === 'auth/user-not-found') {
            const user = await this.usersService.getUserByFirebaseUid(uid);
            await this.usersService.deleteUser(new ObjectId(user.id)).catch(() => undefined);
          }
          resolve(undefined);
        }));
  }

  signInWithCustomToken(token): Promise<any> {
    return new Promise((resolve, reject) =>
      this.app.auth().signInWithCustomToken(token)
        .then((res) => resolve(res))
        .catch((error) => reject(error)));
  }

  signOut(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.app.auth().signOut()
        .then(() => resolve())
        .catch((err) => reject(err)));
  }

  verifyToken(token: string): Promise<adminSdk.auth.DecodedIdToken> {
    return new Promise((resolve, reject) =>
      this.admin.auth().verifyIdToken(token)
        .then((user) => resolve(user))
        .catch((err) => reject(err)));
  }

  private setupFirebase() {
    this.app = firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    });
  }

  private setupFirebaseAdminSDK() {
    this.admin = adminSdk.initializeApp({
      credential: adminSdk.credential.cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----\n`,
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
}
