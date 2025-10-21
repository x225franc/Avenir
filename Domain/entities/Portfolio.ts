import { UserId } from "../value-objects/UserId";
import { StockId } from "../value-objects/StockId";
import { Money } from "../value-objects/Money";

/**
 * Représente une position dans le portefeuille (actions détenues pour une action donnée)
 */
export interface StockPosition {
	stockId: StockId;
	stockSymbol: string;
	companyName: string;
	quantity: number;
	averagePurchasePrice: Money;
	currentPrice: Money;
	totalValue: Money;
	gainLoss: Money;
	gainLossPercentage: number;
}

export interface PortfolioProps {
	userId: UserId;
	positions: Map<string, StockPosition>;
	totalValue: Money;
	totalGainLoss: Money;
	lastUpdated: Date;
}

/**
 * Entité Portfolio (Portefeuille d'investissement)
 *
 * Représente le portefeuille d'actions d'un utilisateur
 * Calcule automatiquement les gains/pertes et la valeur totale
 */
export class Portfolio {
	constructor(private props: PortfolioProps) {}

	// Getters
	get userId(): UserId {
		return this.props.userId;
	}

	get positions(): StockPosition[] {
		return Array.from(this.props.positions.values());
	}

	get totalValue(): Money {
		return this.props.totalValue;
	}

	get totalGainLoss(): Money {
		return this.props.totalGainLoss;
	}

	get lastUpdated(): Date {
		return this.props.lastUpdated;
	}

	// Business Methods

	/**
	 * Ajoute des actions au portefeuille (achat)
	 */
	public addPosition(
		stockId: StockId,
		stockSymbol: string,
		companyName: string,
		quantity: number,
		purchasePrice: Money
	): void {
		const stockKey = stockId.value;
		const existingPosition = this.props.positions.get(stockKey);

		if (existingPosition) {
			// Mise à jour de la position existante (moyenne pondérée)
			const totalQuantity = existingPosition.quantity + quantity;
			const totalCost = existingPosition.averagePurchasePrice
				.multiply(existingPosition.quantity)
				.add(purchasePrice.multiply(quantity));

			const newAveragePrice = totalCost.divide(totalQuantity);

			existingPosition.quantity = totalQuantity;
			existingPosition.averagePurchasePrice = newAveragePrice;
		} else {
			// Nouvelle position
			const newPosition: StockPosition = {
				stockId,
				stockSymbol,
				companyName,
				quantity,
				averagePurchasePrice: purchasePrice,
				currentPrice: purchasePrice, // Sera mis à jour plus tard
				totalValue: purchasePrice.multiply(quantity),
				gainLoss: Money.zero(),
				gainLossPercentage: 0,
			};

			this.props.positions.set(stockKey, newPosition);
		}

		this.recalculatePortfolioValue();
	}

	/**
	 * Retire des actions du portefeuille (vente)
	 */
	public removePosition(stockId: StockId, quantity: number): void {
		const stockKey = stockId.value;
		const position = this.props.positions.get(stockKey);

		if (!position) {
			throw new Error("Stock position not found in portfolio");
		}

		if (position.quantity < quantity) {
			throw new Error("Not enough shares in portfolio");
		}

		if (position.quantity === quantity) {
			// Supprimer complètement la position
			this.props.positions.delete(stockKey);
		} else {
			// Réduire la quantité
			position.quantity -= quantity;
		}

		this.recalculatePortfolioValue();
	}

	/**
	 * Met à jour le prix actuel d'une action et recalcule les gains/pertes
	 */
	public updateStockPrice(stockId: StockId, newPrice: Money): void {
		const stockKey = stockId.value;
		const position = this.props.positions.get(stockKey);

		if (position) {
			position.currentPrice = newPrice;
			this.recalculatePortfolioValue();
		}
	}

	/**
	 * Vérifie si l'utilisateur possède suffisamment d'actions pour vendre
	 */
	public hasEnoughShares(stockId: StockId, quantity: number): boolean {
		const position = this.props.positions.get(stockId.value);
		return position ? position.quantity >= quantity : false;
	}

	/**
	 * Obtient la quantité possédée d'une action donnée
	 */
	public getStockQuantity(stockId: StockId): number {
		const position = this.props.positions.get(stockId.value);
		return position ? position.quantity : 0;
	}

	/**
	 * Vérifie si le portefeuille est vide
	 */
	public isEmpty(): boolean {
		return this.props.positions.size === 0;
	}

	/**
	 * Recalcule la valeur totale du portefeuille et les gains/pertes
	 */
	private recalculatePortfolioValue(): void {
		let totalValue = Money.zero();
		let totalGainLossAmount = 0; // Accumulateur en nombre pour gérer les négatifs

		for (const position of this.props.positions.values()) {
			// Valeur actuelle de la position
			const currentValue = position.currentPrice.multiply(position.quantity);
			position.totalValue = currentValue;

			// Coût d'acquisition de la position
			const acquisitionCost = position.averagePurchasePrice.multiply(
				position.quantity
			);

			// Gain/perte de la position (peut être négatif)
			const gainLossAmount = currentValue.amount - acquisitionCost.amount;
			
			// Créer un Money avec la valeur absolue et forcer le montant réel (positif ou négatif)
			position.gainLoss = new Money(Math.abs(gainLossAmount), currentValue.currency);
			(position.gainLoss as any)._amount = gainLossAmount;

			// Pourcentage de gain/perte
			position.gainLossPercentage =
				acquisitionCost.amount > 0
					? (gainLossAmount / acquisitionCost.amount) * 100
					: 0;

			// Accumulation pour le portefeuille total
			totalValue = totalValue.add(currentValue);
			totalGainLossAmount += gainLossAmount; // Accumulation simple des nombres
		}

		// Créer l'objet Money pour le total des gains/pertes
		const totalGainLoss = new Money(Math.abs(totalGainLossAmount), totalValue.currency);
		(totalGainLoss as any)._amount = totalGainLossAmount; // Forcer le montant réel (peut être négatif)

		this.props.totalValue = totalValue;
		this.props.totalGainLoss = totalGainLoss;
		this.props.lastUpdated = new Date();
	}

	public toJSON(): any {
		return {
			userId: this.props.userId.value,
			positions: this.positions.map((p) => ({
				stockSymbol: p.stockSymbol,
				companyName: p.companyName,
				quantity: p.quantity,
				averagePurchasePrice: p.averagePurchasePrice.toJSON(),
				currentPrice: p.currentPrice.toJSON(),
				totalValue: p.totalValue.toJSON(),
				gainLoss: p.gainLoss.toJSON(),
				gainLossPercentage: p.gainLossPercentage,
			})),
			totalValue: this.props.totalValue.toJSON(),
			totalGainLoss: this.props.totalGainLoss.toJSON(),
			lastUpdated: this.props.lastUpdated.toISOString(),
		};
	}

	/**
	 * Méthode factory pour créer un nouveau portefeuille vide
	 */
	public static createEmpty(userId: UserId): Portfolio {
		return new Portfolio({
			userId,
			positions: new Map(),
			totalValue: Money.zero(),
			totalGainLoss: Money.zero(),
			lastUpdated: new Date(),
		});
	}
}
