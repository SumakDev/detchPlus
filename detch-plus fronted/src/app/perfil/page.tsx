"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getProfile, updateProfile, changePassword, updateAvatar} from "@/lib/api/user-profile";
import type { MeProfile } from "@/types/meProfile";
import { getMe } from "@/lib/api/auth/me";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PerfilUsuarioPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [edit, setEdit] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  const [form, setForm] = useState({ USR_USU: "", COR_USU: "", NOM_USU: "", APE_USU: "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) { router.replace("/"); return; }
    getMe()
      .then(({ user }) => {
        if (!user) router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [router]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const { user } = await getProfile();
      setMe(user);
      setForm({
        USR_USU: user.USR_USU || "",
        COR_USU: user.COR_USU || "",
        NOM_USU: user.NOM_USU || "",
        APE_USU: user.APE_USU || "",
      });
    } catch (e: any) {
      setErr(e?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    const patch: any = {
      USR_USU: form.USR_USU.trim(),
      COR_USU: form.COR_USU.trim(),
      NOM_USU: form.NOM_USU.trim(),
      APE_USU: form.APE_USU.trim(),
    };
    const { user } = await updateProfile(patch);
    setMe(user);
    setEdit(false);
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { user } = await updateAvatar(file);
    setMe(user);
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (!pwd.current || !pwd.next) return;
    if (pwd.next !== pwd.confirm) {
      alert("Las contraseñas no coinciden");
      return;
    }
    await changePassword(pwd.current, pwd.next);
    setPwd({ current: "", next: "", confirm: "" });
    setPassOpen(false);
    alert("Contraseña actualizada");
  }

  return (
      <main className="mx-auto max-w-3xl p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>

        {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
        {err && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {err}</div>}

        {!loading && me && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border bg-gray-50">
                {me.AVA_USU ? (
                  <Image src={me.AVA_USU as any} alt="Avatar" width={80} height={80} className="h-20 w-20 object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Sin avatar</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <strong className="text-gray-900">{me.NOM_USU} {me.APE_USU}</strong>
                <label className="text-sm">
                  <span className="mr-2">Actualizar avatar</span>
                  <input type="file" accept="image/*" onChange={handleAvatar} />
                </label>
              </div>
            </div>

            {/* Datos */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Usuario</Label>
                  <Input
                    value={form.USR_USU}
                    onChange={(e) => setForm((f) => ({ ...f, USR_USU: e.target.value }))}
                    disabled={!edit}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.COR_USU}
                    onChange={(e) => setForm((f) => ({ ...f, COR_USU: e.target.value }))}
                    disabled={!edit}
                  />
                </div>
                <div>
                  <Label>Nombres</Label>
                  <Input
                    value={form.NOM_USU}
                    onChange={(e) => setForm((f) => ({ ...f, NOM_USU: e.target.value }))}
                    disabled={!edit}
                  />
                </div>
                <div>
                  <Label>Apellidos</Label>
                  <Input
                    value={form.APE_USU}
                    onChange={(e) => setForm((f) => ({ ...f, APE_USU: e.target.value }))}
                    disabled={!edit}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {!edit ? (
                  <>
                    <Button variant="outline" onClick={() => setPassOpen(true)}>Cambiar contraseña</Button>
                    <Button onClick={() => setEdit(true)}>Editar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setEdit(false); load(); }}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cambiar contraseña */}
        <Dialog open={passOpen} onOpenChange={setPassOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar contraseña</DialogTitle>
              <DialogDescription>Introduce tu contraseña actual y la nueva.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleChangePwd}>
              <div>
                <Label>Contraseña actual</Label>
                <Input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} required />
              </div>
              <div>
                <Label>Nueva contraseña</Label>
                <Input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} required />
              </div>
              <div>
                <Label>Confirmar nueva contraseña</Label>
                <Input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPassOpen(false)}>Cancelar</Button>
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
              <Link href="/">
              <Button className="bg-gray-900 hover:bg-gray-800">Inicio</Button>
            </Link>
      </main>
      
  );
}