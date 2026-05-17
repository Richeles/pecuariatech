// =========================================================
// PecuariaTech
// Dashboard Layout Runtime Premium
// Equação Y + Regra Z + Triângulo 360
// Sistema Operacional Cognitivo do Agronegócio
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

  const runtimeMode =
    "Enterprise";

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#f4f7f5]
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
            backdrop-blur-xl
            shadow-sm
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
              bg-white/85
              backdrop-blur-2xl
              shadow-sm
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
                    tracking-[0.28em]
                    text-emerald-700
                  "
                >
                  Runtime Cognitivo
                </div>

                <h1
                  className="
                    mt-2
                    truncate
                    text-3xl
                    font-black
                    text-gray-950
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
                  Sistema Operacional Cognitivo do Agronegócio
                </p>

              </div>

              {/* =========================================
                  RIGHT
              ========================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                {/* =====================================
                    MODE
                ===================================== */}

                <div
                  className="
                    hidden
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50
                    px-5
                    py-3
                    shadow-sm
                    xl:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-blue-700
                    "
                  >
                    Mode
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-black
                      text-blue-900
                    "
                  >
                    {runtimeMode}
                  </div>

                </div>

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
                    border-emerald-100
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
              px-6
              py-8
              xl:px-10
              2xl:px-14
            "
          >

            <div
              className="
                mx-auto
                w-full
                max-w-[1850px]
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