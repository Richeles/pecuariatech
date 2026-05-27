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
        from-[#edf5ef]
        via-[#f7faf8]
        to-[#dcefe2]
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
            border-[#d7e8dc]
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
              border-[#d7e8dc]
              bg-[#f8fcf9]/95
              backdrop-blur-2xl
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
                    text-[#2f6b4f]
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
                    text-[#183a2d]
                  "
                >
                  PecuariaTech
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#5f7d6c]
                  "
                >
                  Gestão Inteligente Operacional Pecuária
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
                    border-[#cfe1d6]
                    bg-[#eef7f1]
                    px-5
                    py-3
                    shadow-xl
                    xl:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-[#2f6b4f]
                    "
                  >
                    Mode
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-black
                      text-[#183a2d]
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
                    border-[#d7e8dc]
                    bg-white
                    px-5
                    py-3
                    shadow-xl
                    lg:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-[#2f6b4f]
                    "
                  >
                    Runtime
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-[#183a2d]
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
                    border-[#cfe1d6]
                    bg-[#eef7f1]
                    px-5
                    py-3
                    shadow-xl
                    lg:block
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-[#2f6b4f]
                    "
                  >
                    Status
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      font-black
                      text-[#1f5138]
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
                    border-[#d7e8dc]
                    bg-white
                    px-3
                    py-2
                    shadow-xl
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
                    from-[#2f6b4f]
                    to-[#183a2d]
                    text-sm
                    font-black
                    text-white
                    shadow-[0_0_25px_rgba(16,185,129,0.20)]
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