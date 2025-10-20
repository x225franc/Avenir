export class TransactionId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Transaction ID cannot be empty");
    }
  }

  public static create(value: string): TransactionId {
    return new TransactionId(value);
  }

  public static generate(): TransactionId {
    return new TransactionId(crypto.randomUUID());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TransactionId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
