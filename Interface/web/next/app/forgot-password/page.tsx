"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import '@flaticon/flaticon-uicons/css/all/all.css';

const forgotPasswordSchema = z.object({
	email: z
		.string()
		.email("Veuillez entrer une adresse email valide")
		.min(1, "L'email est requis"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordForm>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordForm) => {
		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			const response = await axios.post(
				"http://localhost:3001/api/users/forgot-password",
				{
					email: data.email,
				}
			);

			if (response.data.success) {
				setSuccess(true);
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
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-blue-500 px-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
						<i className="fi fi-rr-lock"></i>
						Mot de passe oublié
					</h1>
					<p className="text-gray-600">
						Entrez votre email pour recevoir un lien de réinitialisation
					</p>
				</div>

				{success ? (
					<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
						<p className="font-medium flex items-center gap-2">
							<i className="fi fi-rr-check-circle"></i>
							Email envoyé !
						</p>
						<p className="text-sm mt-1">
							Si un compte existe avec cet email, vous recevrez un lien de
							réinitialisation dans quelques minutes.
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
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Adresse email
							</label>
							<input
								type="email"
								id="email"
								{...register("email")}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="votre@email.com"
							/>
							{errors.email && (
								<p className="text-red-500 text-sm mt-1">
									{errors.email.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
						>
							{loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
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
