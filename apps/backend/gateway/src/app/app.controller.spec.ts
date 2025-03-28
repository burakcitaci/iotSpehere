import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', async () => {
      const appController = app.get<AppController>(AppController);
      const data = await appController.getData();
      expect(data).toEqual({ message: 'Hello API' });
    });
  });
});
