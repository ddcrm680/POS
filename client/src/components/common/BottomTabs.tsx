import { useAuth } from "@/lib/auth";
import { bottomTabs, defaultBottomTabs } from "@/lib/constant";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type BottomTabsProps = {
  location: string;
  variant?: "top" | "bottom";
};

export const BottomTabs = ({
  location,
  variant = "bottom",
}: BottomTabsProps) => {
  const [isDefaultView, setIsDefaultView] = useState(false);
  const { user } = useAuth();

  const isTop = variant === "top";

  useEffect(() => {
    const nonDefaultViewers = ["admin", "super-admin", "store-manager"];
    setIsDefaultView(!nonDefaultViewers.includes(user?.role));
  }, [user]);

  const tabs = isDefaultView ? defaultBottomTabs : bottomTabs;

  return (
    <div
      className={
        isTop
          ? "flex items-center gap-4"
          : "flex items-center justify-around w-full gap-1 px-2"
      }
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location === tab.path ||
          (tab.path !== "/" && location.startsWith(tab.path));

        const handleClick = () => {
          if (tab.path === "/master") {
            localStorage.removeItem("master_active_tab");
          }
        };

        return (
          <Link key={tab.path} href={tab.path}>
            <button
              onClick={handleClick}
              data-state={isActive ? "active" : "inactive"}
              className={`
                group relative flex flex-col items-center justify-center
                min-w-[64px] px-3 py-2 rounded-xl
                transition-all duration-200
                text-muted-foreground

                hover:bg-muted/70 
                active:translate-y-0
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }
                data-[state=active]:text-primary
              `}
            >
             

              {/* ICON */}
              <div
                className={`
                  relative flex items-center justify-center
                  w-9 h-9 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/40 group-hover:bg-muted"
                  }
                `}
              >
                <Icon size={isTop ? 18 : 20} />

                {/* BADGE */}
                {tab.badge && (
                  <span
                    className="
                      absolute -top-1.5 -right-1.5
                      min-w-[16px] h-4 px-1
                      rounded-full
                      flex items-center justify-center
                      text-[10px] font-semibold 
                      bg-primary text-white
                    "
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* LABEL */}
              <span
                className={`
                  mt-1 leading-none text-xs
                  
                    ${isTop ? "" : "font-medium"}
                `}
              >
                {tab.label}
              </span>
            </button>
          </Link>
        );
      })}
    </div>
  );
};