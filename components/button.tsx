"use client";

import { useFormStatus } from "react-dom";

export const ButtonRegister = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white px-4 py-3 sm:text-base rounded-md hover:bg-indigo-700 mt-6"
    >
      {pending ? "Mendaftarkan Akun" : "Register"}
    </button>
  );
};

export const ButtonLogin = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white px-4 py-3 sm:text-base rounded-md hover:bg-indigo-700 mt-6"
    >
      {pending ? "Masuk..." : "Login"}
    </button>
  );
};
