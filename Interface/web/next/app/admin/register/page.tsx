import RegisterPage from "../../register/page";
import { useClientMetadata } from "@/components/lib/seo";

export default function AdminRegisterPage() {
	useClientMetadata("/admin/register");
	return <RegisterPage />;
}