"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Usuario } from "@/types/usuario";
import {
  fetchRoles,
  type RolOption,
  updateUsuario,
  fetchClienteByCedula,
  fetchEmpleadoByCedula,
} from "@/lib/api/usuarios";

type PersonaTipo = "CLIENTE" | "EMPLEADO" | "";

export default function UserEditDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: Usuario | null;
  onSaved?: (updated?: Usuario) => void;
}) {
  const [roles, setRoles] = useState<RolOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [roleId, setRoleId] = useState<number | "">("");
  const [status, setStatus] = useState<Usuario["EST_USU"]>("ACTIVO");
  const [tipoPersona, setTipoPersona] = useState<PersonaTipo>("");
  const [idPersona, setIdPersona] = useState<string>("");

  const [validating, setValidating] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const [personaNombre, setPersonaNombre] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    fetchRoles().then(setRoles).catch(() => setRoles([]));
  }, [open]);

  useEffect(() => {
    if (!user || !open) return;
    setRoleId(user.ID_ROL ?? "");
    setStatus(user.EST_USU ?? "ACTIVO");
    setTipoPersona((user.TIPO_PERSONA as PersonaTipo) || "");
    setIdPersona(user.ID_PERSONA || "");
    setExists(null);
    setPersonaNombre("");
  }, [user, open]);

  const canSave = useMemo(() => {
    const personaOk =
      !tipoPersona || (idPersona.trim().length > 0 && (exists === null || exists === true));
    return !saving && roleId !== "" && !!status && personaOk;
  }, [roleId, status, tipoPersona, idPersona, exists, saving]);

  async function validatePersona() {
    if (!tipoPersona || !idPersona.trim()) {
      setExists(null);
      setPersonaNombre("");
      return;
    }
    try {
      setValidating(true);
      if (tipoPersona === "CLIENTE") {
        const cli = await fetchClienteByCedula(idPersona.trim());
        const found = !!cli?.CED_CLI;
        setExists(found);
        setPersonaNombre(found ? [cli.NOM_CLI, cli.APE_CLI].filter(Boolean).join(" ") : "");
      } else {
        const emp = await fetchEmpleadoByCedula(idPersona.trim());
        const found = !!emp?.CED_EMP;
        setExists(found);
        setPersonaNombre(found ? [emp.NOM_EMP, emp.APE_EMP].filter(Boolean).join(" ") : "");
      }
    } catch {
      setExists(false);
      setPersonaNombre("");
    } finally {
      setValidating(false);
    }
  }

  async function onSubmit() {
    if (!user) return;
    setSaving(true);
    try {
      const patch: Partial<Usuario> = {
        ID_ROL: roleId === "" ? undefined : Number(roleId),
        EST_USU: status,
        TIPO_PERSONA: tipoPersona || null,
        ID_PERSONA: (tipoPersona ? idPersona.trim() : "") || null,
      };
      const updated = await updateUsuario(user.ID_USU, patch);
      onSaved?.(updated as Usuario);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const nombreUser = [user.NOM_USU, user.APE_USU].filter(Boolean).join(" ").trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Actualiza rol, estado y vínculo con Cliente o Empleado.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 border rounded p-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="text-gray-500">Usuario</div>
                <div className="font-medium">{user.USR_USU}</div>
              </div>
              <div>
                <div className="text-gray-500">Nombre</div>
                <div className="font-medium">{nombreUser || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{user.COR_USU || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Cedula</div>
                <div className="font-medium">{user.ID_PERSONA}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-40">
            <div className="grid gap-1">
              <label className="text-sm text-gray-700">Rol</label>
              <select
                className="border rounded px-2 py-2 text-sm"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.ID_ROL} value={r.ID_ROL}>
                    {r.DES_ROL ? ` ${r.DES_ROL}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-gray-700">Estado</label>
              <select
                className="border rounded px-2 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as Usuario["EST_USU"])}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="PEND_VER">Pendiente de revisión</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm text-gray-700">Tipo de usuario</label>
              <select
                className="border rounded px-2 py-2 text-sm"
                value={tipoPersona}
                onChange={(e) => {
                  setTipoPersona(e.target.value as PersonaTipo);
                  setExists(null);
                  setPersonaNombre("");
                }}
              >
                <option value="">Sin asignar</option>
                <option value="CLIENTE">Cliente</option>
                <option value="EMPLEADO">Empleado</option>
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-gray-700">{tipoPersona ? "Cédula" : "Cédula (selecciona tipo)"}</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: 0102030405"
                  value={idPersona}
                  onChange={(e) => {
                    setIdPersona(e.target.value);
                    setExists(null);
                    setPersonaNombre("");
                  }}
                  onBlur={validatePersona}
                  disabled={!tipoPersona}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={validatePersona}
                  disabled={!tipoPersona || !idPersona.trim() || validating}
                >
                  {validating ? "Validando..." : "Validar"}
                </Button>
              </div>
              {exists === true && (
                <div className="text-xs text-green-700">Existe: {personaNombre || "registro encontrado"}</div>
              )}
              {exists === false && (
                <div className="text-xs text-rose-700">
                  No se encontró en {tipoPersona === "CLIENTE" ? "Clientes" : "Empleados"}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!canSave} onClick={onSubmit}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}