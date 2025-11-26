"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { accountService, Account } from "@/components/lib/api/account.service";
import { transferService } from "@/components/lib/api/transfer.service";
import { useAuth } from "@/components/contexts/AuthContext";
import Link from "next/link";

const transferSchema = z.object({
  sourceAccountId: z.string().min(1, "Veuillez sélectionner un compte source"),
  transferType: z.enum(["internal", "external"], {
    message: "Veuillez sélectionner un type de virement"
  }),
  destinationAccountId: z.string().optional(),
  destinationIban: z.string().optional(),
  amount: z
    .number()
    .positive("Le montant doit être positif")
    .min(0.01, "Le montant minimum est de 0,01 €"),
  currency: z.string().min(1, "La devise est requise"),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.transferType === "internal") {
    if (!data.destinationAccountId || data.destinationAccountId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le compte de destination est requis pour un virement interne",
        path: ["destinationAccountId"],
      });
    }
  }
  if (data.transferType === "external") {
    if (!data.destinationIban || data.destinationIban.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'IBAN est requis pour un virement externe",
        path: ["destinationIban"],
      });
    }
  }
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function TransfersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour la recherche IBAN
  const [ibanLoading, setIbanLoading] = useState(false);
  const [ibanInfo, setIbanInfo] = useState<{
    ownerName: string;
    bankName: string;
    isValid: boolean;
  } | null>(null);
  const [ibanError, setIbanError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const sourceAccountId = watch("sourceAccountId");
  const transferType = watch("transferType");
  const destinationIban = watch("destinationIban");
  const selectedFromAccount = accounts.find((acc) => acc.id === sourceAccountId);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await accountService.getAll();
        if (response.data) {
          setAccounts(response.data);
        }
      } catch (err) {
        setError("Erreur lors du chargement des comptes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fonction pour rechercher les informations d'un IBAN
  const handleIbanLookup = async (iban: string) => {
    // Réinitialiser les états
    setIbanInfo(null);
    setIbanError(null);
    setIbanLoading(false);

    if (!iban || iban.length < 15) {
      return;
    }

    // Vérifier si l'IBAN correspond à l'un des comptes de l'utilisateur
    // Normaliser les IBAN (supprimer espaces et mettre en majuscules) pour la comparaison
    const normalizedInputIban = iban.replace(/\s/g, '').toUpperCase();
    const userIban = accounts.find(account => {
      const normalizedAccountIban = account.iban.replace(/\s/g, '').toUpperCase();
      return normalizedAccountIban === normalizedInputIban;
    });
    
    if (userIban) {
      setIbanError("Impossible de se virer de l'argent à un compte qui vous appartient via IBAN. Utilisez un virement interne.");
      return;
    }

    setIbanLoading(true);

    try {
      const response = await transferService.getAccountByIban(iban);
      if (response.success && response.data) {
        if (response.data.isValid) {
          setIbanInfo({
            ownerName: response.data.ownerName,
            bankName: response.data.bankName,
            isValid: response.data.isValid
          });
        } else {
          setIbanError("IBAN non trouvé ou invalide");
        }
      } else {
        setIbanError("Impossible de vérifier cet IBAN");
      }
    } catch (err: any) {
      console.error("Erreur lookup IBAN:", err);
      setIbanError("Erreur lors de la vérification de l'IBAN");
    } finally {
      setIbanLoading(false);
    }
  };

  // Effet pour déclencher la recherche IBAN
  useEffect(() => {
    if (transferType === "external" && destinationIban) {
      const timeoutId = setTimeout(() => {
        handleIbanLookup(destinationIban);
      }, 500); // Délai pour éviter trop de requêtes

      return () => clearTimeout(timeoutId);
    } else {
      setIbanInfo(null);
      setIbanError(null);
    }
  }, [destinationIban, transferType]);

  // Fonction pour construire l'IBAN complet
  const updateIban = () => {
    const frInput = document.querySelector('input[data-iban-index="0"]') as HTMLInputElement;
    const inputs = document.querySelectorAll('input[data-iban-index]:not([data-iban-index="0"])') as NodeListOf<HTMLInputElement>;
    
    const frCode = frInput?.value || '';
    const ibanParts = Array.from(inputs).map(input => input.value);
    const fullIban = 'FR' + frCode + ibanParts.join('');
    
    setValue('destinationIban', fullIban);
  };

  // Fonction pour vider tous les champs IBAN
  const resetIban = () => {
    const allInputs = document.querySelectorAll('input[data-iban-index]') as NodeListOf<HTMLInputElement>;
    allInputs.forEach(input => {
      input.value = '';
    });
    setValue('destinationIban', '');
    setIbanInfo(null);
    setIbanError(null);
    
    // Focus sur la première case
    const frInput = document.querySelector('input[data-iban-index="0"]') as HTMLInputElement;
    if (frInput) frInput.focus();
  };

  // Fonction pour distribuer l'IBAN dans les cases
  const distributeIban = (pastedText: string) => {
    // Nettoyer l'IBAN (supprimer espaces, tirets, etc.)
    const cleanedIban = pastedText.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Vérifier que ça commence par FR et a la bonne longueur
    if (!cleanedIban.startsWith('FR') || cleanedIban.length < 6) {
      return false; // Pas un IBAN français valide
    }
    
    // Extraire les parties de l'IBAN
    const frCode = cleanedIban.substring(2, 4); // 2 chiffres après FR
    const remainingDigits = cleanedIban.substring(4); // Le reste
    
    // Distribuer dans les cases
    const frInput = document.querySelector('input[data-iban-index="0"]') as HTMLInputElement;
    const inputs = document.querySelectorAll('input[data-iban-index]:not([data-iban-index="0"])') as NodeListOf<HTMLInputElement>;
    
    // Remplir la case FR
    if (frInput) {
      frInput.value = frCode;
    }
    
    // Distribuer le reste dans les autres cases
    let digitIndex = 0;
    inputs.forEach((input, index) => {
      const maxLength = index === 5 ? 3 : 4; // Dernière case = 3 chiffres
      const digits = remainingDigits.substring(digitIndex, digitIndex + maxLength);
      input.value = digits;
      digitIndex += maxLength;
    });
    
    // Mettre à jour l'IBAN complet
    updateIban();
    return true;
  };

  // Fonction pour gérer le collage intelligent d'IBAN (onPaste)
  const handleIbanPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    distributeIban(pastedText);
  };

  // Fonction pour gérer Ctrl+V
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Détecter Ctrl+V ou Cmd+V (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      
      // Utiliser l'API Clipboard pour récupérer le contenu
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
          distributeIban(text);
        }).catch((err) => {
          console.warn('Impossible de lire le presse-papiers:', err);
        });
      }
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      if (data.transferType === "external") {
        // Vérifier que l'IBAN est valide avant d'envoyer
        if (!ibanInfo || !ibanInfo.isValid) {
          setError("Veuillez saisir un IBAN valide");
          setSubmitting(false);
          return;
        }

        // Vérifier que l'IBAN ne correspond pas à un compte de l'utilisateur
        const normalizedDestinationIban = data.destinationIban!.replace(/\s/g, '').toUpperCase();
        const userIban = accounts.find(account => {
          const normalizedAccountIban = account.iban.replace(/\s/g, '').toUpperCase();
          return normalizedAccountIban === normalizedDestinationIban;
        });
        
        if (userIban) {
          setError("Vous ne pouvez pas effectuer un virement vers votre propre compte. Utilisez un virement interne.");
          setSubmitting(false);
          return;
        }
        
        response = await transferService.createToIban({
          sourceAccountId: data.sourceAccountId,
          destinationIban: data.destinationIban!,
          amount: data.amount,
          currency: data.currency,
          description: data.description
        });
      } else {
        // Transfert interne classique
        if (!data.destinationAccountId) {
          setError("Le compte de destination est requis pour un transfert interne");
          setSubmitting(false);
          return;
        }
        
        response = await transferService.create({
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          amount: data.amount,
          currency: data.currency,
          description: data.description
        });
      }
      
      setSuccess(response.message);
      reset();
      setIbanInfo(null);
      setIbanError(null);
      
      // Recharger les comptes pour afficher les nouveaux soldes
      const updatedResponse = await accountService.getAll();
      if (updatedResponse.data) {
        setAccounts(updatedResponse.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors du transfert"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Aucun compte disponible
          </h2>
          <p className="text-yellow-700 mb-4">
            Vous devez avoir au moins un compte pour effectuer des transferts.
          </p>
          <Link
            href="/dashboard/accounts/create"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Effectuer un transfert
        </h1>
        <p className="text-gray-600">
          Transférez de l'argent entre vos comptes ou vers un compte externe
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Compte source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compte source
            </label>
            <select
              {...register("sourceAccountId")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un compte</option>
              {accounts
                .filter((account) => account.balance > 0)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.balance.toFixed(2)} €
                  </option>
                ))}
            </select>
            {errors.sourceAccountId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sourceAccountId.message}
              </p>
            )}
          </div>

          {/* Solde disponible */}
          {selectedFromAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Solde disponible:</span>{" "}
                {selectedFromAccount.balance.toFixed(2)} €
              </p>
            </div>
          )}

          {/* Type de transfert */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de virement
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  {...register("transferType")}
                  value="internal"
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  transferType === "internal" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      transferType === "internal" 
                        ? "border-blue-500 bg-blue-500" 
                        : "border-gray-300"
                    }`}>
                      {transferType === "internal" && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Virement interne</p>
                      <p className="text-sm text-gray-600">Entre vos comptes</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  {...register("transferType")}
                  value="external"
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  transferType === "external" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      transferType === "external" 
                        ? "border-blue-500 bg-blue-500" 
                        : "border-gray-300"
                    }`}>
                      {transferType === "external" && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Virement externe</p>
                      <p className="text-sm text-gray-600">Vers un IBAN</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {errors.transferType && (
              <p className="mt-2 text-sm text-red-600">
                {errors.transferType.message}
              </p>
            )}
          </div>

          {/* Compte destination interne */}
          {transferType === "internal" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte destination
              </label>
              <select
                {...register("destinationAccountId")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un compte</option>
                {accounts
                  .filter((acc) => acc.id !== sourceAccountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.balance.toFixed(2)} €
                    </option>
                  ))}
              </select>
              {errors.destinationAccountId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.destinationAccountId.message}
                </p>
              )}
            </div>
          )}

          {/* Virement externe par IBAN */}
          {transferType === "external" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN du destinataire
              </label>
              
              {/* Interface IBAN formatée */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {/* Case 1: FR + 2 chiffres */}
                  <div className="flex items-center">
                    <span className="px-2 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-700 font-mono text-sm">
                      FR
                    </span>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="76"
                      className="w-12 px-2 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-sm"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Ne garder que les chiffres
                        e.target.value = value;
                        updateIban();
                        
                        // Auto-focus sur la case suivante si 2 chiffres saisis
                        if (value.length === 2) {
                          const nextInput = document.querySelector('input[data-iban-index="1"]') as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Gérer Ctrl+V
                        handleKeyDown(e);
                        
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={handleIbanPaste}
                      data-iban-index="0"
                    />
                  </div>
                  
                  {/* Cases 2-7: 4 chiffres chacune */}
                  <div className="flex space-x-2 flex-wrap items-center">
                    {[1, 2, 3, 4, 5, 6].map((index) => {
                      const placeholders = ['1234', '5678', '9012', '3456', '7890', '123'];
                      return (
                        <input
                          key={index}
                          type="text"
                          maxLength={index === 6 ? 3 : 4} // Dernière case: 3 chiffres seulement
                          placeholder={placeholders[index - 1]}
                          className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-sm"
                          data-iban-index={index}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Ne garder que les chiffres
                            e.target.value = value;
                            updateIban();
                            
                            // Auto-focus sur la case suivante
                            const maxLength = index === 6 ? 3 : 4;
                            if (value.length === maxLength && index < 6) {
                              const nextInput = document.querySelector(`input[data-iban-index="${index + 1}"]`) as HTMLInputElement;
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            // Gérer Ctrl+V
                            handleKeyDown(e);
                            
                            // Permettre seulement les chiffres, backspace, delete, tab et les flèches
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                              e.preventDefault();
                            }
                            
                            // Retour automatique à la case précédente si backspace sur case vide
                            if (e.key === 'Backspace' && e.currentTarget.value === '' && index > 1) {
                              const prevInput = document.querySelector(`input[data-iban-index="${index - 1}"]`) as HTMLInputElement;
                              if (prevInput) {
                                prevInput.focus();
                                prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                              }
                            } else if (e.key === 'Backspace' && e.currentTarget.value === '' && index === 1) {
                              // Retour à la case FR
                              const frInput = document.querySelector('input[data-iban-index="0"]') as HTMLInputElement;
                              if (frInput) {
                                frInput.focus();
                                frInput.setSelectionRange(frInput.value.length, frInput.value.length);
                              }
                            }
                          }}
                          onPaste={handleIbanPaste}
                        />
                      );
                    })}
                    
                    {/* Bouton Reset */}
                    <button
                      type="button"
                      onClick={resetIban}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Vider l'IBAN"
                    >
                      <i className="fi fi-rr-cross text-xl"></i>
                    </button>
                  </div>
                </div>
                
                {/* Instructions et exemple */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Format: FR76 1234 5678 9012 3456 7890 123</p>
                  <p className="flex items-center space-x-1">
                    <i className="fi fi-rr-bulb text-xs"></i>
                    <span>Astuce: vous pouvez coller un IBAN complet dans n'importe quelle case</span>
                  </p>
                </div>
              </div>
              
              {/* Champ caché pour le formulaire */}
              <input type="hidden" {...register("destinationIban")} />
              
              {errors.destinationIban && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.destinationIban.message}
                </p>
              )}
              
              {/* Informations du destinataire */}
              {destinationIban && (
                <div className="mt-3">
                  {ibanLoading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Vérification de l'IBAN...</span>
                    </div>
                  )}
                  
                  {ibanError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{ibanError}</p>
                    </div>
                  )}
                  
                  {ibanInfo && ibanInfo.isValid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <i className="fi fi-rr-check text-green-600 text-xl mt-0.5"></i>
                        <div>
                          <p className="text-sm font-medium text-green-900">IBAN valide</p>
                          <p className="text-sm text-green-800">
                            <strong>Bénéficiaire:</strong> {ibanInfo.ownerName}
                          </p>
                          <p className="text-sm text-green-800">
                            <strong>Banque:</strong> {ibanInfo.bankName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              max='10000'
              {...register("amount", { valueAsNumber: true })}
              disabled={transferType === "external" && !!ibanError}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                transferType === "external" && ibanError ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>
          <input type="hidden" {...register("currency")} value="EUR" />

          {/* Description - uniquement pour les virements internes */}
          {transferType === "internal" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Motif du transfert..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || (transferType === "external" && !!ibanError)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? "Transfert en cours..." : "Effectuer le transfert"}
            </button>
            <Link
              href="/dashboard/accounts"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>

      {/* Mes comptes */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Mes comptes
        </h2>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {account.name}
                </p>
                <p className="text-sm text-gray-500">{account.iban}</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {account.balance.toFixed(2)} €
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
