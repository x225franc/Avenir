import { TransactionId } from "../value-objects/TransactionId";
import { AccountId } from "../value-objects/AccountId";
import { Money } from "../value-objects/Money";
import { TransactionType } from "../enums/TransactionType";
import { TransactionStatus } from "../enums/TransactionStatus";

export interface TransactionProps {
  id: TransactionId;
  fromAccountId: AccountId | null;
  toAccountId: AccountId | null;
  amount: Money;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private constructor(private props: TransactionProps) {
    this.validate();
  }

  public static create(
    fromAccountId: AccountId | null,
    toAccountId: AccountId | null,
    amount: Money,
    type: TransactionType,
    description: string | null = null
  ): Transaction {
    return new Transaction({
      id: TransactionId.generate(),
      fromAccountId,
      toAccountId,
      amount,
      type,
      status: TransactionStatus.PENDING,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  private validate(): void {
    // For TRANSFER, both accounts must be present and different
    if (this.props.type === TransactionType.TRANSFER) {
      if (!this.props.fromAccountId || !this.props.toAccountId) {
        throw new Error(
          "Transfer requires both fromAccountId and toAccountId"
        );
      }
      if (
        this.props.fromAccountId.equals(this.props.toAccountId)
      ) {
        throw new Error("Cannot transfer to the same account");
      }
    }

    // For DEPOSIT, only toAccountId should be present
    if (this.props.type === TransactionType.DEPOSIT) {
      if (!this.props.toAccountId) {
        throw new Error("Deposit requires toAccountId");
      }
    }

    // For WITHDRAWAL, only fromAccountId should be present
    if (this.props.type === TransactionType.WITHDRAWAL) {
      if (!this.props.fromAccountId) {
        throw new Error("Withdrawal requires fromAccountId");
      }
    }

    // Amount must be positive
    if (this.props.amount.amount <= 0) {
      throw new Error("Transaction amount must be positive");
    }

    // Description length validation
    if (this.props.description && this.props.description.length > 500) {
      throw new Error("Description cannot exceed 500 characters");
    }
  }

  public complete(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error("Only pending transactions can be completed");
    }
    this.props.status = TransactionStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public fail(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error("Only pending transactions can be failed");
    }
    this.props.status = TransactionStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error("Only pending transactions can be cancelled");
    }
    this.props.status = TransactionStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  public approve(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error("Only pending transactions can be approved");
    }
    this.props.status = TransactionStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error("Only pending transactions can be rejected");
    }
    this.props.status = TransactionStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  // Getters
  public getId(): TransactionId {
    return this.props.id;
  }

  public getFromAccountId(): AccountId | null {
    return this.props.fromAccountId;
  }

  public getToAccountId(): AccountId | null {
    return this.props.toAccountId;
  }

  public getAmount(): Money {
    return this.props.amount;
  }

  public getType(): TransactionType {
    return this.props.type;
  }

  public getStatus(): TransactionStatus {
    return this.props.status;
  }

  public getDescription(): string | null {
    return this.props.description;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public isCompleted(): boolean {
    return this.props.status === TransactionStatus.COMPLETED;
  }

  public isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  public isFailed(): boolean {
    return this.props.status === TransactionStatus.FAILED;
  }
}
