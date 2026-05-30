import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    register: jest.fn(),
    login: jest.fn(),
    profile: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  it('delegates register requests to the service', () => {
    const dto = {
      username: 'runner',
      email: 'runner@mail.com',
      country: 'Indonesia',
      password: 'Password1!',
    };

    void appController.register(dto);
    expect(appService.register).toHaveBeenCalledWith(dto);
  });
});
