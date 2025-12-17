import dynamic from "next/dynamic";

const OverviewClient = dynamic(() => import("./components/OverviewClient"));

export default function AdminOverviewPage() {
  return <OverviewClient />;
}
