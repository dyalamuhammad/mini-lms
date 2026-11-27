"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const field =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600";
const btn =
  "rounded-lg bg-blue-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-60";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMsg("");
    setNameErr("");
    setSavingName(true);
    try {
      const r = await api.put("/profile", { name });
      setUser(r.data.data);
      setNameMsg("Nama berhasil diperbarui.");
    } catch (err: any) {
      setNameErr(err.response?.data?.errors?.name?.[0] ?? "Gagal menyimpan.");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    setSavingPw(true);
    try {
      await api.put("/password", pw);
      setPwMsg("Password berhasil diubah.");
      setPw({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      setPwErr(
        errors
          ? (Object.values(errors)[0] as string[])[0]
          : "Gagal mengubah password.",
      );
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Profil Saya</h1>

      <form
        onSubmit={saveName}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-blue-950">Informasi Akun</h2>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            value={user?.email ?? ""}
            disabled
            className={`${field} opacity-60`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Nama
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>

        {nameErr && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {nameErr}
          </p>
        )}
        {nameMsg && <p className="text-sm text-green-700">{nameMsg}</p>}

        <button disabled={savingName} className={btn}>
          {savingName ? "Menyimpan..." : "Simpan nama"}
        </button>
      </form>

      <form
        onSubmit={savePassword}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-blue-950">Ganti Password</h2>

        <div className="space-y-1">
          <label htmlFor="cur" className="text-sm font-medium text-slate-700">
            Password saat ini
          </label>
          <input
            id="cur"
            type="password"
            value={pw.current_password}
            onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
            className={field}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="new" className="text-sm font-medium text-slate-700">
            Password baru (min. 8 karakter)
          </label>
          <input
            id="new"
            type="password"
            value={pw.password}
            onChange={(e) => setPw({ ...pw, password: e.target.value })}
            className={field}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="conf" className="text-sm font-medium text-slate-700">
            Ulangi password baru
          </label>
          <input
            id="conf"
            type="password"
            value={pw.password_confirmation}
            onChange={(e) =>
              setPw({ ...pw, password_confirmation: e.target.value })
            }
            className={field}
          />
        </div>

        {pwErr && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {pwErr}
          </p>
        )}
        {pwMsg && <p className="text-sm text-green-700">{pwMsg}</p>}

        <button disabled={savingPw} className={btn}>
          {savingPw ? "Menyimpan..." : "Ganti password"}
        </button>
      </form>
    </div>
  );
}
