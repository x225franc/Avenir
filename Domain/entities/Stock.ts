import { StockId } from "../value-objects/StockId";
import { Money } from "../value-objects/Money";

export interface StockProps {
	id: StockId;
	symbol: string;
	companyName: string;
	currentPrice: Money;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Entité Stock (Action financière)
 *
 * Représente une action d'une entreprise cotée en bourse
 * Seul le directeur de banque peut gérer la disponibilité des actions
 * Le prix est mis à jour selon l'équilibre offre/demande
 */
export class Stock {
	constructor(private props: StockProps) {
		this.validate();
	}

	private validate(): void {
		if (!this.props.symbol || this.props.symbol.trim().length === 0) {
			throw new Error("Stock symbol is required");
		}

		if (this.props.symbol.length > 10) {
			throw new Error("Stock symbol cannot exceed 10 characters");
		}

		if (!this.props.companyName || this.props.companyName.trim().length === 0) {
			throw new Error("Company name is required");
		}

		if (this.props.companyName.length > 255) {
			throw new Error("Company name cannot exceed 255 characters");
		}

		if (!this.props.currentPrice.isPositive()) {
			throw new Error("Stock price must be positive");
		}
	}

	// Getters
	get id(): StockId {
		return this.props.id;
	}

	get symbol(): string {
		return this.props.symbol;
	}

	get companyName(): string {
		return this.props.companyName;
	}

	get currentPrice(): Money {
		return this.props.currentPrice;
	}

	get isAvailable(): boolean {
		return this.props.isAvailable;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Business Methods

	/**
	 * Met à jour le prix actuel de l'action
	 * Basé sur l'équilibre offre/demande du carnet d'ordres
	 */
	public updatePrice(newPrice: Money): void {
		if (!newPrice.isPositive()) {
			throw new Error("Stock price must be positive");
		}

		this.props.currentPrice = newPrice;
		this.props.updatedAt = new Date();
	}

	/**
	 * Active/désactive la disponibilité de l'action
	 * Seul le directeur peut modifier cette propriété
	 */
	public setAvailability(available: boolean): void {
		this.props.isAvailable = available;
		this.props.updatedAt = new Date();
	}

	/**
	 * Vérifie si l'action est disponible à la négociation
	 */
	public canBeTraded(): boolean {
		return this.props.isAvailable;
	}

	/**
	 * Calcule le coût total pour un nombre d'actions donné
	 * Inclut les frais de transaction
	 */
	public calculateTotalCost(quantity: number, transactionFee: number): Money {
		if (quantity <= 0) {
			throw new Error("Quantity must be positive");
		}

		const stockCost = this.props.currentPrice.multiply(quantity);
		const fees = new Money(transactionFee, this.props.currentPrice.currency);

		return stockCost.add(fees);
	}

	/**
	 * Calcule le montant reçu lors d'une vente
	 * Déduit les frais de transaction
	 */
	public calculateSaleAmount(quantity: number, transactionFee: number): Money {
		if (quantity <= 0) {
			throw new Error("Quantity must be positive");
		}

		const stockValue = this.props.currentPrice.multiply(quantity);
		const fees = new Money(transactionFee, this.props.currentPrice.currency);

		if (stockValue.isLessThanOrEqual(fees)) {
			throw new Error("Sale amount would be negative after fees");
		}

		return stockValue.subtract(fees);
	}

	public toJSON(): any {
		return {
			id: this.props.id.value,
			symbol: this.props.symbol,
			companyName: this.props.companyName,
			currentPrice: this.props.currentPrice.toJSON(),
			isAvailable: this.props.isAvailable,
			createdAt: this.props.createdAt.toISOString(),
			updatedAt: this.props.updatedAt.toISOString(),
		};
	}

	/**
	 * Méthode factory pour créer une nouvelle action
	 */
	public static create(data: {
		symbol: string;
		companyName: string;
		currentPrice: Money;
		isAvailable?: boolean;
	}): Stock {
		return new Stock({
			id: StockId.generate(),
			symbol: data.symbol.toUpperCase().trim(),
			companyName: data.companyName.trim(),
			currentPrice: data.currentPrice,
			isAvailable: data.isAvailable ?? true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}
}
