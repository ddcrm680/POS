import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarProps } from "@/lib/types";
import { bottomTabs } from "@/lib/constant";
import { getActiveChild, isChildActive, isParentActive } from "@/lib/utils";


export default function Sidebar({
  collapsed,
  onClose,
}: SidebarProps) {
  const [location, navigate] = useLocation();
  const [openParent, setOpenParent] = useState<string | null>(null);

  useEffect(() => {
    const active = bottomTabs.find((tab) =>
      isParentActive(tab, location)
    );
    setOpenParent(active?.id ?? null);
  }, [location]);

  return (
    <aside className="h-full bg-card border-r">
      <nav className="px-2 py-2 space-y-1">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const parentActive = isParentActive(tab, location);
          const expanded = openParent === tab.id;

          return (
            <div key={tab.id}>
              {/* ===== PARENT ===== */}
              <button
                onClick={() => {
                  if (tab.children) {

                    setOpenParent(expanded ? null : tab.id);
                    const activeChild = getActiveChild(tab, location);
                    const target =
                      activeChild?.path ||
                      tab.children.find(c => c.id === tab.defaultChildId)?.path;

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
                    : "text-muted-foreground hover:bg-muted"}
  `}
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-md bg-muted/40">
                  <Icon size={18} />
                </span>

                {!collapsed && <span>{tab.label}</span>}

                {/* CHEVRON – TOGGLE ONLY */}
                {!collapsed && tab.children && (
                  <button

                    className="ml-auto p-1 rounded hover:bg-muted"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </button>

              {/* ===== CHILDREN ===== */}
              {!collapsed && tab.children && expanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {tab.children.map((child) => {
                    const childActive = isChildActive(child.path, location);

                    return (
                      <Link key={child.id} href={child.path}>
                        <button
                          onClick={() => {
                            onClose?.();
                          }}
                          className={`
                            group w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                            transition
                            ${childActive
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:bg-muted"}
                          `}
                        >
                          {/* DOT – matches label color automatically */}
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          <span>{child.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}