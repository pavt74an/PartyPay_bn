import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { BillsModule } from './bills/bills.module';

@Module({
  imports: [UsersModule, ConfigModule.forRoot(), BillsModule,],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_PIPE,
    useClass: ValidationPipe,
  },],
})
export class AppModule {}
