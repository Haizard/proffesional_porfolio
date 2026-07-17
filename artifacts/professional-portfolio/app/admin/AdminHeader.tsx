"use client";

import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const section = pathname.replace("/admin", "").replace("/", "") || "OVERVIEW";
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur sticky top-0 z-10 flex items-center px-8">
      <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
        {section}
      </div>
    </header>
  );
}
