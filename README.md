## Localization API

### Description

Nest.js API for Localization project.

### Getting Started

#### Setting up environment variables

To set up app locally you first need to add your secret variables. In the root folder you can find `.env.example` file, that contains an example of secret variables API is using. To enable those variables replace them with real credentials and rename file to `.env`. 
How to get those environment variables:
- for Firebase Authentication and Database - can be found in your Firebase project under `Settings\General\Your Apps` (visit [Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup#config-object) to learn more)
- for Firebase Admin SDK - can be found in your Firebase project under `Setting\Service Accounts\Firebase Admin SDK`  (visit [Add the Firebase Admin SDK to Your Server](https://firebase.google.com/docs/admin/setup#initialize_the_sdk) to learn more)
- for Google Maps API key - visit [Get an API Key](https://developers.google.com/maps/documentation/javascript/get-api-key) to learn more
- for MONGODB_URI - visit [mLab MongoDB](https://devcenter.heroku.com/articles/mongolab#getting-your-connection-uri) to learn more

There're also two optional variables for e2e testing locally and CT/CI - `FIREBASE_TEST_USER_ID` and `FIREBASE_TEST_USER2_ID`. They should have valid Firebase User UID, if you want to run e2e tests. You can find a list of users in your Firebase project under `Authentication` tab.

#### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Once the app is started, you can find it at `localhost:3000` and Swagger docs at `localhost:3000/api-docs`.

#### Testing

```bash
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# all tests
$ npm run test
```