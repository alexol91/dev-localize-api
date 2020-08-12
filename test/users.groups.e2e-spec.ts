import { INestApplication } from '@nestjs/common';
import { validate } from 'class-validator';
import { ObjectId } from 'mongodb';

import { GroupsModule } from '../src/groups/groups.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { GroupsService } from '../src/db/services/groups.service';
import { generateIAddGroup } from '../src/db/services/groups.service.mock';
import { UsersService } from '../src/db/services/users.service';

import { IGroup } from '../src/db/interfaces/group.interface';
import { Group } from '../src/db/models/group.model';

import { generateAddGroupDTO } from '../src/groups/dto/AddGroup.generate';
import { generateJoinGroupDTO } from '../src/groups/dto/JoinGroup.generate';

import { getRequest, postRequest, putRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';
import { generateString } from './helpers/generate.helper';

const invalidBody = { invalid: true };
const invalidToken = 'THISISNOTATOKEN';

describe('Groups', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let groupsService: GroupsService;
  let user1: any;
  let user2: any;
  let usersService: UsersService;
  let userId: ObjectId;
  let userId2: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([GroupsModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    groupsService = module.get<GroupsService>(GroupsService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    user2 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER2_ID);

    userId = new ObjectId(user1.id);
    userId2 = new ObjectId(user2.id);
  });

  describe('/GET user/groups', () => {
    let group;
    let path: string;

    beforeAll(async () => {
      path = '/user/groups';
      group = await groupsService.addGroup(userId, generateIAddGroup());
    });

    it('returns groups', (done) => {
      return getRequest(app, path, user1.token)
        .expect(200)
        .then(async (res) => {
          const groups = res.body.payload;
          expect(groups).toBeDefined();
          expect(groups.length).not.toBe(0);
          // expect(await validateGroup(groups[0]));
          done();
        });
    });

    it('fails w/o token', () => {
      return getRequest(app, path)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return getRequest(app, path, invalidToken)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/POST user/groups/add', () => {
    let group;
    let path: string;

    beforeAll(async () => {
      path = '/user/groups/add';
    });

    it('returns added group', async (done) => {
      return postRequest(app, path, user1.token, generateAddGroupDTO())
        .expect(201)
        .then(async (res) => {
          group = res.body.payload;
          expect(group).toBeDefined();
          // expect(await validateGroup(group));
          done();
        });
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateAddGroupDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateAddGroupDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return postRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/PUT user/groups/:id/edit', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      path = `/user/groups/${group.id}/edit`;
      await groupsService.joinGroup(userId2, group.code.value);
    });

    it('Admin returns edited group', async (done) => {
      const name = generateString(10);
      return putRequest(app, path, user1.token, { name })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const resgroup = res.body.payload;
          expect(resgroup).toBeDefined();
          // expect(await validateGroup(resgroup));
          expect(resgroup.name).toEqual(name);
          done();
        });
    });

    it('fails for member', async () => {
      return putRequest(app, path, user2.token, { name: generateString(10) })
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('Admin removes users from group', async (done) => {
      return putRequest(app, path, user1.token, { userIds: [user1.uid, user2.uid] })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const resgroup = res.body.payload;
          expect(resgroup).toBeDefined();
          // expect(await validateGroup(resgroup));
          expect(resgroup.users.length).toBe(1);
          done();
        });
    });

    it('fails for a guest', async () => {
      return putRequest(app, path, user2.token, { name: generateString(10) })
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('fails w/o token', () => {
      return putRequest(app, path, undefined, { name: generateString(10) })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return putRequest(app, path, invalidToken, { name: generateString(10) })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return putRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/POST user/groups/join', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      path = '/user/groups/join';
    });

    test('joins group', async (done) => {
      return postRequest(app, path, user2.token, {joinCode: group.code.value})
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const resgroup = res.body.payload;
          expect(resgroup).toBeDefined();
          // expect(await validateGroup(resgroup));
          done();
        });
    });

    test('fails to join second time', async () => {
      return postRequest(app, path, user2.token, {joinCode: group.code.value})
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateJoinGroupDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateJoinGroupDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return postRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId2, new ObjectId(group.id));
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/POST user/groups/preview', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      path = '/user/groups/preview';
    });

    test('previews group', async (done) => {
      return postRequest(app, path, user2.token, {joinCode: group.code.value})
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const resgroup = res.body.payload;
          expect(resgroup).toBeDefined();
          // expect(await validateGroup(resgroup));
          done();
        });
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateJoinGroupDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateJoinGroupDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return postRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/POST user/groups/:id/leave', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      await groupsService.joinGroup(userId2, group.code.value);
      path = `/user/groups/${group.id}/leave`;
    });

    test('Admin leaves group', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(201);
    });

    test('fails to leave second time', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('last person leaves group and deletes it', async () => {
      return postRequest(app, path, user2.token)
        .expect('Content-Type', /json/)
        .expect(201);
    });

    it('fails w/o token', () => {
      return postRequest(app, path)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    // await usersService.deleteUser(userId2);
    // await usersService.deleteUser(userId);
    await app.close();
  });
});
