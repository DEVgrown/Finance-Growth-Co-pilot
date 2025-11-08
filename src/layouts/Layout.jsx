import React from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  TrendingUp,
  Users,
  CreditCard,
  Lightbulb,
  Settings,
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
import BusinessSwitcher from "../components/BusinessSwitcher";

// Navigation organized by category - will be filtered based on role
const baseNavigationItems = [
  // Dashboard links based on role
  // Note: Super Admin uses separate AdminLayout, not this Layout
  {
    title: "Business Dashboard",
    url: (businessId) => `/business/${businessId}/dashboard`,
    icon: LayoutDashboard,
    color: "text-blue-600",
    category: "main",
    roles: ["business_admin"],
    dynamic: true
  },
  {
    title: "My Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    category: "main",
    roles: ["staff", "viewer"]
  },
  {
    title: "AI Voice Assistant",
    url: "/voice-assistant",
    icon: Sparkles,
    color: "text-blue-600",
    badge: "KAVI",
    category: "ai",
    highlight: true,
    roles: ["super_admin", "business_admin", "staff", "viewer"]
  },
  
  // Financial Management
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowLeftRight,
    color: "text-blue-600",
    category: "financial",
    roles: ["super_admin", "business_admin", "staff"]
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: Receipt,
    color: "text-blue-600",
    category: "financial",
    roles: ["super_admin", "business_admin", "staff"]
  },
  {
    title: "Cash Flow",
    url: "/cash-flow",
    icon: TrendingUp,
    color: "text-blue-600",
    category: "financial",
    roles: ["super_admin", "business_admin"]
  },
  {
    title: "Credit",
    url: "/credit",
    icon: CreditCard,
    color: "text-blue-600",
    category: "financial",
    roles: ["super_admin", "business_admin"]
  },
  
  // People & Relationships
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Users,
    color: "text-blue-600",
    category: "people",
    roles: ["super_admin", "business_admin", "staff"]
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
    color: "text-blue-600",
    category: "people",
    roles: ["super_admin", "business_admin", "staff"]
  },
  
  // Insights & Alerts
  {
    title: "AI Insights",
    url: "/insights",
    icon: Lightbulb,
    color: "text-blue-600",
    category: "insights",
    roles: ["super_admin", "business_admin"]
  },
  {
    title: "Proactive Alerts",
    url: "/proactive-alerts",
    icon: AlertCircle,
    color: "text-blue-600",
    category: "insights",
    roles: ["super_admin", "business_admin"]
  },
  
  // Settings
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "text-blue-600",
    category: "settings",
    roles: ["super_admin", "business_admin", "staff", "viewer"]
  }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, isSuperAdmin, isBusinessAdmin, activeBusinessId, setActiveBusiness, getBusinesses } = useAuth();

  console.log('⚪ Main Layout RENDERING - This should NOT show for /super-admin routes');

  // Filter navigation items based on user role
  const navigationItems = baseNavigationItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true; // No roles specified means accessible to all authenticated
    
    const userIsSuperAdmin = isSuperAdmin();
    const userIsBusinessAdmin = isBusinessAdmin(activeBusinessId);
    const userHasMemberships = user?.memberships?.length > 0;
    
    // Debug logging
    if (item.title === "Super Admin Dashboard") {
      console.log('🔍 Checking Super Admin Dashboard access:', {
        userIsSuperAdmin,
        userIsBusinessAdmin,
        userHasMemberships,
        itemRoles: item.roles,
        user: user
      });
    }
    
    // Super admins have access to all items that include "super_admin" in roles
    if (userIsSuperAdmin && item.roles.includes("super_admin")) {
      return true;
    }
    
    // Business admins have access to items that include "business_admin"
    if (userIsBusinessAdmin && item.roles.includes("business_admin")) {
      return true;
    }
    
    // Staff and viewer roles - check if user has any business membership
    if (userHasMemberships && (item.roles.includes("staff") || item.roles.includes("viewer"))) {
      return true;
    }
    
    return false;
  });

  const handleLogout = () => {
    logout(); // Use auth.logout()
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white relative" style={{ isolation: 'isolate' }}>
        <Sidebar className="border-r border-gray-200 bg-white relative z-50 flex-shrink-0" style={{ pointerEvents: 'auto', position: 'relative', isolation: 'isolate', overflowY: 'auto' }}>
          <SidebarHeader className="border-b border-gray-200 p-6" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">FinanceGrowth</h2>
                <p className="text-xs text-gray-500">SME Co-Pilot</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}>
            {/* Main Section */}
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Main
              </SidebarGroupLabel>
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "main")
                    .map((item) => {
                      // Handle dynamic URLs for business admin dashboard
                      let itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) ||
                        (itemUrl.includes("/super-admin") && location.pathname.includes("/super-admin")) ||
                        (itemUrl.includes("/business/") && location.pathname.includes("/business/"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to:', itemUrl);
                              navigate(itemUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                            `}
                            style={{ 
                              pointerEvents: 'auto', 
                              background: isActive ? 'linear-gradient(to right, #eff6ff, #dbeafe)' : 'transparent', 
                              border: isActive ? '1px solid #bfdbfe' : 'none', 
                              textAlign: 'left',
                              zIndex: 1000
                            }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* AI Section */}
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Assistant
              </SidebarGroupLabel>
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "ai")
                    .map((item) => {
                      const itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl.includes("/voice-assistant") && location.pathname.includes("/voice-assistant"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(itemUrl);
                            }}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                              ${item.highlight ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
                            `}
                            style={{ pointerEvents: 'auto', background: 'transparent', border: 'none', textAlign: 'left' }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Financial Section */}
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Financial
              </SidebarGroupLabel>
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "financial")
                    .map((item) => {
                      const itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl.includes("/transactions") && location.pathname.includes("/transactions")) ||
                        (itemUrl.includes("/invoices") && location.pathname.includes("/invoices")) ||
                        (itemUrl.includes("/cash-flow") && location.pathname.includes("/cash-flow")) ||
                        (itemUrl.includes("/credit") && location.pathname.includes("/credit"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to:', itemUrl);
                              navigate(itemUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                            `}
                            style={{ 
                              pointerEvents: 'auto', 
                              background: isActive ? 'linear-gradient(to right, #eff6ff, #dbeafe)' : 'transparent', 
                              border: isActive ? '1px solid #bfdbfe' : 'none', 
                              textAlign: 'left',
                              zIndex: 1000
                            }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* People Section */}
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                People
              </SidebarGroupLabel>
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "people")
                    .map((item) => {
                      const itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl.includes("/suppliers") && location.pathname.includes("/suppliers")) ||
                        (itemUrl.includes("/clients") && location.pathname.includes("/clients"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to:', itemUrl);
                              navigate(itemUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                            `}
                            style={{ 
                              pointerEvents: 'auto', 
                              background: isActive ? 'linear-gradient(to right, #eff6ff, #dbeafe)' : 'transparent', 
                              border: isActive ? '1px solid #bfdbfe' : 'none', 
                              textAlign: 'left',
                              zIndex: 1000
                            }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Insights Section */}
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Insights
              </SidebarGroupLabel>
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "insights")
                    .map((item) => {
                      const itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl.includes("/insights") && location.pathname.includes("/insights")) ||
                        (itemUrl.includes("/proactive-alerts") && location.pathname.includes("/proactive-alerts"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to:', itemUrl);
                              navigate(itemUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                            `}
                            style={{ 
                              pointerEvents: 'auto', 
                              background: isActive ? 'linear-gradient(to right, #eff6ff, #dbeafe)' : 'transparent', 
                              border: isActive ? '1px solid #bfdbfe' : 'none', 
                              textAlign: 'left',
                              zIndex: 1000
                            }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Settings Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupContent style={{ pointerEvents: 'auto' }}>
                <SidebarMenu style={{ pointerEvents: 'auto' }}>
                  {navigationItems
                    .filter(item => item.category === "settings")
                    .map((item) => {
                      const itemUrl = typeof item.url === 'function' 
                        ? (activeBusinessId ? item.url(activeBusinessId) : '/dashboard')
                        : item.url;
                      const isActive = location.pathname === itemUrl || 
                        (itemUrl.includes("/settings") && location.pathname.includes("/settings"));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to:', itemUrl);
                              navigate(itemUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                              transition-all duration-200 cursor-pointer
                              hover:bg-blue-50 hover:shadow-sm
                              ${isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-md border border-blue-200' : 'hover:border border-gray-200'}
                            `}
                            style={{ 
                              pointerEvents: 'auto', 
                              background: isActive ? 'linear-gradient(to right, #eff6ff, #dbeafe)' : 'transparent', 
                              border: isActive ? '1px solid #bfdbfe' : 'none', 
                              textAlign: 'left',
                              zIndex: 1000
                            }}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium flex-1 ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                          </button>
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
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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

        <main className="flex-1 flex flex-col overflow-hidden relative z-0" style={{ pointerEvents: 'auto', marginLeft: '0' }}>
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 justify-between relative z-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-gray-900">FinanceGrowth</h1>
            </div>
            {/* Business Switcher if user has multiple businesses */}
            {user && !isSuperAdmin() && getBusinesses().length > 1 && (
              <BusinessSwitcher 
                activeBusinessId={activeBusinessId} 
                setActiveBusiness={setActiveBusiness} 
              />
            )}
          </header>

          <div className="flex-1 overflow-auto p-6 bg-white relative z-0" style={{ pointerEvents: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}


