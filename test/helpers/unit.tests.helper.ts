import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';

export function setupModule(services: any[] = [], controllers: any[] = []): Promise<TestingModule> {
  dotenv.config();

  return new Promise(async (resolve, reject) => {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [ ...controllers ],
      providers: [ ...services ],
    }).compile();

    resolve(testModule);
  });
}
