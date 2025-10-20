import { InvestmentOrderId } from "../value-objects/InvestmentOrderId";
import { UserId } from "../value-objects/UserId";
import { AccountId } from "../value-objects/AccountId";
import { StockId } from "../value-objects/StockId";
import { Money } from "../value-objects/Money";

export enum OrderType {
	BUY = "buy",
	SELL = "sell",
}

export enum OrderStatus {
	PENDING = "pending",
	EXECUTED = "executed",
	CANCELLED = "cancelled",
}

export interface InvestmentOrderProps {
	id: InvestmentOrderId;
	userId: UserId;
	accountId: AccountId;
	stockId: StockId;
	orderType: OrderType;
	quantity: number;
	pricePerShare: Money;
	totalAmount: Money;
	fees: Money;
	status: OrderStatus;
	executedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Entité InvestmentOrder (Ordre d'investissement)
 *
 * Représente un ordre d'achat ou de vente d'actions
 * Gère le cycle de vie : pending → executed/cancelled
 * Inclut automatiquement les frais de 1€ par transaction
 */
export class InvestmentOrder {
	constructor(private props: InvestmentOrderProps) {
		this.validate();
	}

	private validate(): void {
		if (this.props.quantity <= 0) {
			throw new Error("Order quantity must be positive");
		}

		if (!this.props.pricePerShare.isPositive()) {
			throw new Error("Price per share must be positive");
		}

		if (!this.props.totalAmount.isPositive()) {
			throw new Error("Total amount must be positive");
		}

		if (!this.props.fees.isPositive()) {
			throw new Error("Fees must be positive");
		}

		// Vérifier que le total correspond au calcul
		const expectedTotal = this.props.pricePerShare.multiply(
			this.props.quantity
		);
		const calculatedWithFees =
			this.props.orderType === OrderType.BUY
				? expectedTotal.add(this.props.fees)
				: expectedTotal.subtract(this.props.fees);

		if (!this.props.totalAmount.equals(calculatedWithFees)) {
			throw new Error(
				"Total amount does not match calculated amount with fees"
			);
		}
	}

	// Getters
	get id(): InvestmentOrderId {
		return this.props.id;
	}

	get userId(): UserId {
		return this.props.userId;
	}

	get accountId(): AccountId {
		return this.props.accountId;
	}

	get stockId(): StockId {
		return this.props.stockId;
	}

	get orderType(): OrderType {
		return this.props.orderType;
	}

	get quantity(): number {
		return this.props.quantity;
	}

	get pricePerShare(): Money {
		return this.props.pricePerShare;
	}

	get totalAmount(): Money {
		return this.props.totalAmount;
	}

	get fees(): Money {
		return this.props.fees;
	}

	get status(): OrderStatus {
		return this.props.status;
	}

	get executedAt(): Date | undefined {
		return this.props.executedAt;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Business Methods

	/**
	 * Vérifie si l'ordre peut être exécuté
	 */
	public canBeExecuted(): boolean {
		return this.props.status === OrderStatus.PENDING;
	}

	/**
	 * Vérifie si l'ordre peut être annulé
	 */
	public canBeCancelled(): boolean {
		return this.props.status === OrderStatus.PENDING;
	}

	/**
	 * Exécute l'ordre d'investissement
	 */
	public execute(): void {
		if (!this.canBeExecuted()) {
			throw new Error("Order cannot be executed");
		}

		this.props.status = OrderStatus.EXECUTED;
		this.props.executedAt = new Date();
		this.props.updatedAt = new Date();
	}

	/**
	 * Annule l'ordre d'investissement
	 */
	public cancel(): void {
		if (!this.canBeCancelled()) {
			throw new Error("Order cannot be cancelled");
		}

		this.props.status = OrderStatus.CANCELLED;
		this.props.updatedAt = new Date();
	}

	/**
	 * Calcule le montant à débiter/créditer du compte
	 * - Achat: montant des actions + frais
	 * - Vente: montant des actions - frais
	 */
	public getAccountImpact(): Money {
		return this.props.totalAmount;
	}

	/**
	 * Vérifie si c'est un ordre d'achat
	 */
	public isBuyOrder(): boolean {
		return this.props.orderType === OrderType.BUY;
	}

	/**
	 * Vérifie si c'est un ordre de vente
	 */
	public isSellOrder(): boolean {
		return this.props.orderType === OrderType.SELL;
	}

	/**
	 * Vérifie si l'ordre est exécuté
	 */
	public isExecuted(): boolean {
		return this.props.status === OrderStatus.EXECUTED;
	}

	/**
	 * Vérifie si l'ordre est annulé
	 */
	public isCancelled(): boolean {
		return this.props.status === OrderStatus.CANCELLED;
	}

	/**
	 * Vérifie si l'ordre est en attente
	 */
	public isPending(): boolean {
		return this.props.status === OrderStatus.PENDING;
	}

	public toJSON(): any {
		return {
			id: this.props.id.value,
			userId: this.props.userId.value,
			accountId: this.props.accountId.value,
			stockId: this.props.stockId.value,
			orderType: this.props.orderType,
			quantity: this.props.quantity,
			pricePerShare: this.props.pricePerShare.toJSON(),
			totalAmount: this.props.totalAmount.toJSON(),
			fees: this.props.fees.toJSON(),
			status: this.props.status,
			executedAt: this.props.executedAt?.toISOString(),
			createdAt: this.props.createdAt.toISOString(),
			updatedAt: this.props.updatedAt.toISOString(),
		};
	}

	/**
	 * Méthode factory pour créer un nouvel ordre d'achat
	 */
	public static createBuyOrder(data: {
		userId: UserId;
		accountId: AccountId;
		stockId: StockId;
		quantity: number;
		pricePerShare: Money;
		transactionFee: number;
	}): InvestmentOrder {
		const fees = new Money(data.transactionFee, data.pricePerShare.currency);
		const stockCost = data.pricePerShare.multiply(data.quantity);
		const totalAmount = stockCost.add(fees);

		return new InvestmentOrder({
			id: InvestmentOrderId.generate(),
			userId: data.userId,
			accountId: data.accountId,
			stockId: data.stockId,
			orderType: OrderType.BUY,
			quantity: data.quantity,
			pricePerShare: data.pricePerShare,
			totalAmount: totalAmount,
			fees: fees,
			status: OrderStatus.PENDING,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	/**
	 * Méthode factory pour créer un nouvel ordre de vente
	 */
	public static createSellOrder(data: {
		userId: UserId;
		accountId: AccountId;
		stockId: StockId;
		quantity: number;
		pricePerShare: Money;
		transactionFee: number;
	}): InvestmentOrder {
		const fees = new Money(data.transactionFee, data.pricePerShare.currency);
		const stockValue = data.pricePerShare.multiply(data.quantity);

		if (stockValue.isLessThanOrEqual(fees)) {
			throw new Error("Sale amount would be negative after fees");
		}

		const totalAmount = stockValue.subtract(fees);

		return new InvestmentOrder({
			id: InvestmentOrderId.generate(),
			userId: data.userId,
			accountId: data.accountId,
			stockId: data.stockId,
			orderType: OrderType.SELL,
			quantity: data.quantity,
			pricePerShare: data.pricePerShare,
			totalAmount: totalAmount,
			fees: fees,
			status: OrderStatus.PENDING,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}
}
