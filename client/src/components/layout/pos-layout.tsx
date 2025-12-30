import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Logo from "@/lib/images/dd-logo.webp"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import dummyProfile from '@/lib/images/dummy-Profile.webp'
import { useAuth } from "@/lib/auth";
import { bottomTabs, Constant, quickActions, RoleList } from "@/lib/constant";
import { POSLayoutProps } from "@/lib/types";
import { BottomTabs } from "../common/BottomTabs";
import { Sidebar } from "../common/Sidebar";

export default function POSLayout({ children }: POSLayoutProps) {
  const [location] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isLoading, roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userInfo, setUserInfo] = useState<any>();
  const [roleList, setRoleList] = useState<any>();
  const [isDefaultView, setIsDefaultView] = useState<boolean>(false);
  useEffect(() => {
    setUserInfo(user || null);

  }, [, user,]);
  useEffect(() => {
    const supremeUserRoleList = ['admin', "super-admin"]
    const managerList = ['store-manager']
    const isDefault = managerList.find((manager) => manager === user?.role) ? false :
      supremeUserRoleList.find((supremeUser) => supremeUser === user?.role) ? true : true
    setIsDefaultView(isDefault)
  }, [user, roles])
  useEffect(() => {
    setRoleList(roles || [])
  }, [roles])
  // Update clock every second
  

  const handleQuickAction = (actionId: string) => {
    // Handle quick actions

    switch (actionId) {
      case "new-job":
        window.location.href = "/pos-job-creation";
        break;
      case "customer-lookup":
        window.location.href = "/customers";
        break;
      case "inventory-check":
        window.location.href = "/inventory";
        break;
      default:
        break;
    }
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      // if user exists and has avatar url (your API returns avatar path)
      return (user as any)?.avatar || null;
    } catch { return null; }
  });


  const { Logout } = useAuth();
  const navigation = useLocation();

  async function handleLogout() {
    await Logout();
    navigation[1]('/login');
  }
  useEffect(() => {
    setPreviewUrl((user as any)?.avatar || null);
  }, [user]);

  return (
    <div className="flex flex-col bg-red h-screen text-foreground overflow-hidden">
      {/* POS Header - Enterprise Terminal Style */}
      {/* Sidebar Toggle (Mobile / Tablet) */}


      <header className={`${isDefaultView ? 'h-[68px]' : 'pos-header'} bg-card border-b border-border shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30`}>
        {/* Left: Business Info & Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">

            <div className="w-50 h-10  flex items-center justify-center">
              <img
                src={Logo}
                alt="Captured"
                className="max-w-full max-h-full object-contain"
                data-testid="captured-photo"
              />

            </div>
          </div>

        </div>

        {/* Center: Quick Actions (Desktop) */}
        {!isDefaultView && <div className="hidden lg:flex items-center gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              className={`pos-quick-action flex flex-col gap-1 h-14 px-4 text-white ${action.color}`}
              onClick={() => handleQuickAction(action.id)}
              data-testid={`quick-action-${action.id}`}
            >
              <span className="text-lg">{action.emoji}</span>
              <span className="text-xs font-medium leading-none">{action.label}</span>
            </Button>
          ))}
        </div>
        }
        {/* Right: Status & Profile */}
        <div className="flex items-center gap-3">
          {/* System Status */}


          {/* Notifications */}
          <Button
  variant="ghost"
  size="icon"
  className="
    pos-touch-target
    gap-0
    relative

    cursor-pointer
    hover:bg-transparent
    hover:text-inherit
    focus-visible:ring-0
    focus-visible:ring-offset-0
    active:bg-transparent
  "
  data-testid="button-notifications"
>
  <Bell size={18} />
  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
    3
  </span>
</Button>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>

              <Button variant="ghost" className="lg:pos-touch-target p-0 lg:py-2 h-6 lg:h-8 cursor-pointer
    hover:bg-transparent
    hover:text-inherit
    focus-visible:ring-0
    focus-visible:ring-offset-0
    active:bg-transparent    flex items-center gap-2" data-testid="user-menu-trigger">
                <div className="relative">
                  <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gray border-[0.5px] border border-gray overflow-hidden rounded-full flex items-center justify-center">
                    <img
                      src={previewUrl
                        ? `${Constant.REACT_APP_BASE_URL}/${previewUrl}`
                        : dummyProfile} className={`w-full h-full object-cover ${previewUrl === dummyProfile ? 'scale-125' : ''}`}

                    />
                  </div>
                  <span
                    className={`
      absolute -top-[0.5px] -right-[0.5px]
      w-3 h-3 rounded-full border-2 border-white
      ${user?.is_active ? "bg-green-500" : "bg-red-500"}
    `}
                  />
                </div>


                <div className="hidden lg:block text-left">
                  <p className="font-medium  text-foreground text-sm leading-tight" data-testid="cashier-name">{userInfo?.name ?? "-"}</p>
                  <p className="text-muted-foreground text-xs leading-tight">{roleList && roleList.length > 0 ? roleList.find((role: { name: string, id: number, slug: string }) => role.slug === userInfo?.role)?.name : "-"}</p>
                </div>

              </Button>

            </DropdownMenuTrigger>
            <button
              className="block lg:hidden "
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem data-testid="menu-profile" onClick={() => { navigation[1]('/profile'); }}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" data-testid="menu-logout" onClick={() => { handleLogout() }}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {/* sidebar */}
      {(
        <>
          {/* Overlay for mobile/tablet */}
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden
      ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`
        fixed top-0 right-0 h-full w-64 bg-card z-50
        transform transition-transform duration-300
        lg:static lg:translate-x-0 lg:w-64  lg:hidden
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}
          >
            <Sidebar
              location={location}
              user={userInfo}
              previewUrl={previewUrl ?? ""}
              roleName={
                roleList?.find(
                  (role: { slug: string }) => role.slug === userInfo?.role
                )?.name
              }
              onClose={() => setSidebarOpen(false)}
            />

          </div>
        </>
      )}

      {isDefaultView && (
        <div className="hidden  lg:flex items-center justify-center pos-bottom-nav border-b border-gray-300">
          <BottomTabs location={location} variant="top" />
        </div>
      )}

      {/* Main Content Area - Enterprise Scrollable Container */}
      <main className="pos-main-content bg-background flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Bottom Tab Navigation - Enterprise Terminal Fixed */}
      {!isDefaultView && (
        <nav className="pos-bottom-nav bg-card border-t border-border shadow-lg flex-shrink-0 z-50">
          <div className="flex items-center px-2 pt-2">
            <BottomTabs location={location} variant="bottom" />
          </div>
        </nav>
      )}
    </div>
  );
}

