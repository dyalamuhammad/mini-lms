"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const menus = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Course Catalog" },
  { href: "/my-courses", label: "My Courses" },
  { href: "/assignments", label: "Assignments" },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items =
    user?.role === "admin"
      ? [...menus, { href: "/admin", label: "Admin Panel" }]
      : menus;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-blue-950 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 text-xl font-bold">LearnPath</div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((m) => {
            const active = pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                onClick={onClose}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-blue-800" : "text-blue-100 hover:bg-blue-900"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-blue-900 p-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-blue-300">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 text-sm text-blue-200 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
