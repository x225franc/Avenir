import { IStockRepository } from "@domain/repositories/IStockRepository";
import { StockId } from "@domain/value-objects/StockId";

export interface UpdateStockDTO {
	id: string;
	symbol?: string;
	companyName?: string;
	isAvailable?: boolean;
	// Note: currentPrice n'est PAS modifiable par l'admin
	// Le prix est calculé automatiquement par l'équilibre offre/demande
}
export class UpdateStock {
	constructor(private readonly stockRepository: IStockRepository) {}

	async execute(dto: UpdateStockDTO): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			// Récupérer l'action
			const stockId = new StockId(dto.id);
			const stock = await this.stockRepository.findById(stockId);

			if (!stock) {
				throw new Error("Action non trouvée");
			}

			// Vérifier si le nouveau symbole existe déjà (si changé)
			if (dto.symbol && dto.symbol.toUpperCase() !== stock.symbol) {
				const existingStock = await this.stockRepository.findBySymbol(
					dto.symbol.toUpperCase().trim()
				);

				if (existingStock) {
					throw new Error(
						`Une action avec le symbole ${dto.symbol.toUpperCase()} existe déjà`
					);
				}
			}

			// Mettre à jour les propriétés modifiables
			if (dto.symbol !== undefined) {
				(stock as any).props.symbol = dto.symbol.toUpperCase().trim();
			}

			if (dto.companyName !== undefined) {
				(stock as any).props.companyName = dto.companyName.trim();
			}

			if (dto.isAvailable !== undefined) {
				stock.setAvailability(dto.isAvailable);
			}

			// Sauvegarder
			await this.stockRepository.save(stock);

			return {
				success: true,
				message: `Action ${stock.symbol} mise à jour avec succès`,
			};
		} catch (error: any) {
			return {
				success: false,
				message:
					error.message || "Erreur lors de la mise à jour de l'action",
			};
		}
	}
}
