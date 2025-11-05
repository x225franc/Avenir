"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";
import { resetPasswordSchema, ResetPasswordFormData } from "@/components/lib/validations/schemas";

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { loading: authLoading, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	useEffect(() => {
		if (!token) {
			setError("Token de réinitialisation manquant");
		}
	}, [token]);

	useEffect(() => {
			if (isAuthenticated) {
				router.push("/dashboard");
				return;
			}
		}, [authLoading, isAuthenticated, router]);

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) {
			setError("Token de réinitialisation manquant");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await axios.post(
				"http://localhost:3001/api/users/reset-password",
				{
					token,
					newPassword: data.password,
				}
			);

			if (response.data.success) {
				setSuccess(true);
				setTimeout(() => {
					router.push("/login");
				}, 3000);
			}
		} catch (err: any) {
			setError(
				err.response?.data?.error ||
					"Une erreur est survenue. Veuillez réessayer."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 px-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						🔑 Nouveau mot de passe
					</h1>
					<p className="text-gray-600">
						Définissez un nouveau mot de passe pour votre compte
					</p>
				</div>

				{success ? (
					<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
						<p className="font-medium">✅ Mot de passe réinitialisé !</p>
						<p className="text-sm mt-1">
							Redirection vers la page de connexion...
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
								{error}
							</div>
						)}

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Nouveau mot de passe
							</label>
							<input
								type="password"
								id="password"
								{...register("password")}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="••••••••"
							/>
							{errors.password && (
								<p className="text-red-500 text-sm mt-1">
									{errors.password.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Confirmer le mot de passe
							</label>
							<input
								type="password"
								id="confirmPassword"
								{...register("confirmPassword")}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="••••••••"
							/>
							{errors.confirmPassword && (
								<p className="text-red-500 text-sm mt-1">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading || !token}
							className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
						>
							{loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
						</button>
					</form>
				)}

				<div className="mt-6 text-center text-sm text-gray-600">
					<Link href="/login" className="text-purple-600 hover:underline">
						← Retour à la connexion
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div>Chargement...</div>}>
			<ResetPasswordContent />
		</Suspense>
	);
}
