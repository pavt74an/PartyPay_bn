import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// dto for req expense
class ExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;
}

// deo for cal bill
export class CalculateBillDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDto)
  @ArrayMinSize(1)
  expenses: ExpenseDto[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  people: string[];

  @IsArray()
  sharedItems: boolean[][];

  @IsArray()
  @IsNumber({}, { each: true })
  paidByPerson: number[];

  @IsString()
  @IsOptional()
  eventName: string;

  @IsString()
  @IsOptional()
  eventDate: string;
}
