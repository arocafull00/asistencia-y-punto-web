"use client";

import { useMemo } from "react";
import type { HTMLAttributes } from "react";

import { ionIconToSvgMarkup } from "@/utils/ion-icon-markup";

interface IonIconProps extends HTMLAttributes<HTMLSpanElement> {
  icon: string;
}

export function IonIcon({ icon, className = "", ...props }: IonIconProps) {
  const markup = useMemo(() => ionIconToSvgMarkup(icon), [icon]);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
      {...props}
    />
  );
}
