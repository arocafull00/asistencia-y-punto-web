"use client";

import { useRef, useState } from "react";

import ImportCsvPreviewStat from "@/components/home/import-csv-preview-stat";
import ImportDestinationOption from "@/components/home/import-destination-option";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import ModalSheet from "@/components/shared/modal-sheet";
import type { GroupWithStats } from "@/types";
import type { ParsedCsvPreview } from "@/utils/importGroupCsv";
import { parseGroupCsv, readCsvFile } from "@/utils/importGroupCsv";

type DestinationMode = "new" | "existing";

interface ImportCsvSheetProps {
  open: boolean;
  onClose: () => void;
  groups: GroupWithStats[];
  onImport: (
    preview: ParsedCsvPreview,
    destination: { type: "new"; groupName: string } | { type: "existing"; groupId: number },
  ) => Promise<void>;
  importing: boolean;
}

const DESTINATION_OPTIONS: { mode: DestinationMode; label: string }[] = [
  { mode: "new", label: "Nuevo grupo" },
  { mode: "existing", label: "Grupo existente" },
];

export default function ImportCsvSheet({
  open,
  onClose,
  groups,
  onImport,
  importing,
}: ImportCsvSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedCsvPreview | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [destinationMode, setDestinationMode] = useState<DestinationMode>("new");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const resetState = () => {
    setPreview(null);
    setFileName("");
    setError(null);
    setDestinationMode("new");
    setNewGroupName("");
    setSelectedGroupId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (importing) return;
    resetState();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(null);

    try {
      const { content, fileName: selectedFileName } = await readCsvFile(file);
      const parsed = parseGroupCsv(content, selectedFileName);
      setPreview(parsed);
      setFileName(selectedFileName);
      setNewGroupName(parsed.suggestedGroupName);
      setDestinationMode("new");
      setSelectedGroupId(groups[0]?.id ?? null);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "No se pudo leer el archivo");
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    if (destinationMode === "new") {
      if (!newGroupName.trim()) {
        setError("El nombre del grupo es obligatorio");
        return;
      }

      await onImport(preview, { type: "new", groupName: newGroupName.trim() });
      return;
    }

    if (!selectedGroupId) {
      setError("Selecciona un grupo existente");
      return;
    }

    await onImport(preview, { type: "existing", groupId: selectedGroupId });
  };

  const canImport =
    preview !== null &&
    !importing &&
    (destinationMode === "new" ? newGroupName.trim().length > 0 : selectedGroupId !== null);

  if (!open) return null;

  return (
    <ModalSheet open={open} onClose={handleClose}>
      <h2 className="text-xl font-bold text-on-surface">Importar datos</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Selecciona un CSV exportado desde la app móvil para importar integrantes y asistencias.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-4">
        <Button
          title={fileName ? "Cambiar archivo" : "Seleccionar archivo CSV"}
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full"
        />
      </div>

      {fileName ? (
        <p className="mt-2 truncate text-sm text-on-surface-variant">{fileName}</p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}

      {preview ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ImportCsvPreviewStat label="Integrantes" value={preview.members.length} />
            <ImportCsvPreviewStat label="Sesiones" value={preview.sessionDates.length} />
            <ImportCsvPreviewStat label="Registros" value={preview.attendanceCount} />
          </div>

          <p className="mt-4 text-xs font-semibold tracking-wide text-on-surface uppercase">
            Destino
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DESTINATION_OPTIONS.map((option) => {
              if (option.mode === "existing" && groups.length === 0) return null;

              return (
                <ImportDestinationOption
                  key={option.mode}
                  label={option.label}
                  selected={destinationMode === option.mode}
                  onSelect={() => {
                    setDestinationMode(option.mode);
                    setError(null);
                  }}
                />
              );
            })}
          </div>

          {destinationMode === "new" ? (
            <div className="mt-4">
              <Input
                label="Nombre del grupo"
                placeholder="Nombre del grupo"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                disabled={importing}
              />
            </div>
          ) : (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface uppercase">
                Grupo existente
              </label>
              <select
                value={selectedGroupId ?? ""}
                onChange={(event) => setSelectedGroupId(Number(event.target.value))}
                disabled={importing}
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-6 py-4 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button title="Cancelar" variant="ghost" onClick={handleClose} disabled={importing} />
        <Button
          title={importing ? "Importando..." : "Importar"}
          onClick={handleImport}
          disabled={!canImport}
        />
      </div>
    </ModalSheet>
  );
}
