import dynamic from "next/dynamic";

const UserManagementClient = dynamic(() => import("./UserManagementClient"));

export default function AdminUsersPage() {
  return <UserManagementClient />;
}
