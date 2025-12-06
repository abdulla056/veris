"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Compliance Co-Pilot (MVP)
        </h1>
        <p className="text-sm text-gray-500">
          Malaysian Banking Sector AML Dashboard
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Sarah Ahmad</p>
            <p className="text-xs text-gray-500">Compliance Officer</p>
          </div>
          <Avatar>
            <AvatarImage src="/avatar.png" alt="Sarah Ahmad" />
            <AvatarFallback className="bg-blue-600 text-white">SA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

