"use client";

import type { ReactNode } from "react";

interface ScreenBodyProps {
  children: ReactNode;
  className?: string;
}

export default function ScreenBody({ children, className = "" }: ScreenBodyProps) {
  return <div className={`pt-8 ${className}`.trim()}>{children}</div>;
}
