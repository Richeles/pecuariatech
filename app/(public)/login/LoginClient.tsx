"use client";

import { useEffect, useState } from "react";
import { getLangFromClient, t, Lang } from "@/app/lib/i18n";

export default function LoginClient() {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  return (
    <form className="space-y-4">

      <input
        type="email"
        placeholder={t(lang, "email")}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="password"
        placeholder={t(lang, "password")}
        className="w-full p-3 border rounded-lg"
      />

      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        {t(lang, "enter")}
      </button>

      <div className="text-center text-sm mt-4 space-y-2">
        <p className="text-green-600 cursor-pointer">
          {t(lang, "create_account")}
        </p>

        <p className="text-gray-500 cursor-pointer">
          {t(lang, "forgot_password")}
        </p>
      </div>

    </form>
  );
}