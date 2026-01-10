import { IStockRepository } from "@domain/repositories/IStockRepository";
import { IInvestmentOrderRepository } from "@domain/repositories/IInvestmentOrderRepository";
import { StockId } from "@domain/value-objects/StockId";

export class DeleteStock {
	constructor(
		private readonly stockRepository: IStockRepository,
		private readonly investmentOrderRepository: IInvestmentOrderRepository
	) {}

	async execute(stockId: string): Promise<{
		success: boolean;
		message: string;
		holdingsCount?: number;
	}> {
		try {
			const id = new StockId(stockId);
			const stock = await this.stockRepository.findById(id);

			if (!stock) {
				throw new Error("Action non trouvée");
			}

			// Vérifier si des utilisateurs détiennent cette action
			const holdingsCount =
				await this.investmentOrderRepository.countNetHoldingsByStockId(id);

			if (holdingsCount > 0) {
				return {
					success: false,
					message: `⚠️ Impossible de supprimer cette action : ${holdingsCount} action(s) sont actuellement détenues par des clients. Pour retirer cette action du marché, désactivez-la plutôt (bouton "Désactiver").`,
					holdingsCount,
				};
			}

			// Supprimer l'action (seulement si personne ne la détient)
			await this.stockRepository.delete(id);

			return {
				success: true,
				message: `✅ Action ${stock.symbol} supprimée avec succès`,
			};
		} catch (error: any) {
			// Si l'erreur est due à une contrainte de clé étrangère (ON DELETE RESTRICT)
			if (
				error.code === "ER_ROW_IS_REFERENCED_2" ||
				error.code === "ER_ROW_IS_REFERENCED"
			) {
				return {
					success: false,
					message:
						"⚠️ Impossible de supprimer cette action : des clients possèdent des ordres d'investissement liés à cette action. Pour la retirer du marché, désactivez-la plutôt (bouton 'Désactiver'). Les clients conserveront leurs actions dans leur portefeuille.",
				};
			}

			return {
				success: false,
				message: error.message || "Erreur lors de la suppression de l'action",
			};
		}
	}
}
