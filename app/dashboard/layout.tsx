// =========================================================
// PecuariaTech
// Dashboard Layout Runtime
// Equação Y + Regra Z + Triângulo 360
// Runtime Premium Estabilizado
// =========================================================

import Sidebar from "./components/Sidebar";

import LanguageSwitcher
  from "@/app/components/i18n/LanguageSwitcher";

/* =========================================================
   NEXT
========================================================= */

export const dynamic =
  "force-dynamic";

/* =========================================================
   LAYOUT
========================================================= */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /* =====================================================
     RUNTIME
  ===================================================== */

  const runtimeStatus =
    "ONLINE";

  const runtimeLayer =
    "π Cognitive";

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-gray-50
        via-white
        to-emerald-50
        text-gray-800
      "
    >

      <div
        className="
          flex
          min-h-screen
          w-full
        "
      >

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className="
            relative
            z-40
            flex-shrink-0
            border-r
            border-emerald-100
            bg-white/95
            backdrop-blur
          "
        >

          <Sidebar />

        </aside>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            flex
            min-h-screen
            flex-1
            flex-col
            overflow-hidden
          "
        >

          {/* =============================================
              HEADER
          ============================================= */}

          <header
            className="
              sticky
              top-0
              z-30
              border-b
              border-emerald-100
              bg-white/90
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                px-8
                py-5
              "
            >

              {/* =========================================
                  TITLE
              ========================================= */}

              <div
                className="
                  min-w-0
                "
              >

                <div
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.25em]
                    text-emerald-700
                  "
                >
                  Runtime Cognitivo
                </div>

                <h1
                  className="
                    mt-2
                    truncate
                    text-2xl
                    font-black
                    text-gray-900
                  "
                >
                  PecuariaTech
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Inteligência operacional pecuária
                </p>

              </div>

              {/* =========================================
                  RIGHT
              ========================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-5
                "
              >

                {/* =====================================
                    RUNTIME
                ===================================== */}

                <div
                  className="
                    hidden
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-white
                    px-5
                    py-3
                    shadow-sm
                    lg:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-emerald-700
                    "
                  >
                    Runtime
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {runtimeLayer}
                  </div>

                </div>

                {/* =====================================
                    STATUS
                ===================================== */}

                <div
                  className="
                    hidden
                    rounded-2xl
                    border
                    border-green-100
                    bg-green-50
                    px-5
                    py-3
                    shadow-sm
                    lg:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-green-700
                    "
                  >
                    Status
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-black
                      text-green-800
                    "
                  >
                    {runtimeStatus}
                  </div>

                </div>

                {/* =====================================
                    LANGUAGE
                ===================================== */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2
                    shadow-sm
                  "
                >

                  <LanguageSwitcher />

                </div>

                {/* =====================================
                    USER
                ===================================== */}

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-green-600
                    to-emerald-700
                    text-sm
                    font-black
                    text-white
                    shadow-xl
                  "
                >
                  U
                </div>

              </div>

            </div>

          </header>

          {/* =============================================
              MAIN
          ============================================= */}

          <main
            className="
              flex-1
              overflow-x-hidden
              overflow-y-auto
              p-8
            "
          >

            <div
              className="
                mx-auto
                w-full
                max-w-7xl
              "
            >

              {children}

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}