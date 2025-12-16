import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Bell,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
import { POSLayoutProps } from "@/schema";

export default function POSLayout({ children }: POSLayoutProps) {
  const [location] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
 const { user, isLoading,roles } = useAuth();
  const [userInfo, setUserInfo] = useState<any>();
    const [roleList, setRoleList] = useState<any>();
  useEffect(() => {
    setUserInfo(user || null);
 
  }, [, user, ]);
useEffect(()=>{
     setRoleList(roles || [])
},[roles])
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuickAction = (actionId: string) => {
    // Handle quick actions
    console.log("Quick action:", actionId);
    
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };
  const { Logout } = useAuth();
  const navigation = useLocation();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };
async function handleLogout(){
 await Logout();
  navigation[1]('/login');
console.log('Logged out and redirected to login page');
}
  useEffect(() => {
     setPreviewUrl((user as any)?.avatar || null);
  }, [user]);
  console.log(roleList,userInfo,'roleList ');
  
  return (
    <div className="flex flex-col bg-red h-screen text-foreground overflow-hidden">
      {/* POS Header - Enterprise Terminal Style */}
      <header className="pos-header bg-card border-b border-border shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-50">
        {/* Left: Business Info & Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DD</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" data-testid="business-name">
                Detailing Devils
              </p>
              <p className="text-muted-foreground text-sm leading-tight">Sector 18, Noida</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-10 bg-border" />
          
          {/* Digital Clock */}
          <div className="hidden md:flex flex-col">
            <div className="pos-digital-clock text-2xl font-bold text-foreground" data-testid="pos-time">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground" data-testid="pos-date">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Center: Quick Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
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

        {/* Right: Status & Profile */}
        <div className="flex items-center gap-3">
          {/* System Status */}
          <Badge variant="secondary" className={`${userInfo?.is_active?'bg-green-50 text-green-700 border-green-200':
            'bg-red-50 text-red-700 border-red-200'
          } hidden sm:flex`}>
            <div className={`w-2 h-2 ${userInfo?.is_active ? 'bg-green-500':'bg-red-500'} rounded-full mr-2`} />
              {userInfo?.is_active ?'Online' :'Offline'}  
       
          </Badge>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="pos-touch-target relative" data-testid="button-notifications">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pos-touch-target flex items-center gap-2" data-testid="user-menu-trigger">
                <div className="w-8 h-8 bg-gray border-[0.5px] border border-gray overflow-hidden rounded-full flex items-center justify-center">
                  <img
                     src={
                      previewUrl &&  previewUrl.startsWith("blob:")
                          ? previewUrl
                          : `${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${previewUrl}`
                      }  className={`w-full h-full object-cover ${previewUrl===dummyProfile?'scale-125':''}`}
                   
                  />
                  {/* <span className="text-primary-foreground font-medium text-sm">{userInfo?.name.split(' ').map((item:string)=>item.substr(0,1).toUpperCase()).join('')}</span> */}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-medium  text-foreground text-sm leading-tight" data-testid="cashier-name">{userInfo?.name ??"-"}</p>
                  <p className="text-muted-foreground text-xs leading-tight">{roleList && roleList.length >0 ? roleList.find((role:{name:string,id:number,slug:string})=>role.slug===userInfo?.role).name :"-"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem data-testid="menu-profile" onClick={()=>{  navigation[1]('/profile');}}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" data-testid="menu-logout" onClick={()=>{handleLogout()}}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area - Enterprise Scrollable Container */}
      <main className="pos-main-content bg-background flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Bottom Tab Navigation - Enterprise Terminal Fixed */}
      <nav className="pos-bottom-nav bg-card border-t border-border shadow-lg flex-shrink-0 z-50">
        <div className="flex items-center justify-around px-2 pt-2">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
            
            return (
              <Link key={tab.path} href={tab.path}>
                <button
                  className={`pos-touch-target flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 px-3 py-2 min-w-[60px] ${
                    isActive
                      ? "pos-tab-active"
                      : "pos-tab-inactive"
                  }`}
                  data-testid={`bottom-tab-${tab.label.toLowerCase()}`}
                >
                  <div className="relative">
                    <Icon size={20} className="mb-1" />
                    {tab.badge && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium leading-none">{tab.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}