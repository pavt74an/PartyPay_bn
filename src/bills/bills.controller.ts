import { Controller, Post, Body, Logger } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CalculateBillDto } from './dto/calculate-bill.dto';

@Controller('bills')
export class BillsController {
  private readonly logger = new Logger(BillsController.name);

  constructor(private readonly billsService: BillsService) {}

  @Post('calculate')
  calculate(@Body() calculateBillDto: CalculateBillDto) {
    this.logger.log('recieved calculate bill request');
    return this.billsService.calculate(calculateBillDto);
  }
}
