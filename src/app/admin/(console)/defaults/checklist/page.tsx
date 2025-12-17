import dynamic from "next/dynamic";

const ChecklistDefaultsClient = dynamic(() => import("./ChecklistDefaultsClient"));

export default function ChecklistDefaultsPage() {
  return <ChecklistDefaultsClient />;
}
