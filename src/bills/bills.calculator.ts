import { Injectable, Logger } from '@nestjs/common';
import { CalculateBillDto } from './dto/calculate-bill.dto';
import {
  CalculationResult,
  Transaction,
} from 'src/interfaces/calculation.interface';
import { BADFLAGS } from 'dns';

@Injectable()
export class BillsCalculator {
  private readonly logger = new Logger(BillsCalculator.name);

  // Calculate bill
  // @param data - Data for calculation
  // @returns Result of calculation
  calculate(data: CalculateBillDto): CalculationResult {
    this.logger.log(
      `Calculating bill with ${data.expenses.length} expense for ${data.people.length} people`,
    );

    const { expenses, people, sharedItems, paidByPerson } = data;

    // paymentMatrix is matrix used to store how much each person owes to others [ลูกหนี้][เจ้าหนี้]
    const debtMatrix: number[][] = this.initializeDebtMatrix(people.length);

    // cal debt per expense
    this.calculateDebtsForEachExpense(
      expenses,
      sharedItems,
      paidByPerson,
      debtMatrix,
    );

    this.settleDebtsBetweenPeople(debtMatrix, people.length);

    const transactions = this.createTransactions(debtMatrix, people.length);
    const balances = this.calculateBalances(debtMatrix, people.length);
    const totalAmount = this.calculateTotalAmount(expenses);
    const averagePerPerson = this.calculateAveragePerPerson(
      expenses,
      people,
      sharedItems,
    );

    this.logger.log(
      `Calculation completed. Total: ${totalAmount}, Transactions: ${transactions.length}`,
    );
    return {
      totalAmount,
      transactions,
      balance: balances.map((balance) => balance.toFixed(2)),
      averagePerPerson,
    };
  }

  // matrix for inialize debt between people
  private initializeDebtMatrix(peopleCount: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < peopleCount; i++) {
      matrix[i] = new Array(peopleCount).fill(0);
    }
    return matrix;
  }

  // cal debt per expense
  private calculateDebtsForEachExpense(
    expenses: any[],
    sharedItems: boolean[][],
    paidByPerson: number[],
    debtMatrix: number[][],
  ): void {
    expenses.forEach((expense, expenseIndex) => {
      const amount = expense.amount;
      const payerId = paidByPerson[expenseIndex];

      // member shared
      const participants: number[] = [];
      sharedItems[expenseIndex].forEach((isShared, personIndex) => {
        if (isShared) {
          participants.push(personIndex);
        }
      });
      const shareAmount = amount / participants.length;

      participants.forEach((debtorId) => {
        if (debtorId !== payerId) {
          debtMatrix[debtorId][payerId] += shareAmount;
        }
      });
    });
  }

  // หักลบหนี้ระหว่างคู่คนที่เป็นหนี้กันทั้งสองฝ่าย
  private settleDebtsBetweenPeople(
    debtMatrix: number[][],
    peopleCount: number,
  ): void {
    for (let i = 0; i < peopleCount; i++) {
      for (let j = i + 1; j < peopleCount; j++) {
        if (debtMatrix[i][j] > 0 && debtMatrix[j][i] > 0) {
          if (debtMatrix[i][j] > debtMatrix[j][i]) {
            debtMatrix[i][j] -= debtMatrix[j][i];
            debtMatrix[j][i] = 0;
          } else {
            debtMatrix[j][i] -= debtMatrix[i][j];
            debtMatrix[i][j] = 0;
          }
        }
      }
    }
  }

  //  สร้างรายการโอนเงินจาก debt matrix
  private createTransactions(
    debtMatrix: number[][],
    peopleCount: number,
  ): Transaction[] {
    const transactions: Transaction[] = [];
    for (let debtorId = 0; debtorId < peopleCount; debtorId++) {
      for (let creditorId = 0; creditorId < peopleCount; creditorId++) {
        const debt = debtMatrix[debtorId][creditorId];
        if (debt > 0.01) {
          transactions.push({
            from: debtorId,
            to: creditorId,
            amount: debt.toFixed(2),
          });
        }
      }
    }
    return transactions;
  }

  // cal  balance per each person

  private calculateBalances(
    debtMatrix: number[][],
    peopleCount: number,
  ): number[] {
    const balances: number[] = new Array(peopleCount).fill(0);

    // debt to pay(-)
    for (let debtorId = 0; debtorId < peopleCount; debtorId++) {
      for (let creditorId = 0; creditorId < peopleCount; creditorId++) {
        balances[debtorId] -= debtMatrix[debtorId][creditorId];
      }
    }

    // debt to receive(+)
    for (let creditorId = 0; creditorId < peopleCount; creditorId++) {
      for (let debtorId = 0; debtorId < peopleCount; debtorId++) {
        balances[creditorId] += debtMatrix[debtorId][creditorId];
      }
    }
    return balances;
  }

  // cal total amount of expenses
  private calculateTotalAmount(expenses: any[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // cal average per person
  private calculateAveragePerPerson(
    expenses: any[],
    people: string[],
    sharedItems: boolean[][],
  ): Record<number, string> {
    const averages: Record<number, string> = {};

    people.forEach((_, personId) => {
      let totalForPerson = 0;
      expenses.forEach((expense, expenseId) => {
        if (sharedItems[expenseId][personId]) {
          const participantCount = sharedItems[expenseId].filter(
            (status) => status,
          ).length;
          totalForPerson += expense.amount / participantCount;
        }
      });
      averages[personId] = totalForPerson.toFixed(2);
    });
    return averages;
  }
}
