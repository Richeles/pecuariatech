"use client";

type Props = { resumo: any };

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

export default function PastagemTriangulo360({
  resumo,
}: Props) {

  const risco =
    safe(
      resumo?.risco_pastagem ??
      "DESCONHECIDO"
    );

  const pressao =
    safe(
      resumo?.pressao_pastagem_score ??
      "-"
    );

  const operacional =
    safe(
      resumo?.decisao_recomendada ??
      "Sem ação operacional no momento."
    );

  const tatico =
    "Rotação, pressão de pastejo, ajuste de lotação e recuperação da área ativa.";

  const executivo =
    `Risco: ${risco} | Pressão: ${pressao}`;

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
        Triângulo 360
      </div>

      <p
        className="
          mt-2
          text-sm
          leading-relaxed
          text-[#b7d6c2]
        "
      >
        Gestão operacional/tática/executiva
        com leitura biológica contínua
        e governança estrutural integrada.
      </p>

      {/* GRID */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-4
          md:grid-cols-3
        "
      >

        <Box
          title="Operacional"
          text={operacional}
        />

        <Box
          title="Tático"
          text={tatico}
        />

        <Box
          title="Executivo"
          text={executivo}
        />

      </div>

    </section>
  );
}

function Box({
  title,
  text,
}: {
  title: string;
  text: string;
}) {

  return (

    <div
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

      <div
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.16em]
          text-[#8eb59d]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-3
          text-sm
          leading-relaxed
          text-[#f3fff7]
        "
      >
        {text}
      </div>

    </div>
  );
}