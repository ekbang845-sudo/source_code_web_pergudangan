"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/action";
import { ButtonRegister } from "../button";

const RegsiterForm = () => {
  const [state, formAction] = useActionState(signUpAction, null);
  return (
    <form action={formAction}>
      <div className="space-y-6">
        {state?.message ? (
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100"
            role="alert"
          >
            <span className="font-medium">{state?.message}</span>
          </div>
        ) : null}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900"
          >
            Nama
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="John Doe"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 p-2.5"
            required
          />
          <div aria-live="polite" aria-atomic="true">
            <span className="text-red-500 text-sm mt-2">
              {state?.error?.name}
            </span>
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 p-2.5"
            placeholder="contoh@email.com"
            required
          />
          <div aria-live="polite" aria-atomic="true">
            <span className="text-red-500 text-sm mt-2">
              {state?.error?.email}
            </span>
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 p-2.5"
            placeholder="********"
            required
          />
          <div aria-live="polite" aria-atomic="true">
            <span className="text-red-500 text-sm mt-2">
              {state?.error?.password}
            </span>
          </div>
        </div>
        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium text-gray-900"
          >
            Konfirmasi Password
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 p-2.5"
            placeholder="********"
            required
          />
          <div aria-live="polite" aria-atomic="true">
            <span className="text-red-500 text-sm mt-2">
              {state?.error?.confirm_password}
            </span>
          </div>
        </div>
      </div>
      <ButtonRegister/>
      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegsiterForm;
