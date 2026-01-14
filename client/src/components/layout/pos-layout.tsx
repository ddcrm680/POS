import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/lib/images/dd-logo.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dummyProfile from "@/lib/images/dummy-Profile.webp";
import { useAuth } from "@/lib/auth";
import { Constant, quickActions } from "@/lib/constant";
import { BottomTabs } from "../common/BottomTabs";
import Sidebar from "../common/Sidebar";
import CommonDeleteModal from "../common/CommonDeleteModal";
import NotificationDropdown from "../common/NotificationDropdown";

export default function POSLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, Logout, roles } = useAuth();
  const [isUserLogoutModalInfo, setIsUserLogoutModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const [userInfo, setUserInfo] = useState<any>();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [roleList, setRoleList] = useState<any>();
  useEffect(() => {
    setPreviewUrl((user as any)?.avatar || null);
  }, [user]);

  async function handleLogout() {
    await Logout();
    window.location.href = "/login";
  }
  useEffect(() => {
    setUserInfo(user || null);

  }, [user]);

  const [, navigate] = useLocation();

  const navigation = useLocation();
  const [roleView, setRoleView] = useState<{
    store: boolean,
    admin: boolean,
    default: boolean
  }>({
    store: false,
    admin: false,
    default: false
  });
  useEffect(() => {
    const supremeUserRoleList = ['admin', "super-admin"]
    const managerList = ['store-manager']
    const roleList = {
      store: false,
      admin: false,
      default: false
    }
    managerList.find((manager) => manager === user?.role) ? roleList.store = true :
      supremeUserRoleList.find((supremeUser) => supremeUser === user?.role) ? roleList.admin = true : roleList.default = true
    setRoleView(roleList)
  }, [user, roles])
  useEffect(() => {
    setRoleList(roles || [])
  }, [roles])
  const handleQuickAction = (actionId: string) => {
    // Handle quick actions

    switch (actionId) {
      case "new-job":
        window.location.href = "/job-cards/manage";
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
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ================= HEADER (FULL WIDTH) ================= */}
      <header className="h-[50px] bg-card border-b border-border shadow-sm flex items-center justify-between px-4 md:px-6 shrink-0">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>

          <img src={Logo} alt="Detailing Devils" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            className={`hidden lg:flex pos-touch-target
    gap-0
    relative
 ${roleView?.admin ? 'lg:block' : 'lg:hidden'}
    cursor-pointer
    hover:bg-transparent
    hover:text-inherit
    focus-visible:ring-0
    focus-visible:ring-offset-0
    active:bg-transparent`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="!h-5 !w-5" /> : <ChevronLeft className="!h-5 !w-5" />}
          </Button>
        </div>

        {/* CENTER */}
        {roleView.store && <div className="hidden lg:flex items-center gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className={`
      group flex items-center gap-1.5
      h-7 px-3 rounded-[8px]
      py-2
      text-xs font-medium text-white
      transition
      ${action.color}

      hover:brightness-110
      active:scale-[0.97]
    `}
            >
              <span className="text-[13px] leading-none">
                {action.emoji}
              </span>

              <span className="leading-none">
                {action.label}
              </span>
            </button>
          ))}

        </div>
        }

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          {/* <Button variant="ghost" size="icon" className="
    pos-touch-target
    gap-0
    relative

    cursor-pointer
    hover:bg-transparent
    hover:text-inherit
    focus-visible:ring-0
    focus-visible:ring-offset-0
    active:bg-transparent
  ">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="lg:pos-touch-target p-0 lg:py-2 h-6 lg:h-8 cursor-pointer
    hover:bg-transparent
    hover:text-inherit
    focus-visible:ring-0
    focus-visible:ring-offset-0
    active:bg-transparent    flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden border">
                  <img
                    src={
                      previewUrl
                        ? `${Constant.REACT_APP_BASE_URL}/${previewUrl}`
                        : dummyProfile
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="font-small  text-foreground text-sm leading-tight" data-testid="cashier-name">{userInfo?.name ?? "-"}</p>
                  <p className="text-muted-foreground text-xs leading-tight">{roleList && roleList.length > 0 ? roleList.find((role: { name: string, id: number, slug: string }) => role.slug === userInfo?.role)?.name : "-"}</p>
                </div>              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-profile" onClick={() => {
                
 localStorage.removeItem('sidebar_active_parent')
                navigation[1]('/profile'); }}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>

              {roleView.store && <DropdownMenuItem data-testid="menu-store-details" onClick={() => {
                localStorage.setItem("sidebar_active_parent", 'store-details');
                

                navigate(`/master/stores/manage?id=${user?.store_id}&mode=store-detail-view`)
              }} >
                <Store className="mr-2 h-4 w-4" />
                Store Details
              </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setIsUserLogoutModalOpenInfo({ info: {}, open: true }) }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ================= BODY (SIDEBAR + CONTENT ROW) ================= */}
      <div className={` flex-1 overflow-hidden ${roleView.admin ? "flex" : "flex flex-col"}`}>

        {/* MOBILE OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 lg:hidden
          ${mobileOpen ? "block" : "hidden"}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* SIDEBAR */}
        <aside
          className={`
    fixed lg:static z-50 h-full
    ${roleView?.admin ? 'lg:block' : 'lg:hidden'}
    top-0
    bg-card border-r border-border
    transition-all duration-300
    ${collapsed ? "w-16" : "w-60"}
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
        >
          <Sidebar
            location={location}
            setIsUserLogoutModalOpenInfo={setIsUserLogoutModalOpenInfo}
            collapsed={collapsed}
            onClose={() => setMobileOpen(false)}
            user={user}
            roleName={
              roleList?.find(
                (role: { slug: string }) => role.slug === userInfo?.role
              )?.name
            }
            previewUrl={previewUrl}
          />
        </aside>
        {(roleView.default) && (
          <div className="hidden  lg:flex items-center justify-center pos-bottom-nav border-b border-gray-300">
            <BottomTabs location={location} variant="top" />
          </div>
        )}
        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM TABS ================= */}
      {roleView.store && (
        <nav className="pos-bottom-nav bg-card border-t border-border shadow-lg flex-shrink-0 z-50 hidden lg:block">
          <div className="flex items-center px-2 pt-1">
            <BottomTabs location={location} variant="bottom" />
          </div>
        </nav>
      )}
      <CommonDeleteModal
        width="420px"
        maxWidth="420px"
        isOpen={isUserLogoutModalInfo.open}
        title="Logout"
        loadingText="Logging out..."
        description={`Are you sure you want to logout?`}
        confirmText="Yes"
        cancelText="Cancel"
        isLoading={isLoading}
        onCancel={() =>
          setIsUserLogoutModalOpenInfo({ open: false, info: {} })
        }
        onConfirm={handleLogout}
      />
    </div>
  );
}