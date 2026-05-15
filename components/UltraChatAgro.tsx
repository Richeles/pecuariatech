'use client';

import { useMemo, useState } from 'react';

type Message = {
  id: number;
  user_name: string;
  content: string;
  timestamp: string;
};

export default function UltraChatAgro() {
  const [messages] = useState<Message[]>([
    {
      id: 1,
      user_name: 'Sistema',
      content:
        'Bem-vindo ao UltraChat Agro. Plataforma operacional iniciada com sucesso.',
      timestamp: '08:00',
    },
    {
      id: 2,
      user_name: 'PecuariaTech',
      content:
        'Monitoramento biológico, financeiro e operacional ativo.',
      timestamp: '08:02',
    },
    {
      id: 3,
      user_name: 'IA Operacional',
      content:
        'Nenhum risco crítico detectado no rebanho nas últimas 24 horas.',
      timestamp: '08:05',
    },
  ]);

  const totalMessages = useMemo(() => {
    return messages.length;
  }, [messages]);

  return (
    <section
      style={{
        width: '100%',
        minHeight: '320px',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid #bbf7d0',
        background:
          'linear-gradient(to bottom right, #f0fdf4, #ffffff)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#166534',
              letterSpacing: '-0.5px',
            }}
          >
            🌱 UltraChat Agro
          </h2>

          <p
            style={{
              marginTop: '6px',
              color: '#4b5563',
              fontSize: '15px',
              lineHeight: 1.5,
            }}
          >
            Central inteligente de comunicação operacional do
            ecossistema PecuariaTech.
          </p>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: '999px',
            background: '#dcfce7',
            color: '#166534',
            fontWeight: 600,
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          {totalMessages} mensagens
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          background: '#ffffff',
          padding: '18px',
          height: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#f9fafb',
              border: '1px solid #f3f4f6',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                gap: '10px',
              }}
            >
              <strong
                style={{
                  color: '#111827',
                  fontSize: '15px',
                }}
              >
                {message.user_name}
              </strong>

              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                {message.timestamp}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                color: '#374151',
                lineHeight: 1.6,
                fontSize: '14px',
              }}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          Status operacional: online
        </span>

        <button
          type="button"
          style={{
            border: 'none',
            background: '#16a34a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Abrir painel completo
        </button>
      </div>
    </section>
  );
}