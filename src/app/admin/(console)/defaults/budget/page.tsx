import dynamic from "next/dynamic";

const BudgetDefaultsClient = dynamic(() => import("./BudgetDefaultsClient"));

export default function BudgetDefaultsPage() {
  return <BudgetDefaultsClient />;
}
