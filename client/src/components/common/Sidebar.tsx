import { bottomTabs, Constant, defaultBottomTabs } from "@/lib/constant";
import { Link } from "wouter";
import dummyProfile from "@/lib/images/dummy-Profile.webp";
import { useEffect, useState } from "react";

type SidebarProps = {
  location: string;
  collapsed: boolean;
  onClose?: () => void;
  user?: any;
  roleName?: string;
  previewUrl?: string | null;
};

export default function Sidebar({
  location,
  collapsed,
  onClose,
  user,
  roleName,
  previewUrl,
}: SidebarProps) {
  const [isDefaultView, setIsDefaultView] = useState(false);

  useEffect(() => {
    const nonDefaultViewers = ["admin", "super-admin", "store-manager"];
    setIsDefaultView(!nonDefaultViewers.includes(user?.role));
  }, [user]);

  const tabs = isDefaultView ? defaultBottomTabs : bottomTabs;

  return (
    <aside className="h-full flex flex-col bg-card border-r border-border">

      {/* ===== PROFILE (MOBILE + EXPANDED ONLY) ===== */}
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
                className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white
                ${user?.is_active ? "bg-green-500" : "bg-red-500"}`}
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
      <nav className="flex-1 px-2 py-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            location.startsWith(tab.path) ||
            (tab.path !== "/" && location.startsWith(tab.path));
            console.log(tab,'sdfghgfdsad');
            
          if (tab.id !== 'master' && !location.startsWith('/master')) {
            localStorage.removeItem('master_active_tab');
          }
          return (
            <Link key={tab.path} href={tab.path}>
              <div className="relative group">
                <button
                  onClick={onClose}
                  className={`
                    relative w-full flex items-center gap-3
                    px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }
                  `}
                >
                  {/* ACTIVE INDICATOR */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary" />
                  )}

                  {/* ICON CONTAINER */}
                  <span
                    className={`
                      flex items-center justify-center
                      w-6 h-6 rounded-md
                      transition
                      ${active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 group-hover:bg-muted"
                      }
                    `}
                  >
                    <Icon size={18} />
                  </span>

                  {/* LABEL */}
                  {!collapsed && (
                    <span className="truncate">{tab.label}</span>
                  )}
                </button>

                {/* TOOLTIP (COLLAPSED) */}
                {collapsed && (
                  <span
                    className="
                      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                      rounded-md bg-gray-900 text-white text-xs
                      px-2 py-1 opacity-0 group-hover:opacity-100 
                      transition whitespace-nowrap z-50
                    "
                  >
                    {tab.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
