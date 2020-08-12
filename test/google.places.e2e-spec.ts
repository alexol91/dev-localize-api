import { INestApplication } from '@nestjs/common';

import { GooglePlacesModule } from '../src/google/places/google.places.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { UsersService } from '../src/db/services/users.service';

import { generateGooglePlaceAutocompleteDTO } from '../src/google/places/dto/GooglePlaceAutocomplete.generate';
import { generateGooglePlaceDetailsDTO } from '../src/google/places/dto/GooglePlaceDetails.generate';
import { generateGooglePlaceReverseGeocodingDTO } from '../src/google/places/dto/GooglePlaceReverseGeocode.generate';

import { postRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('Google Places', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let user1: any;
  let usersService: UsersService;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([GooglePlacesModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
  });

  describe('/POST details', () => {
    let path: string;
    const placeId = 'ChIJJ9HYxLkEdkgRanoiyhmFJDk';

    beforeAll(async () => {
      path = '/places/details';
    });

    it('returns search results', async (done) => {
      return postRequest(app, path, user1.token, generateGooglePlaceDetailsDTO(placeId))
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.payload).toBeDefined();
          done();
        });
    });

    it('fails w/o header', async () => {
      return postRequest(app, path, undefined, generateGooglePlaceDetailsDTO(placeId))
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', async () => {
      return postRequest(app, path, invalidToken, generateGooglePlaceDetailsDTO(placeId))
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails w/o body', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  // describe('/POST geocode', () => {
  //   let path: string;

  //   beforeAll(async () => {
  //     path = '/places/geocode';
  //   });

  //   it('returns search results', async (done) => {
  //     return postRequest(app, path, user1.token, generateGooglePlaceReverseGeocodingDTO())
  //       .expect('Content-Type', /json/)
  //       .expect(200)
  //       .then((res) => {
  //         expect(res.body.payload).toBeDefined();
  //         done();
  //       });
  //   });

  //   it('fails w/o header', async () => {
  //     return postRequest(app, path, undefined, generateGooglePlaceReverseGeocodingDTO())
  //       .expect('Content-Type', /json/)
  //       .expect(400);
  //   });

  //   it('fails with invalid token', async () => {
  //     return postRequest(app, path, invalidToken, generateGooglePlaceReverseGeocodingDTO())
  //       .expect('Content-Type', /json/)
  //       .expect(401);
  //   });

  //   it('fails w/o body', async () => {
  //     return postRequest(app, path, user1.token)
  //       .expect('Content-Type', /json/)
  //       .expect(400);
  //   });
  // });

  describe('/POST search', () => {
    let path: string;

    beforeAll(async () => {
      path = '/places/search';
    });

    it('returns search results', async (done) => {
      return postRequest(app, path, user1.token, generateGooglePlaceAutocompleteDTO())
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.payload).toBeDefined();
          done();
        });
    });

    it('fails w/o header', async () => {
      return postRequest(app, path, undefined, generateGooglePlaceAutocompleteDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', async () => {
      return postRequest(app, path, invalidToken, generateGooglePlaceAutocompleteDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails w/o body', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
