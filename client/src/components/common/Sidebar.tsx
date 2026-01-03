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
  const [isDefaultView, setIsDefaultView] = useState<boolean>(false);

  useEffect(() => {
    const nonDefaultViewers = ['admin', "super-admin", 'store-manager']
    setIsDefaultView(!nonDefaultViewers.includes((user?.role)))
  }, [user])
  const bottomTabList = isDefaultView ? defaultBottomTabs : bottomTabs
  return (
    <aside className="h-full flex flex-col bg-card">

      {/* ===== PROFILE (HIDDEN WHEN COLLAPSED) ===== */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-border lg:hidden">
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
                className={`
                  absolute top-0 right-0
                  w-3 h-3 rounded-full border-2 border-white
                  ${user?.is_active ? "bg-green-500" : "bg-red-500"}
                `}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">{user?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {roleName ?? "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAV ===== */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {bottomTabList.map((tab) => {
          const Icon = tab.icon;
          const active =
            location === tab.path ||
            (tab.path !== "/" && location.startsWith(tab.path));

          return (
            <Link key={tab.path} href={tab.path}>
              <div className="relative group">
                <button
                  onClick={onClose}
                  className={`
                    w-full flex items-center gap-3 rounded-md
                    px-3 py-2 text-sm font-medium transition
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"}
                  `}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{tab.label}</span>}
                </button>

                {/* TOOLTIP WHEN COLLAPSED */}
                {collapsed && (
                  <span
                    className="
                      pointer-events-none
                      absolute left-full top-1/2 -translate-y-1/2 ml-2
                      whitespace-nowrap rounded bg-gray-900 text-white
                      px-2 py-1 text-xs opacity-0
                      group-hover:opacity-100 transition
                      z-50
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