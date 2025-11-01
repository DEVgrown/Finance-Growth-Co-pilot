import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
// Direct URLs used - no need for createPageUrl
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  TrendingUp,
  Users,
  CreditCard,
  Lightbulb,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Building2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

// Navigation organized by category
const navigationItems = [
  // Main/Overview
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    category: "main"
  },
  {
    title: "AI Voice Assistant",
    url: "/voice-assistant",
    icon: Sparkles,
    color: "text-purple-600",
    badge: "KAVI",
    category: "ai",
    highlight: true
  },
  
  // Financial Management
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowLeftRight,
    color: "text-green-600",
    category: "financial"
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: Receipt,
    color: "text-purple-600",
    category: "financial"
  },
  {
    title: "Cash Flow",
    url: "/cash-flow",
    icon: TrendingUp,
    color: "text-teal-600",
    category: "financial"
  },
  {
    title: "Credit",
    url: "/credit",
    icon: CreditCard,
    color: "text-indigo-600",
    category: "financial"
  },
  
  // People & Relationships
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Users,
    color: "text-orange-600",
    category: "people"
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
    color: "text-blue-500",
    category: "people"
  },
  {
    title: "Customer Portal",
    url: "/customer-portal",
    icon: Building2,
    color: "text-blue-500",
    category: "people"
  },
  
  // Insights & Alerts
  {
    title: "AI Insights",
    url: "/insights",
    icon: Lightbulb,
    color: "text-yellow-600",
    category: "insights"
  },
  {
    title: "Proactive Alerts",
    url: "/proactive-alerts",
    icon: AlertCircle,
    color: "text-orange-600",
    category: "insights"
  },
  
  // Settings
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "text-gray-600",
    category: "settings"
  }
];

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Load user only once on mount - don't poll repeatedly
  React.useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (mounted && userData) {
          setUser(userData);
        }
      } catch (error) {
        // Silently handle - user not authenticated is OK
        // App can work in demo mode
        if (mounted) {
          setUser({ full_name: 'Demo User', email: 'demo@example.com' });
        }
      }
    };
    
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  const { data: insights = [] } = useQuery({
    queryKey: ['unread-insights'],
    queryFn: async () => {
      const allInsights = await base44.entities.AIInsight.list();
      return allInsights.filter(i => !i.is_read);
    },
    enabled: !!user
  });

  const { data: activeAlerts = [] } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const alerts = await base44.entities.ProactiveAlert.list();
      return alerts.filter(a => a.status === 'active');
    },
    enabled: !!user
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">FinanceGrowth</h2>
                <p className="text-xs text-gray-500">SME Co-Pilot</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            {/* Main Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Main
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "main")
                    .map((item) => {
                      const isActive = location.pathname === item.url || (item.url === "/dashboard" && location.pathname === "/");
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-green-50 to-teal-50 shadow-sm' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* AI Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                AI Assistant
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "ai")
                    .map((item) => {
                      const isActive = location.pathname === item.url;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm border border-purple-200' : ''}
                              ${item.highlight ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-purple-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Financial Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Financial
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "financial")
                    .map((item) => {
                      const isActive = location.pathname === item.url;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-green-50 to-teal-50 shadow-sm' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* People Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                People
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "people")
                    .map((item) => {
                      const isActive = location.pathname === item.url;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-green-50 to-teal-50 shadow-sm' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Insights Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Insights
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "insights")
                    .map((item) => {
                      const isActive = location.pathname === item.url;
                      const Icon = item.icon;
                      let badgeCount = 0;
                      if (item.title === "AI Insights") badgeCount = insights.length;
                      if (item.title === "Proactive Alerts") badgeCount = activeAlerts.filter(a => a.priority === 'critical').length;
                      
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-green-50 to-teal-50 shadow-sm' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {badgeCount > 0 && (
                                <Badge className="ml-auto bg-red-500 text-white text-xs">
                                  {badgeCount}
                                </Badge>
                              )}
                              {isActive && badgeCount === 0 && <ChevronRight className="w-4 h-4 ml-auto text-green-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Settings Section */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems
                    .filter(item => item.category === "settings")
                    .map((item) => {
                      const isActive = location.pathname === item.url;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive ? 'bg-gradient-to-r from-green-50 to-teal-50 shadow-sm' : ''}
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {item.title}
                              </span>
                              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-600" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-gray-900">FinanceGrowth</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}


