"use client";

import '@flaticon/flaticon-uicons/css/all/all.css';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toUpperCase, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	accountService,
	Account,
} from "../../../../components/lib/api/account.service";
import { transferService } from "../../../../components/lib/api/transfer.service";
import { operationService } from "../../../../components/lib/api/operation.service";
import { Transaction } from "../../../../components/lib/api/transfer.types";
import { NotificationModal } from "../../../../components/ui/NotificationModal";

// Schéma de validation pour la modification
const updateAccountSchema = z.object({
	accountName: z
		.string()
		.min(3, "Le nom doit contenir au moins 3 caractères")
		.max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

type UpdateAccountForm = z.infer<typeof updateAccountSchema>;

export default function AccountDetailPage() {
	const router = useRouter();
	const params = useParams();
	const accountId = params.id as string;

	const [account, setAccount] = useState<Account | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingTransactions, setLoadingTransactions] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [transactionsOffset, setTransactionsOffset] = useState(0);
	const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showDepositModal, setShowDepositModal] = useState(false);
	const [showWithdrawModal, setShowWithdrawModal] = useState(false);
	const [operationAmount, setOperationAmount] = useState<string>("");
	const [operationDescription, setOperationDescription] = useState<string>("");
	const [operationLoading, setOperationLoading] = useState(false);

	// States pour les notifications
	const [showNotification, setShowNotification] = useState(false);
	const [notificationType, setNotificationType] = useState<
		"success" | "error" | "info"
	>("success");
	const [notificationTitle, setNotificationTitle] = useState("");
	const [notificationMessage, setNotificationMessage] = useState("");

	// Fonction utilitaire pour afficher une notification
	const showNotificationModal = (
		type: "success" | "error" | "info",
		title: string,
		message: string
	) => {
		setNotificationType(type);
		setNotificationTitle(title);
		setNotificationMessage(message);
		setShowNotification(true);
	};

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isDirty },
	} = useForm<UpdateAccountForm>({
		resolver: zodResolver(updateAccountSchema),
	});

	useEffect(() => {
		loadAccount();
		loadTransactions();
	}, [accountId]);

	const loadAccount = async () => {
		try {
			setLoading(true);
			const response = await accountService.getById(accountId);

			if (response.success && response.data) {
				setAccount(response.data);
				setValue("accountName", response.data.name);
			} else {
				showNotificationModal(
					"error",
					"Compte introuvable",
					response.error || "Impossible de charger les informations du compte."
				);
			}
		} catch (err: any) {
			console.error("Erreur chargement compte:", err);
			showNotificationModal(
				"error",
				"Erreur de chargement",
				"Impossible de charger les informations du compte."
			);
		} finally {
			setLoading(false);
		}
	};

	const loadTransactions = async (reset = true) => {
		try {
			setLoadingTransactions(true);
			const data = await transferService.getByAccountId(accountId);

			if (reset) {
				const firstPage = data.slice(0, 10);
				setTransactions(firstPage);
				setTransactionsOffset(10);
				setHasMoreTransactions(data.length > 10);
			}
		} catch (err: any) {
			console.error("Erreur chargement transactions:", err);
		} finally {
			setLoadingTransactions(false);
		}
	};

	const loadMoreTransactions = async () => {
		try {
			setLoadingMore(true);
			const data = await transferService.getByAccountId(accountId);

			// Prendre les 10 transactions suivantes
			const nextPage = data.slice(transactionsOffset, transactionsOffset + 10);

			if (nextPage.length > 0) {
				setTransactions((prev) => [...prev, ...nextPage]);
				setTransactionsOffset((prev) => prev + 10);
				setHasMoreTransactions(data.length > transactionsOffset + 10);
			} else {
				setHasMoreTransactions(false);
			}
		} catch (err: any) {
			console.error("Erreur chargement plus de transactions:", err);
		} finally {
			setLoadingMore(false);
		}
	};

	const onSubmit = async (data: UpdateAccountForm) => {
		try {
			setUpdating(true);

			const response = await accountService.update(accountId, {
				accountName: data.accountName,
			});

			if (response.success) {
				showNotificationModal(
					"success",
					"Modification réussie",
					"Le nom du compte a été modifié avec succès."
				);
				loadAccount();
			} else {
				showNotificationModal(
					"error",
					"Erreur de modification",
					response.error || "Erreur lors de la modification du compte."
				);
			}
		} catch (err: any) {
			console.error("Erreur modification compte:", err);
			showNotificationModal(
				"error",
				"Erreur inattendue",
				err.response?.data?.error || "Impossible de modifier le compte."
			);
		} finally {
			setUpdating(false);
		}
	};

	const handleDelete = async () => {
		try {
			setDeleting(true);

			const response = await accountService.delete(accountId);

			if (response.success) {
				showNotificationModal(
					"success",
					"Compte supprimé",
					"Le compte a été supprimé avec succès. Vous allez être redirigé."
				);
				// Redirection après 2 secondes pour laisser le temps de voir la notification
				setTimeout(() => {
					router.push("/dashboard/accounts");
				}, 2000);
			} else {
				showNotificationModal(
					"error",
					"Erreur de suppression",
					response.error || "Erreur lors de la suppression du compte."
				);
				setShowDeleteModal(false);
			}
		} catch (err: any) {
			// Ici on ne gère que les vraies erreurs (réseau, 500, etc.)
			console.error("Erreur suppression compte:", err);
			showNotificationModal(
				"error",
				"Erreur inattendue",
				"Une erreur inattendue s'est produite lors de la suppression."
			);
			setShowDeleteModal(false);
		} finally {
			setDeleting(false);
		}
	};

	const handleDeposit = async () => {
		try {
			setOperationLoading(true);

			const amount = parseFloat(operationAmount);
			if (isNaN(amount) || amount <= 0) {
				showNotificationModal(
					"error",
					"Montant invalide",
					"Veuillez saisir un montant valide supérieur à 0."
				);
				return;
			}

			const response = await operationService.deposit({
				accountId,
				amount,
				description: operationDescription || "Dépôt",
			});

			if (response.success) {
				showNotificationModal(
					"success",
					"Dépôt effectué",
					`Dépôt de ${formatBalance(
						amount
					)} effectué avec succès sur votre compte.`
				);
				setShowDepositModal(false);
				setOperationAmount("");
				setOperationDescription("");
				loadAccount();
				loadTransactions(true);
			} else {
				showNotificationModal(
					"error",
					"Erreur de dépôt",
					response.message || "Erreur lors du dépôt."
				);
			}
		} catch (err: any) {
			console.error("Erreur dépôt:", err);
			showNotificationModal(
				"error",
				"Erreur de dépôt",
				err.response?.data?.error ||
					err.response?.data?.message ||
					err.message ||
					"Impossible d'effectuer le dépôt."
			);
		} finally {
			setOperationLoading(false);
		}
	};

	const handleWithdraw = async () => {
		try {
			setOperationLoading(true);

			const amount = parseFloat(operationAmount);
			if (isNaN(amount) || amount <= 0) {
				showNotificationModal(
					"error",
					"Montant invalide",
					"Veuillez saisir un montant valide supérieur à 0."
				);
				return;
			}

			const response = await operationService.withdraw({
				accountId,
				amount,
				description: operationDescription || "Retrait",
			});

			if (response.success) {
				showNotificationModal(
					"success",
					"Retrait effectué",
					`Retrait de ${formatBalance(
						amount
					)} effectué avec succès depuis votre compte.`
				);
				setShowWithdrawModal(false);
				setOperationAmount("");
				setOperationDescription("");
				loadAccount();
				loadTransactions(true);
			} else {
				showNotificationModal(
					"error",
					"Erreur de retrait",
					response.message || "Erreur lors du retrait."
				);
			}
		} catch (err: any) {
			console.error("Erreur retrait:", err);
			showNotificationModal(
				"error",
				"Erreur de retrait",
				err.response?.data?.error || "Impossible d'effectuer le retrait."
			);
		} finally {
			setOperationLoading(false);
		}
	};

	const getAccountTypeLabel = (type: string) => {
		switch (type) {
			case "checking":
				return "Compte Courant";
			case "savings":
				return "Compte Épargne";
			case "investment":
				return "Compte Titres";
			default:
				return type;
		}
	};

	const getAccountTypeColor = (type: string) => {
		switch (type) {
			case "checking":
				return "bg-blue-100 text-blue-800";
			case "savings":
				return "bg-green-100 text-green-800";
			case "investment":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatBalance = (amount: number) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	const normalizeType = (type: string) => type?.toLowerCase();
	const getArrowIcon = (isCredit: boolean, status: string) => {
		const color =
			status === "completed"
				? isCredit
					? "text-green-600"
					: "text-red-600"
				: "text-red-600";
		const rotation = isCredit ? "rotate-180" : "";
		return (
			<i className={`fi fi-rr-arrow-down text-xl ${color} ${rotation}`}></i>
		);
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Chargement...</p>
				</div>
			</div>
		);
	}

	if (!account) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						Compte introuvable
					</h2>
					<Link
						href='/dashboard/accounts'
						className='text-blue-600 hover:text-blue-700 font-medium'
					>
						Retour à mes comptes
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='mb-8'>
					<Link
						href='/dashboard/accounts'
						className='text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 mb-4'
					>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M10 19l-7-7m0 0l7-7m-7 7h18'
							/>
						</svg>
						<span>Retour à mes comptes</span>
					</Link>
					<div className='flex items-center justify-between'>
						<h1 className='text-3xl font-bold text-gray-900'>
							Détails du compte
						</h1>
						<span
							className={`px-4 py-2 rounded-full text-sm font-semibold ${getAccountTypeColor(
								account.type
							)}`}
						>
							{getAccountTypeLabel(account.type)}
						</span>
					</div>
				</div>

				<div className='grid gap-6 lg:grid-cols-3'>
					{/* Account Info Card */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Main Info */}
						<div className='bg-white rounded-xl shadow-md p-6'>
							<h2 className='text-xl font-bold text-gray-900 mb-4'>
								Informations du compte
							</h2>
							<div className='space-y-4'>
								<div>
									<label className='text-sm font-medium text-gray-600'>
										IBAN
									</label>
									<div className='mt-1 flex items-center space-x-2'>
										<p className='text-lg font-mono text-gray-900'>
											{account.iban}
										</p>
										<button
											onClick={() =>
												navigator.clipboard.writeText(account.iban)
											}
											className='p-2 text-gray-500 hover:text-blue-600 transition'
											title="Copier l'IBAN"
										>
											<svg
												className='w-5 h-5'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
												/>
											</svg>
										</button>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div>
										<label className='text-sm font-medium text-gray-600'>
											Solde actuel
										</label>
										<p className='mt-1 text-2xl font-bold text-gray-900'>
											{formatBalance(account.balance)}
										</p>
									</div>
									<div>
										<label className='text-sm font-medium text-gray-600'>
											Statut
										</label>
										<div className='mt-1 flex items-center space-x-2'>
											<span
												className={`w-3 h-3 rounded-full ${
													account.isActive ? "bg-green-500" : "bg-red-500"
												}`}
											></span>
											<span className='text-gray-900'>
												{account.isActive ? "Actif" : "Inactif"}
											</span>
										</div>
									</div>
								</div>

								{/* Operation Buttons */}
								{account.isActive && (
									<div className='grid grid-cols-2 gap-4 pt-2'>
										<button
											onClick={() => setShowDepositModal(true)}
											className='flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition'
										>
											<svg
												className='w-5 h-5'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M12 6v12m-6-6h12'
												/>
											</svg>
											<span>Dépôt</span>
										</button>
										<button
											onClick={() => setShowWithdrawModal(true)}
											disabled={account.balance <= 0}
											className={`flex items-center justify-center space-x-2 px-4 py-3 font-medium rounded-lg transition ${
												account.balance <= 0
													? "bg-gray-400 text-gray-200 cursor-not-allowed"
													: "bg-orange-600 text-white hover:bg-orange-700"
											}`}
										>
											<svg
												className='w-5 h-5'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M20 12H4'
												/>
											</svg>
											<span>Retrait</span>
										</button>
									</div>
								)}

								{account.type === "savings" && account.interestRate && (
									<div>
										<label className='text-sm font-medium text-gray-600'>
											Taux d'intérêt annuel
										</label>
										<p className='mt-1 text-lg font-semibold text-green-600'>
											{(account.interestRate * 100).toFixed(2)}%
										</p>
									</div>
								)}

								<div>
									<label className='text-sm font-medium text-gray-600'>
										Date de création
									</label>
									<p className='mt-1 text-gray-900'>
										{new Date(account.createdAt).toLocaleDateString("fr-FR", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</p>
								</div>
							</div>
						</div>

						{/* Transaction History */}
						<div className='bg-white rounded-xl shadow-md p-6'>
							<h2 className='text-xl font-bold text-gray-900 mb-4'>
								Historique des transactions
							</h2>

							{loadingTransactions ? (
								<div className='text-center py-8'>
									<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
								</div>
							) : transactions.length === 0 ? (
								<div className='text-center py-8 text-gray-500'>
									<svg
										className='w-16 h-16 mx-auto mb-4 text-gray-300'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
										/>
									</svg>
									<p>Aucune transaction pour ce compte</p>
								</div>
							) : (
								<div className='space-y-3'>
									{transactions.map((transaction) => {
										const isIncoming =
											String(transaction.toAccountId) === String(accountId);
										const isOutgoing =
											String(transaction.fromAccountId) === String(accountId);
										const txType = normalizeType(transaction.type);

										// Déterminer si c'est un CRÉDIT (entrée d'argent) ou DÉBIT (sortie d'argent)
										const isCredit =
											txType === "deposit" || // Dépôt = entrée
											txType === "interest" || // Intérêts = entrée
											(txType === "transfer" && isIncoming) || // Virement reçu = entrée
											(txType === "transfer_iban" && isIncoming) || // Virement IBAN reçu = entrée
											txType === "investment_sell"; // Vente action = entrée

										const isDebit =
											txType === "withdrawal" || // Retrait = sortie
											(txType === "transfer" && isOutgoing) || // Virement envoyé = sortie
											(txType === "transfer_iban" && isOutgoing) || // Virement IBAN envoyé = sortie
											txType === "investment_buy"; // Achat action = sortie

										// FLÈCHE : Vers le bas (↓) = entrée, Vers le haut (↑) = sortie
										// Couleur en fonction du statut
										const statusColors = {
											completed: { bg: "bg-green-100", text: "text-green-600" },
											pending: { bg: "bg-yellow-100", text: "text-yellow-600" },
											failed: { bg: "bg-red-100", text: "text-red-600" },
											cancelled: { bg: "bg-gray-100", text: "text-gray-600" },
										};
										const colors =
											statusColors[
												transaction.status as keyof typeof statusColors
											] || statusColors.completed;

										const arrowColor = colors.text;
										const bubbleColor = colors.bg;
										// Flèche vers le BAS (↓) pour CRÉDIT = pas de rotation
										// Flèche vers le HAUT (↑) pour DÉBIT = rotation 180°
										const arrowRotation = isCredit ? "" : "rotate-180";
										return (
											<div
												key={transaction.id}
												className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'
											>
												<div className='flex items-center space-x-4'>
													{/* Cercle avec couleur selon le statut */}
													<div
														className={`w-10 h-10 rounded-full flex items-center justify-center ${bubbleColor}`}
													>
														<svg
															className={`w-5 h-5 ${arrowColor} ${arrowRotation}`}
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M12 4v16m0 0l-4-4m4 4l4-4'
															/>
														</svg>
													</div>
													<div>
														<p className='font-medium text-gray-900'>
															{(() => {
																const txType = normalizeType(transaction.type);

																// Fonction pour censurer un IBAN
																const censorIban = (iban: string) => {
																	if (iban.length >= 8) {
																		return (
																			iban.substring(0, 4) +
																			"*".repeat(iban.length - 7) +
																			iban.substring(iban.length - 3)
																		);
																	}
																	return iban.substring(0, 4) + "****";
																};

																// Virement reçu de IBAN externe (deposit avec IBAN dans description)
																if (
																	txType === "deposit" &&
																	transaction.description
																) {
																	const ibanMatch =
																		transaction.description.match(
																			/(?:de|depuis)\s+(FR[A-Z0-9]+)/i
																		);
																	if (ibanMatch) {
																		return `Virement reçu de ${censorIban(
																			ibanMatch[1]
																		)}`;
																	}
																}

																// Virement envoyé vers IBAN externe (withdrawal avec IBAN dans description)
																if (
																	txType === "withdrawal" &&
																	transaction.description
																) {
																	const ibanMatch =
																		transaction.description.match(
																			/(?:vers|à)\s+(FR[A-Z0-9]+)/i
																		);
																	if (ibanMatch) {
																		return `Virement vers ${censorIban(
																			ibanMatch[1]
																		)}`;
																	}
																}

																// Virement IBAN (nouveau type spécifique)
																if (txType === "transfer_iban" && transaction.description) {
																	// Format: "De [IBAN_SOURCE] vers [IBAN_DEST]"
																	const fullMatch = transaction.description.match(
																		/De\s+(FR[A-Z0-9]+)\s+vers\s+(FR[A-Z0-9]+)/i
																	);
																	
																	if (fullMatch) {
																		const sourceIban = fullMatch[1];
																		const destIban = fullMatch[2];
																		
																		if (isIncoming) {
																			return `Virement reçu de ${censorIban(sourceIban)}`;
																		} else if (isOutgoing) {
																			return `Virement vers ${censorIban(destIban)}`;
																		}
																	}
																	
																	// Virement externe (seulement destination)
																	const extMatch = transaction.description.match(
																		/Virement vers\s+(FR[A-Z0-9]+)/i
																	);
																	if (extMatch) {
																		return `Virement vers ${censorIban(extMatch[1])}`;
																	}
																}

																// Transfert interne classique (compte à compte sans IBAN)
																if (txType === "transfer" && transaction.description) {
																	// Fallback: ancienne logique pour compatibilité
																	const ibanMatchFrom = transaction.description.match(
																		/(?:de|depuis|reçu de)\s+(FR[A-Z0-9]+)/i
																	);
																	if (ibanMatchFrom && isIncoming) {
																		return `Virement reçu de ${censorIban(ibanMatchFrom[1])}`;
																	}

																	const ibanMatchTo = transaction.description.match(
																		/(?:vers|à)\s+(FR[A-Z0-9]+)/i
																	);
																	if (ibanMatchTo && isOutgoing) {
																		return `Virement vers ${censorIban(ibanMatchTo[1])}`;
																	}
																}

																// Autres types
																switch (txType) {
																	case "transfer":
																		return isIncoming
																			? "Virement reçu"
																			: "Virement envoyé";
																	case "transfer_iban":
																		return isIncoming
																			? "Virement IBAN reçu"
																			: "Virement IBAN envoyé";
																	case "deposit":
																		return "Dépôt";
																	case "withdrawal":
																		return "Retrait";
																	case "interest":
																		return "Intérêts créditeurs";
																	case "investment_buy":
																		return "Achat d'actions";
																	case "investment_sell":
																		return "Vente d'actions";
																	default:
																		return transaction.type;
																}
															})()}
														</p>
														{transaction.description && txType !== "transfer_iban" && (() => {
															// Pour les virements IBAN, on ne montre pas la description (automatique)
															
															// Afficher la description si elle ne contient pas d'IBAN
															if (!transaction.description.match(
																/(?:de|depuis|vers|à|reçu de)\s+FR[A-Z0-9]+|De\s+FR[A-Z0-9]+\s+vers\s+FR[A-Z0-9]+/i
															)) {
																return (
																	<p className='text-sm text-gray-500'>
																		{transaction.description}
																	</p>
																);
															}
															return null;
														})()}
														<p className='text-xs text-gray-400 mt-1'>
															{new Date(
																transaction.createdAt
															).toLocaleDateString("fr-FR", {
																year: "numeric",
																month: "short",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															})}
														</p>
													</div>
												</div>
												<div className='text-right'>
													<p
														className={`text-lg font-bold ${
															isCredit ? "text-green-600" : "text-red-600"
														} ${
															transaction.status === "failed"
																? "line-through"
																: ""
														}`}
													>
														{isCredit ? "+" : "-"}
														{transaction.amount.toFixed(2)}€
													</p>
													{/* Statut depuis la BDD : pending, completed, failed, cancelled */}
													<span
														className={`inline-block px-2 py-1 text-xs rounded-full ${
															transaction.status === "completed"
																? "bg-green-100 text-green-800"
																: transaction.status === "pending"
																? "bg-yellow-100 text-yellow-800"
																: transaction.status === "failed"
																? "bg-red-100 text-red-800"
																: transaction.status === "cancelled"
																? "bg-gray-100 text-gray-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														{transaction.status === "completed"
															? "Complété"
															: transaction.status === "pending"
															? "En cours"
															: transaction.status === "failed"
															? "Échoué"
															: transaction.status === "cancelled"
															? "Annulé"
															: transaction.status}
													</span>
												</div>
											</div>
										);
									})}

									{/* Bouton Charger plus */}
									{hasMoreTransactions && (
										<div className='text-center pt-4'>
											<button
												onClick={loadMoreTransactions}
												disabled={loadingMore}
												className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'
											>
												{loadingMore ? (
													<>
														<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
														Chargement...
													</>
												) : (
													<>
														<svg
															className='w-5 h-5 mr-2'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M12 6v6m0 0v6m0-6h6m-6 0H6'
															/>
														</svg>
														Charger plus de transactions
													</>
												)}
											</button>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Edit Form */}
						<div className='bg-white rounded-xl shadow-md p-6'>
							<h2 className='text-xl font-bold text-gray-900 mb-4'>
								Modifier le compte
							</h2>
							<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
								<div>
									<label
										htmlFor='accountName'
										className='block text-sm font-medium text-gray-700 mb-2'
									>
										Nom du compte
									</label>
									<input
										type='text'
										id='accountName'
										{...register("accountName")}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									{errors.accountName && (
										<p className='mt-2 text-sm text-red-600'>
											{errors.accountName.message}
										</p>
									)}
								</div>

								<button
									type='submit'
									disabled={!isDirty || updating}
									className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{updating
										? "Modification en cours..."
										: "Enregistrer les modifications"}
								</button>
							</form>
						</div>
					</div>

					{/* Actions Card */}
					<div className='lg:col-span-1'>
						<div className='bg-white rounded-xl shadow-md p-6'>
							<h2 className='text-xl font-bold text-gray-900 mb-4'>
								Actions rapides
							</h2>
							<div className='space-y-3'>
								<Link
									href={`/dashboard/transfers?from=${accountId}`}
									className='w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
										/>
									</svg>
									<span>Effectuer un virement</span>
								</Link>

								<button
									onClick={() => setShowDeleteModal(true)}
									className='w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
										/>
									</svg>
									<span>Supprimer le compte</span>
								</button>
							</div>

							<div className='mt-6 pt-6 border-t border-gray-200'>
								<h3 className='font-semibold text-gray-900 mb-2'>
									Informations
								</h3>
								<ul className='text-sm text-gray-600 space-y-2'>
									<li>• Le solde doit être à 0€ pour supprimer</li>
									<li>• La suppression est définitive</li>
									<li>• L'IBAN ne peut pas être modifié</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
						<div className='flex items-center space-x-3 mb-4'>
							<div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
								<svg
									className='w-6 h-6 text-red-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
							</div>
							<div>
								<h3 className='text-lg font-bold text-gray-900'>
									Confirmer la suppression
								</h3>
							</div>
						</div>
						<p className='text-gray-600 mb-6'>
							Êtes-vous sûr de vouloir supprimer le compte{" "}
							<strong>{account.name}</strong> ? Cette action est irréversible.
						</p>
						<div className='flex space-x-3'>
							<button
								onClick={() => setShowDeleteModal(false)}
								disabled={deleting}
								className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold'
							>
								Annuler
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className='flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50'
							>
								{deleting ? "Suppression..." : "Supprimer"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Deposit Modal */}
			{showDepositModal && (
				<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-xl font-bold text-gray-900'>
								Effectuer un dépôt
							</h3>
							<button
								onClick={() => {
									setShowDepositModal(false);
									setOperationAmount("");
									setOperationDescription("");
								}}
								className='text-gray-400 hover:text-gray-600'
							>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Montant (€)
								</label>
								<input
									type='number'
									step='0.01'
									min='0'
									max='10000'
									value={operationAmount}
									onChange={(e) => setOperationAmount(e.target.value)}
									placeholder='100.00'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Description (optionnel)
								</label>
								<textarea
									value={operationDescription}
									onChange={(e) => setOperationDescription(e.target.value)}
									placeholder='Raison du dépôt...'
									rows={3}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none'
								/>
							</div>
						</div>

						<div className='mt-6 flex space-x-3'>
							<button
								onClick={() => {
									setShowDepositModal(false);
									setOperationAmount("");
									setOperationDescription("");
								}}
								disabled={operationLoading}
								className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold'
							>
								Annuler
							</button>
							<button
								onClick={handleDeposit}
								disabled={operationLoading}
								className='flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50'
							>
								{operationLoading ? "Traitement..." : "Déposer"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Withdraw Modal */}
			{showWithdrawModal && (
				<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-xl font-bold text-gray-900'>
								Effectuer un retrait
							</h3>
							<button
								onClick={() => {
									setShowWithdrawModal(false);
									setOperationAmount("");
									setOperationDescription("");
								}}
								className='text-gray-400 hover:text-gray-600'
							>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Montant disponible
								</label>
								<p className='text-2xl font-bold text-gray-900 mb-3'>
									{formatBalance(account.balance)}
								</p>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Montant à retirer (€)
								</label>
								<input
									type='number'
									step='0.01'
									min='0'
									max={account.balance}
									value={operationAmount}
									onChange={(e) => setOperationAmount(e.target.value)}
									placeholder='50.00'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Description (optionnel)
								</label>
								<textarea
									value={operationDescription}
									onChange={(e) => setOperationDescription(e.target.value)}
									placeholder='Raison du retrait...'
									rows={3}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none'
								/>
							</div>
						</div>

						<div className='mt-6 flex space-x-3'>
							<button
								onClick={() => {
									setShowWithdrawModal(false);
									setOperationAmount("");
									setOperationDescription("");
								}}
								disabled={operationLoading}
								className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold'
							>
								Annuler
							</button>
							<button
								onClick={handleWithdraw}
								disabled={operationLoading}
								className='flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50'
							>
								{operationLoading ? "Traitement..." : "Retirer"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Notification Modal */}
			<NotificationModal
				isOpen={showNotification}
				type={notificationType}
				title={notificationTitle}
				message={notificationMessage}
				onClose={() => setShowNotification(false)}
			/>
		</div>
	);
}
