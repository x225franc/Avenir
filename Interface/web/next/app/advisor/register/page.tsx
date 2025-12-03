import RegisterPage from "../../register/page";
import { useClientMetadata } from "@/components/lib/seo";

export default function AdvisorRegisterPage() {
	useClientMetadata("/advisor/register");
	return <RegisterPage />;
}