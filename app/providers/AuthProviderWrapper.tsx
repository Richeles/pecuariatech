"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/app/lib/AuthContext";

export default function AuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}