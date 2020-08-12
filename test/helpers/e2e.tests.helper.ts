import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as request from 'supertest';

import { FirebaseService } from '../../src/common/services/firebase.service';
import { UsersService } from '../../src/db/services/users.service';

export function setupModule(modules: any[] = []): Promise<TestingModule> {
  dotenv.config();

  return new Promise(async (resolve, reject) => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: process.env.MONGODB_URI }),
        }),
        ...modules,
      ],
    }).compile();

    resolve(testModule);
  });
}

export function setupTestUser(app: INestApplication, firebaseService: FirebaseService, usersService: UsersService, uid: string) {
  return new Promise(async (resolve, reject) => {
    const customToken = await firebaseService.createCustomToken(uid);
    await firebaseService.signInWithCustomToken(customToken);
    const token = await firebaseService.getIdToken();
    const user = await firebaseService.verifyToken(token);
    await getRequest(app, `/users/${user.uid}`, token);
    const id = (await usersService.getUserByFirebaseUid(user.uid)).id;
    resolve({id, uid: user.uid, token});
  });
}

export function deleteRequest(app: INestApplication, path: string, token?: string): request.Test {
  return request(app.getHttpServer())
    .delete(path)
    .set('Accept', 'application/json')
    .set('Accept-Language',  'en')
    .set('Authorization',  token ? `Bearer ${token}` : '');
}

export function getRequest(app: INestApplication, path: string, token?: string): request.Test {
  return request(app.getHttpServer())
    .get(path)
    .set('Accept', 'application/json')
    .set('Accept-Language',  'en')
    .set('Authorization', token ? `Bearer ${token}` : '');
}

export function postRequest(app: INestApplication, path: string, token?: string, body?: any): request.Test {
  return request(app.getHttpServer())
    .post(path)
    .send(body || {})
    .set('Accept', 'application/json')
    .set('Accept-Language',  'en')
    .set('Authorization', token ? `Bearer ${token}` : '');
}

export function putRequest(app: INestApplication, path: string, token?: string, body?: any): request.Test {
  return request(app.getHttpServer())
    .put(path)
    .send(body || {})
    .set('Accept', 'application/json')
    .set('Accept-Language',  'en')
    .set('Authorization', token ? `Bearer ${token}` : '');
}
