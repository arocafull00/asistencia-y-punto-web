"use client";

import { useEffect, useState } from "react";

import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import ModalSheet from "@/components/shared/modal-sheet";
import { dateFromInputValue, toDateInputValue } from "@/utils/dates";

interface SessionDatePickerSheetProps {
  open: boolean;
  onClose: () => void;
  currentDate: Date;
  onConfirm: (date: Date) => void;
  errorMessage?: string | null;
}

export default function SessionDatePickerSheet({
  open,
  onClose,
  currentDate,
  onConfirm,
  errorMessage,
}: SessionDatePickerSheetProps) {
  const [inputValue, setInputValue] = useState(toDateInputValue(currentDate));

  useEffect(() => {
    if (!open) return;
    setInputValue(toDateInputValue(currentDate));
  }, [open, currentDate]);

  const handleConfirm = () => {
    if (!inputValue) return;
    onConfirm(dateFromInputValue(inputValue));
  };

  return (
    <ModalSheet open={open} onClose={onClose}>
      <h2 className="text-xl font-bold text-on-surface">Cambiar fecha</h2>
      <Input
        label="Fecha"
        type="date"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {errorMessage ? (
        <p className="mt-2 text-sm text-error">{errorMessage}</p>
      ) : null}
      <div className="mt-2 flex justify-end gap-2">
        <Button title="Cancelar" variant="ghost" onClick={onClose} />
        <Button title="Guardar" onClick={handleConfirm} disabled={!inputValue} />
      </div>
    </ModalSheet>
  );
}
