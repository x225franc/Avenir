export interface TransferFormData {
	sourceAccountId: string;
	destinationAccountId: string;
	amount: number;
	currency: string;
	description?: string;
}

export interface TransferResponse {
	success: boolean;
	message: string;
	data?: {
		transactionId: string;
		fromAccountId: string;
		toAccountId: string;
		amount: number;
		currency: string;
		type: string;
		status: string;
		description: string | null;
		createdAt: Date;
	};
}

export interface Transaction {
	id: string;
	fromAccountId: string | null;
	toAccountId: string | null;
	amount: number;
	currency: string;
	type: "transfer" | "deposit" | "withdrawal" | "interest";
	status: "pending" | "completed" | "failed" | "cancelled";
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
}