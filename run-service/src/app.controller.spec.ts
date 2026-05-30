import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    runsByCategory: jest.fn(),
    runsByUser: jest.fn(),
    getRun: jest.fn(),
    createRun: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    adminRunsByStatus: jest.fn(),
    acceptRun: jest.fn(),
    rejectRun: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  it('delegates run detail requests to the service', () => {
    void appController.getRun('run-1');
    expect(appService.getRun).toHaveBeenCalledWith('run-1');
  });
});
