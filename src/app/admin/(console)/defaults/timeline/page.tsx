import dynamic from "next/dynamic";

const TimelineDefaultsClient = dynamic(() => import("./TimelineDefaultsClient"));

export default function TimelineDefaultsPage() {
  return <TimelineDefaultsClient />;
}
