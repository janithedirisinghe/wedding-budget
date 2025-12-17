import dynamic from "next/dynamic";

const AdminCurrenciesClient = dynamic(() => import("./AdminCurrenciesClient"));

export default function AdminCurrenciesPage() {
  return <AdminCurrenciesClient />;
}
