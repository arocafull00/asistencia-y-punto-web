"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary disabled:bg-surface-container-highest disabled:text-outline",
  secondary:
    "bg-secondary-container text-on-secondary-container disabled:bg-surface-container disabled:text-outline",
  ghost:
    "bg-transparent border border-outline text-on-surface disabled:border-outline-variant disabled:text-outline",
};

export default function Button({
  title,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-md px-6 py-4 text-sm font-semibold tracking-wide transition-opacity active:opacity-80 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title}
    </button>
  );
}
