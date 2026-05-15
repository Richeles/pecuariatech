'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function DashboardRealLayout({ children }: Props) {
  return (
    <div style={{ padding: 24 }}>
      {children}
    </div>
  );
}