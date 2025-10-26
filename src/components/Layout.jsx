import React from "react";
import { Outlet } from "react-router-dom";
import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarProvider 
} from "./ui/sidebar";
import Navigation from "./Navigation";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-background">
          <SidebarHeader className="border-b px-6 py-3 flex items-center h-14">
            <h2 className="text-lg font-semibold">Finance Growth</h2>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-auto py-4">
            <Navigation />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 pl-64">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}