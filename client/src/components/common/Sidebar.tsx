import { bottomTabs, Constant } from "@/lib/constant";
import { Link } from "wouter";
import Logo from "@/lib/images/dd-logo.webp"
import dummyProfile from '@/lib/images/dummy-Profile.webp'
type SidebarProps = {
    location: string;
    onClose?: () => void;
    previewUrl?: string
    user?: any;
    roleName?: string;
};

export const Sidebar = ({ roleName, location, user, onClose, previewUrl }: SidebarProps) => {
    console.log(previewUrl, 'previewUrl');

    return (
        <aside className="flex flex-col w-64 bg-card border-l lg:border-r border-border h-full  lg:hidden">
            {/* Sidebar Top (Mobile / Tablet) */}
            <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center  gap-3">
                    <div className="relative">

                        <div className=" w-10 h-10 rounded-full overflow-hidden border">
                            <img
                                src={previewUrl
                                    ? `${Constant.REACT_APP_BASE_URL}/${previewUrl}`
                                    : dummyProfile}
                                className="w-full h-full object-cover"
                                alt="User avatar"
                            />

                            {/* Online / Offline indicator */}

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
                        <p className="text-sm font-semibold text-foreground">
                            {user?.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {roleName ?? "—"}
                        </p>
                    </div>
                </div>


            </div>
            <nav className="flex flex-col gap-1 px-2 py-2">
                {bottomTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive =
                        location === tab.path ||
                        (tab.path !== "/" && location.startsWith(tab.path));

                    return (
                        <Link key={tab.path} href={tab.path}>
                            <button
                                onClick={onClose}
                                className={`
                  flex items-center gap-3 w-full px-3 py-2 rounded-md
                  transition-all text-sm font-medium
                  ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }
                `}
                            >
                                <Icon size={18} />
                                <span className="flex-1 text-left">{tab.label}</span>

                                {tab.badge && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
