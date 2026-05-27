"use client";

type Props = { piquetes: any[] };

function safe(v: any) {

  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {
    return "-";
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

function fmtNum(v: any) {

  const n =
    Number(v);

  if (
    !Number.isFinite(n)
  ) {
    return safe(v);
  }

  return n.toLocaleString(
    "pt-BR"
  );
}

export default function PastagemPiquetesTable({
  piquetes,
}: Props) {

  const rows =
    Array.isArray(piquetes)
      ? piquetes
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
        Piquetes
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
          Nenhum piquete retornado pela API.
        </div>

      ) : (

        <div
          className="
            mt-5
            overflow-x-auto
            rounded-2xl
            border
            border-[#355845]
          "
        >

          <table
            className="
              min-w-full
              text-sm
            "
          >

            {/* HEAD */}

            <thead
              className="
                bg-[#14281f]
                text-[#8eb59d]
              "
            >

              <tr>

                <Th>Nome</Th>

                <Th>Área (ha)</Th>

                <Th>Tipo</Th>

                <Th>Capacidade (UA)</Th>

                <Th>Status</Th>

                <Th>Últ. movimentação</Th>

              </tr>

            </thead>

            {/* BODY */}

            <tbody>

              {rows.map((p, idx) => (

                <tr
                  key={String(
                    p?.piquete_id ??
                    idx
                  )}
                  className="
                    border-t
                    border-[#355845]
                    transition-all
                    duration-150
                    hover:bg-[#173126]
                  "
                >

                  <Td>
                    {safe(p?.nome)}
                  </Td>

                  <Td>
                    {fmtNum(
                      p?.area_ha
                    )}
                  </Td>

                  <Td>
                    {safe(
                      p?.tipo_pasto
                    )}
                  </Td>

                  <Td>
                    {fmtNum(
                      p?.capacidade_ua
                    )}
                  </Td>

                  <Td>
                    {safe(
                      p?.status
                    )}
                  </Td>

                  <Td>
                    {safe(
                      p?.ultima_movimentacao_em
                    )}
                  </Td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}

function Th({
  children,
}: {
  children: any;
}) {

  return (

    <th
      className="
        px-4
        py-3
        text-left
        text-xs
        font-black
        uppercase
        tracking-[0.14em]
      "
    >

      {children}

    </th>
  );
}

function Td({
  children,
}: {
  children: any;
}) {

  return (

    <td
      className="
        px-4
        py-3
        text-[#f3fff7]
      "
    >

      {children}

    </td>
  );
}