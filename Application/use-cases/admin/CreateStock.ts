import { IStockRepository } from "@domain/repositories/IStockRepository";
import { Stock } from "@domain/entities/Stock";
import { Money } from "@domain/value-objects/Money";

export interface CreateStockDTO {
	symbol: string;
	companyName: string;
	currentPrice: number;
	isAvailable?: boolean;
}

export class CreateStock {
	constructor(private readonly stockRepository: IStockRepository) {}

	async execute(dto: CreateStockDTO): Promise<{
		success: boolean;
		message: string;
		stockId?: string;
	}> {
		try {
			// Validation
			if (!dto.symbol || dto.symbol.trim().length === 0) {
				throw new Error("Le symbole de l'action est requis");
			}

			if (!dto.companyName || dto.companyName.trim().length === 0) {
				throw new Error("Le nom de l'entreprise est requis");
			}

			if (dto.currentPrice <= 0) {
				throw new Error("Le prix doit être positif");
			}

			// Vérifier si le symbole existe déjà
			const existingStock = await this.stockRepository.findBySymbol(
				dto.symbol.toUpperCase().trim()
			);

			if (existingStock) {
				throw new Error(
					`Une action avec le symbole ${dto.symbol.toUpperCase()} existe déjà`
				);
			}

			// Créer l'action
			const stock = Stock.create({
				symbol: dto.symbol,
				companyName: dto.companyName,
				currentPrice: new Money(dto.currentPrice),
				isAvailable: dto.isAvailable ?? true,
			});

			// Sauvegarder
			await this.stockRepository.save(stock);

			return {
				success: true,
				message: `Action ${stock.symbol} créée avec succès`,
				stockId: stock.id.value,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Erreur lors de la création de l'action",
			};
		}
	}
}
