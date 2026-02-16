import { signOut } from "@/auth";

export const LogoutButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      >
        Logout
      </button>
    </form>
  );
};
