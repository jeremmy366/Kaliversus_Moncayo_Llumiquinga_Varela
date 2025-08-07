import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { EmailQueueService } from '../email-queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Mocks
const notificationRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
const userRepo = { findOne: jest.fn() };
const emailQueueService = { sendEmailNotification: jest.fn() };
const eventEmitter = { emit: jest.fn() };

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: EmailQueueService, useValue: emailQueueService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.create('msg', 'uid')).rejects.toThrow('Usuario no encontrado');
  });

  it('should return notifications for user', async () => {
    const fakeNotifs = [{ id: '1' }, { id: '2' }];
    notificationRepo.find = jest.fn().mockResolvedValue(fakeNotifs);
    const result = await service.findByUser('user123');
    expect(notificationRepo.find).toHaveBeenCalledWith({
      where: { usuario: { id: 'user123' } },
      order: { fechaCreacion: 'DESC' },
    });
    expect(result).toBe(fakeNotifs);
  });

  it('should mark notification as read', async () => {
    const notif = { id: 'n1', usuario: { id: 'u1' }, leida: false };
    notificationRepo.findOne = jest.fn().mockResolvedValue(notif);
    notificationRepo.save = jest.fn().mockResolvedValue({ ...notif, leida: true });
    const result = await service.markAsRead('n1', 'u1');
    expect(notificationRepo.findOne).toHaveBeenCalledWith({ where: { id: 'n1' }, relations: ['usuario'] });
    expect(result.leida).toBe(true);
  });

  it('should throw if notification not found or not owned', async () => {
    notificationRepo.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.markAsRead('n1', 'u1')).rejects.toThrow('Notificación no encontrada');
    notificationRepo.findOne = jest.fn().mockResolvedValue({ id: 'n1', usuario: { id: 'other' } });
    await expect(service.markAsRead('n1', 'u1')).rejects.toThrow('Notificación no encontrada');
  });
});
