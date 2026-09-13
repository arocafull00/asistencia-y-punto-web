"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  multiline?: boolean;
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  function Input({ label, className = "", multiline, rows = 3, ...props }, ref) {
    const fieldClassName = `w-full rounded-md border border-outline-variant bg-surface-container-lowest px-6 py-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`;

    return (
      <div className="w-full">
        {label ? (
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-on-surface">
            {label}
          </label>
        ) : null}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={`${fieldClassName} min-h-20 resize-none`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={fieldClassName}
            {...props}
          />
        )}
      </div>
    );
  },
);

export default Input;
