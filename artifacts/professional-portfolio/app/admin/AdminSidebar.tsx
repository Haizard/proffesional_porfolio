"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  Server,
  FileText,
  Cpu,
  Package,
  MessageSquare,
  LogOut,
  FolderTree,
  Code2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Toaster } from "react-hot-toast";

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/services", icon: Server, label: "Services" },
  { href: "/admin/products", icon: Cpu, label: "Hardware" },
  { href: "/admin/projects", icon: Code2, label: "Projects" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
  { href: "/admin/blog", icon: FileText, label: "Intel (Blog)" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0a0f1c] flex flex-col fixed inset-y-0 z-10">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link
          href="/"
          className="font-mono font-bold flex items-center gap-2 text-primary"
        >
          <Terminal className="h-5 w-5" /> SYS_ADMIN
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-mono transition-colors ${
                active
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-sm text-sm font-mono text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> DISCONNECT
        </button>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0a0f1c",
            color: "#f8fafc",
            border: "1px solid #1e293b",
            borderRadius: "2px",
            fontFamily: "var(--font-geist-mono)",
          },
          success: { iconTheme: { primary: "#00f0ff", secondary: "#000000" } },
        }}
      />
    </aside>
  );
}
