import { Injectable, Logger } from '@nestjs/common';
import { BillsCalculator } from './bills.calculator';
import { CalculateBillDto } from './dto/calculate-bill.dto';
import { CalculationResult } from 'src/interfaces/calculation.interface';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(private readonly billsCalculator: BillsCalculator){}


  calculate(calDto:CalculateBillDto): CalculationResult{
    this.logger.log('calculating bill');
    return this.billsCalculator.calculate(calDto);
  }
}
