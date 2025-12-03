import LoginPage from "../../login/page";
import { useClientMetadata } from "@/components/lib/seo";

export default function AdminLoginPage() {
	useClientMetadata("/admin/login");
	return <LoginPage />;
}