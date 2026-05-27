"use client";

type Props = { alertas: any[] };

function safe(v: any) {

  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {
    return "";
  }

  if (
    typeof v === "object"
  ) {

    const exec =
      v?.executivo;

    const op =
      v?.operacional;

    if (exec || op) {

      return [
        exec,
        op,
      ]
        .filter(Boolean)
        .join(" • ");
    }

    try {

      return JSON.stringify(v);

    } catch {

      return "[objeto]";
    }
  }

  return String(v);
}

const tipoBadge = (
  t: string
) => {

  if (t === "critico") {

    return `
      bg-red-500/10
      text-red-200
      border-red-500/30
    `;
  }

  if (t === "atencao") {

    return `
      bg-yellow-500/10
      text-yellow-200
      border-yellow-500/30
    `;
  }

  return `
    bg-emerald-500/10
    text-emerald-200
    border-emerald-500/30
  `;
};

export default function PastagemAlertasCard({
  alertas,
}: Props) {

  const rows =
    Array.isArray(alertas)
      ? alertas
      : [];

  return (

    <section
      className="
        rounded-[30px]
        border
        border-[#355845]
        bg-[#1a3327]
        p-6
        shadow-[0_10px_40px_rgba(0,0,0,0.22)]
      "
    >

      {/* HEADER */}

      <div
        className="
          text-lg
          font-black
          tracking-tight
          text-[#f3fff7]
        "
      >
        Alertas
      </div>

      {/* EMPTY */}

      {rows.length === 0 ? (

        <div
          className="
            mt-4
            text-sm
            text-[#b7d6c2]
          "
        >
          Sem alertas no momento.
        </div>

      ) : (

        <div
          className="
            mt-5
            space-y-4
          "
        >

          {rows.map((a, idx) => (

            <div
              key={idx}
              className="
                rounded-2xl
                border
                border-[#355845]
                bg-[#14281f]
                p-5
                transition-all
                duration-200
                hover:border-[#4f9b68]
                hover:bg-[#173126]
              "
            >

              {/* TOP */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >

                <div
                  className="
                    text-sm
                    font-bold
                    text-[#f3fff7]
                  "
                >
                  {safe(
                    a?.titulo ||
                    "Alerta"
                  )}
                </div>

                <span
                  className={`
                    rounded-full
                    border
                    px-3
                    py-1
                    text-[11px]
                    font-black
                    tracking-[0.12em]
                    uppercase
                    ${tipoBadge(
                      String(
                        a?.tipo ??
                        "info"
                      )
                    )}
                  `}
                >
                  {String(
                    a?.tipo ??
                    "info"
                  ).toUpperCase()}
                </span>

              </div>

              {/* DETAIL */}

              {a?.detalhe ? (

                <div
                  className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-[#b7d6c2]
                  "
                >

                  {safe(a.detalhe)}

                </div>

              ) : null}

            </div>
          ))}

        </div>
      )}

    </section>
  );
}