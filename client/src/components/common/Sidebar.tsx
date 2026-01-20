import { useLocation } from "wouter";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import dummyProfile from "@/lib/images/dummy-Profile.webp";
import { SidebarProps } from "@/lib/types";
import { bottomTabs, Constant, defaultBottomTabs, nonAdminTabs } from "@/lib/constant";
import { getActiveChild, isChildActive, isParentActive } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function Sidebar({
  collapsed,
  onClose,
  roleName,
  setIsUserLogoutModalOpenInfo,
  previewUrl,
}: SidebarProps) {
  const { user, roles } = useAuth();

  const sidebarContext = localStorage.getItem("sidebar_active_parent");
  const [location, navigate] = useLocation();
  const [openParent, setOpenParent] = useState<string | null>(null);

  const [roleView, setRoleView] = useState({
    store: false,
    admin: false,
    default: false,
  });

  useEffect(() => {
    const supreme = ["admin", "super-admin"];
    const manager = ["store-manager"];

    setRoleView({
      store: manager.includes(user?.role as string),
      admin: supreme.includes(user?.role as string),
      default: !manager.includes(user?.role as string) &&
        !supreme.includes(user?.role as string),
    });
  }, [user, roles]);

  useEffect(() => {
    const active = bottomTabs.find((tab) =>
      isParentActive(tab, location, sidebarContext)
    );
    setOpenParent(active?.id ?? null);
  }, [location]);

  const filterTab = roleView.store
    ? nonAdminTabs : roleView.admin ?
      bottomTabs : defaultBottomTabs;
  console.log(filterTab, 'filterTab');

  return (
    <aside className="h-full bg-card border-r flex flex-col justify-between">
      {/* ===== PROFILE (MOBILE ONLY) ===== */}
      {!collapsed && (
        <div className="px-4 py-5 border-b border-border lg:hidden">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border">
                <img
                  src={
                    previewUrl
                      ? `${Constant.REACT_APP_BASE_URL}/${previewUrl}`
                      : dummyProfile
                  }
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user?.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
              />
            </div>

            <div>
              <p className="text-sm font-semibold leading-tight">
                {user?.name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {roleName ?? "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAV ===== */}
      <nav className="px-2 py-2 space-y-1">
        {filterTab.map((tab) => {
          const Icon = tab.icon;
          const parentActive = isParentActive(tab, location, sidebarContext);
          const expanded = openParent === tab.id;

          return (
            <div key={tab.id}>
              {/* ===== PARENT ===== */}
              <button
                onClick={() => {
                  localStorage.setItem("sidebar_active_parent", tab.id);
                  if (tab.path === "/master") {
                    localStorage.removeItem("master_active_tab");
                  }
                  if (tab.children) {
                    setOpenParent(expanded ? null : tab.id);

                    const activeChild = getActiveChild(
                      tab,
                      location,
                      tab.id,
                      sidebarContext
                    );

                    const target =
                      activeChild?.path ||
                      tab.children.find(
                        (c) => c.id === tab.defaultChildId
                      )?.path;

                    if (target) navigate(target);
                  } else {
                    navigate(tab.path);
                    onClose?.();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition
                  ${parentActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-slate-100"
                  }
                `}
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-md bg-muted/40">
                  <Icon size={18} />
                </span>

                {!collapsed && <span>{tab.label}</span>}

                {/* CHEVRON (NO BUTTON) */}
                {!collapsed && tab.children && (
                  <span className="ml-auto p-1 rounded hover:bg-slate-100">
                    <ChevronDown
                      size={16}
                      className={`transition ${expanded ? "rotate-180" : ""
                        }`}
                    />
                  </span>
                )}
              </button>

              {/* ===== CHILDREN ===== */}
              {!collapsed && tab.children && expanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {tab.children.map((child) => {
                    const childActive = isChildActive(
                      child.path,
                      location,
                      tab.id,
                      sidebarContext ?? ""
                    );

                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          navigate(child.path);
                          onClose?.();
                        }}
                        className={`
                          group w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                          transition
                          ${childActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:bg-slate-100"
                          }
                        `}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ===== LOGOUT ===== */}
      <div className="mt-auto px-2 py-2 border-t border-border">
        <button
          onClick={() =>
            setIsUserLogoutModalOpenInfo({ info: {}, open: true })
          }
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-sm font-medium
            text-destructive
            hover:bg-destructive/10
            transition
          "
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
