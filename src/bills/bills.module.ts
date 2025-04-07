import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { BillsCalculator } from './bills.calculator';

@Module({
  controllers: [BillsController],
  providers: [BillsService, BillsCalculator],
  exports:[BillsService]
})
export class BillsModule {}
