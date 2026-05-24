import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ApplicationsModule } from './applications/applications.module';
import { BrandsModule } from './brands/brands.module';
import { ModulesModule } from './modules/modules.module';
import { SectionsModule } from './sections/sections.module';
import { TaskTypesModule } from './task-types/task-types.module';
import { TasksModule } from './tasks/tasks.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MerchantsModule,
    ApplicationsModule,
    BrandsModule,
    ModulesModule,
    SectionsModule,
    TaskTypesModule,
    TasksModule,
    WebhooksModule,
    StoresModule,
  ],
})
export class AppModule {}
