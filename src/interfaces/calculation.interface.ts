
// from John paid to Mary amount $120 like this
export interface Transaction {
  from: number;

  to: number;

  amount: number | string;
}

// calculation
export interface CalculationResult {
  totalAmount: number;

  // list of paid by person
  transactions: Transaction[];

  // + is recieved, - is paid
  balance:string[];

  averagePerPerson: Record<number, string>;
}
