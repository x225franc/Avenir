"use client";

import LoginPage from "../../login/page";
import { useClientMetadata } from "@/components/lib/seo";

export default function AdvisorLoginPage() {
	useClientMetadata("/advisor/login");
	return <LoginPage />;
}