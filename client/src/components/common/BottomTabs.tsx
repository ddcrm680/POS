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
  const [isDefaultView, setIsDefaultView] = useState<boolean>(false);

  const isTop = variant === "top";
  const { user,  } = useAuth();
  useEffect(() => {
    const nonDefaultViewers = ['admin', "super-admin", 'store-manager']
    setIsDefaultView(!nonDefaultViewers.includes((user?.role)))
  }, [user])
  const bottomTabList = isDefaultView ? defaultBottomTabs : bottomTabs
  return (
    <div
      className={
        isTop
          ? "flex items-center gap-6 "
          : "flex items-center justify-around w-full gap-2"
      }
    >
      {bottomTabList.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location === tab.path ||
          (tab.path !== "/" && location.startsWith(tab.path));
        console.log(isActive, location, tab.path, 'isActive');

        const handleClick = () => {
          if (tab.path === "/master") {
            localStorage.removeItem('master_active_tab');
          }
        };
        return (
          <Link key={tab.path} href={tab.path}>
            <button
              onClick={handleClick}
              data-state={isActive ? "active" : "inactive"}
              className="
    group
    relative
    transition-all duration-200
    pos-touch-target
    flex flex-col items-center justify-center gap-1
    rounded-lg px-3 py-2 min-w-[60px]

    text-muted-foreground

    hover:bg-muted
    hover:shadow-sm
    hover:-translate-y-[1px]

    data-[state=active]:bg-primary
    data-[state=active]:text-primary-foreground
    data-[state=active]:shadow
  "
            >


              <div className="relative">
                <Icon
                  size={isTop ? 18 : 20}
                  className={isActive ? "" : "opacity-80"}
                />

                {tab.badge && (
                  <span
                    className="
      absolute -top-2 -right-2
      mt-[2px]
      min-w-[16px] h-4 px-1
      rounded-full
      flex items-center justify-center
      text-[10px] font-semibold

      bg-primary border text-white
      transition-colors
border-primary
      group-data-[state=active]:bg-primary-foreground
      group-data-[state=active]:text-primary
    "
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`leading-none ${isTop ? "text-xs" : "text-xs font-medium"
                  }`}
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
