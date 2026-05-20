import type { Metadata }
from "next";

import RebanhoClient
from "@/app/dashboard/rebanho/components/RebanhoClient";

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {

  title:
    "PecuariaTech • Governança Cognitiva Rebanho",

  description:
    "Runtime cognitivo biológico integrado ao rebanho com rastreabilidade inteligente, sanidade operacional, pressão animal, compliance sanitário e governança executiva.",

  keywords: [

    "pecuária",

    "rebanho",

    "governança biológica",

    "rastreamento bovino",

    "brincos inteligentes",

    "runtime cognitivo",

    "sanidade animal",

    "compliance pecuário",

    "IA pecuária",

    "PecuariaTech",
  ],

  openGraph: {

    title:
      "PecuariaTech • Governança Cognitiva Rebanho",

    description:
      "Centro cognitivo biológico conectado ao runtime PecuariaTech.",

    type: "website",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function RebanhoPage() {

  return (

    <main
      className="
        min-h-screen
        bg-[#eef4ef]
      "
    >

      <RebanhoClient />

    </main>
  );
}