import React from "react";
import { NavLink } from "react-router-dom";
import { 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "./ui/sidebar";
import { 
  LayoutDashboard, 
  LineChart,
  Wallet,
  FileText,
  Bell,
  Users,
  Settings,
  PieChart 
} from "lucide-react";

const navigationItems = [
  {
    group: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/insights", icon: LineChart, label: "Insights" },
      { to: "/alerts", icon: Bell, label: "Alerts" }
    ]
  },
  {
    group: "Finance",
    items: [
      { to: "/transactions", icon: Wallet, label: "Transactions" },
      { to: "/invoices", icon: FileText, label: "Invoices" },
      { to: "/analytics", icon: PieChart, label: "Analytics" }
    ]
  },
  {
    group: "Management",
    items: [
      { to: "/clients", icon: Users, label: "Clients" },
      { to: "/settings", icon: Settings, label: "Settings" }
    ]
  }
];

export default function Navigation() {
  return (
    <nav className="space-y-6">
      {navigationItems.map((section) => (
        <SidebarGroup key={section.group}>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.group}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <NavLink 
                    to={item.to} 
                    className={({ isActive }) => `
                      flex items-center gap-3 w-full rounded-md px-4 py-2 
                      hover:bg-accent hover:text-accent-foreground
                      text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}