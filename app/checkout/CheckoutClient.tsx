"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
  getLangFromClient,
  t,
} from "@/app/lib/i18n";

import { createClient } from "@/app/lib/supabase-browser";

export default function CheckoutClient() {

  const params =
    useSearchParams();

  const supabase =
    createClient();

  const lang =
    getLangFromClient();

  const plano =
    params.get("plano");

  const periodo =
    params.get("periodo");

  useEffect(() => {

    async function iniciarCheckout() {

      try {

        /* =====================================
           VALIDAR PARAMS
        ===================================== */

        if (
          !plano ||
          !periodo
        ) {

          alert(
            "Plano inválido."
          );

          window.location.href =
            "/planos";

          return;
        }

        /* =====================================
           USER
        ===================================== */

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {

          localStorage.setItem(
            "checkout_plano",
            plano
          );

          localStorage.setItem(
            "checkout_periodo",
            periodo
          );

          window.location.href =
            `/login?next=/checkout?plano=${plano}&periodo=${periodo}`;

          return;
        }

        /* =====================================
           CHECKOUT
        ===================================== */

        const response =
          await fetch(
            "/api/checkout/preference",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                plano,

                periodo,

                email:
                  user.email,

                user_id:
                  user.id,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.init_point
        ) {

          console.error(
            "[CHECKOUT_ERROR]",
            data
          );

          alert(
            "Erro ao iniciar pagamento"
          );

          window.location.href =
            "/planos";

          return;
        }

        /* =====================================
           MP
        ===================================== */

        window.location.href =
          data.init_point;

      } catch (err) {

        console.error(
          "[CHECKOUT_FATAL]",
          err
        );

        alert(
          "Erro inesperado no checkout."
        );

        window.location.href =
          "/planos";
      }
    }

    iniciarCheckout();

  }, [
    plano,
    periodo,
    supabase,
  ]);

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-white
      "
    >

      <p
        className="
          text-lg
          text-neutral-600
        "
      >
        {t(
          lang,
          "processando"
        )}
      </p>

    </div>
  );
}