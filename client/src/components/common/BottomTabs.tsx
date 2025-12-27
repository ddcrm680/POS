import { bottomTabs } from "@/lib/constant";
import { Link } from "wouter";

type BottomTabsProps = {
  location: string;
  variant?: "top" | "bottom";
};

export const BottomTabs = ({
  location,
  variant = "bottom",
}: BottomTabsProps) => {
  const isTop = variant === "top";

  return (
    <div
      className={
        isTop
          ? "flex items-center gap-6 "
          : "flex items-center justify-around w-full gap-2"
      }
    >
      {bottomTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location === tab.path ||
          (tab.path !== "/" && location.startsWith(tab.path));
        const handleClick = () => {
          if (tab.path === "/master") {
            localStorage.removeItem('master_active_tab');
          }
        };
        return (
          <Link key={tab.path} href={tab.path}>
            <button
              onClick={handleClick}
             className={`
  relative transition-all duration-200
  pos-touch-target flex flex-col items-center justify-center gap-1
  rounded-lg px-3 py-2 min-w-[60px]

  hover:bg-muted
  hover:shadow-sm
  hover:-translate-y-[1px]

  ${isActive
    ? "pos-tab-active"
    : "pos-tab-inactive"}
`}

            >
              <div className="relative">
                <Icon
                  size={isTop ? 18 : 20}
                  className={isActive ? "" : "opacity-80"}
                />

                {tab.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
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
