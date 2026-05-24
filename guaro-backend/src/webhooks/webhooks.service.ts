import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import { WebhookEvent, WebhookDeliveryStatus } from '@prisma/client';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  findAll(sectionId?: string) {
    return this.prisma.sectionWebhook.findMany({
      where: sectionId ? { sectionId } : {},
      include: { section: { include: { module: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const webhook = await this.prisma.sectionWebhook.findUnique({
      where: { id },
      include: {
        section: { include: { module: true } },
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  create(dto: CreateWebhookDto) {
    return this.prisma.sectionWebhook.create({
      data: {
        name: dto.name,
        url: dto.url,
        sectionId: dto.sectionId,
        moduleId: dto.moduleId,
        events: dto.events ?? [],
        retryPolicy: dto.retryPolicy ?? '3_retries',
      },
    });
  }

  async update(id: string, dto: UpdateWebhookDto) {
    await this.findOne(id);
    return this.prisma.sectionWebhook.update({
      where: { id },
      data: dto as any,
    });
  }

  async sendTest(id: string) {
    const webhook = await this.findOne(id);

    const payload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      webhook: webhook.name,
      message: 'This is a test delivery from Guaro',
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: id,
          taskId: 'test',
          event: WebhookEvent.TASK_COMPLETED,
          payload: payload as any,
          status: response.ok
            ? WebhookDeliveryStatus.SUCCESS
            : WebhookDeliveryStatus.FAILED,
          httpStatus: response.status,
          attempts: 1,
          lastAttemptAt: new Date(),
        },
      });

      return { ok: response.ok, status: response.status };
    } catch {
      return { ok: false, status: 0, error: 'Connection failed' };
    }
  }

  async deliverEvent(
    taskId: string,
    sectionId: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ) {
    const webhooks = await this.prisma.sectionWebhook.findMany({
      where: {
        isActive: true,
        events: { has: event },
        OR: [{ sectionId }, { sectionId: null }],
      },
    });

    for (const webhook of webhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        await this.prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            taskId,
            event,
            payload: payload as any,
            status: response.ok
              ? WebhookDeliveryStatus.SUCCESS
              : WebhookDeliveryStatus.FAILED,
            httpStatus: response.status,
            attempts: 1,
            lastAttemptAt: new Date(),
          },
        });
      } catch {
        await this.prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            taskId,
            event,
            payload: payload as any,
            status: WebhookDeliveryStatus.FAILED,
            attempts: 1,
            lastAttemptAt: new Date(),
          },
        });
      }
    }
  }
}
