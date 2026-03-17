import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, Ticket, BarChart3, Lightbulb, TrendingUp, Plus, Settings, Activity, ListChecks, Copy, Trophy, ChevronDown, Check, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { NewTicketForm } from './NewTicketForm';
import { DevApiPanel } from './DevApiPanel';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const { currentUser, users, departments, reads, actions } = useAppStore('currentUser', 'users', 'departments');

  const canViewSettings = reads.hasPermission('view_settings');
  const canViewOperations = reads.hasPermission('view_operations');
  const canViewReports = reads.hasPermission('view_reports');
  const canCreateTickets = reads.hasPermission('create_tickets');

  // Redirect away from restricted pages when user lacks permission
  useEffect(() => {
    if (!canViewSettings && location.pathname === '/settings') {
      navigate('/');
      toast.error('You do not have permission to access Settings');
    }
    if (!canViewOperations && (location.pathname === '/operations' || location.pathname === '/queue')) {
      navigate('/');
      toast.error('You do not have permission to access this page');
    }
    if (!canViewReports && (location.pathname === '/reports' || location.pathname === '/insights')) {
      navigate('/');
      toast.error('You do not have permission to access this page');
    }
  }, [currentUser, location.pathname, canViewSettings, canViewOperations, canViewReports, navigate]);

  // Navigation grouped by sections
  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null },
    { name: 'Tickets', href: '/tickets', icon: Ticket, permission: null },
  ];

  const opsNavigation = [
    { name: 'Operations', href: '/operations', icon: Activity, badge: 'New' as const, permission: 'view_operations' as const },
    { name: 'Smart Queue', href: '/queue', icon: ListChecks, badge: 'New' as const, permission: 'view_operations' as const },
    { name: 'Duplicates', href: '/duplicates', icon: Copy, permission: null },
    { name: 'Performance', href: '/performance', icon: Trophy, permission: null },
  ];

  const analyticsNavigation = [
    { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'view_reports' as const },
    { name: 'Insights', href: '/insights', icon: TrendingUp, permission: 'view_reports' as const },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: Lightbulb, permission: null },
  ];

  const systemNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'view_settings' as const },
  ];

  const filterNav = (items: typeof mainNavigation) =>
    items.filter(item => !item.permission || reads.hasPermission(item.permission as any));

  const filteredMain = filterNav(mainNavigation);
  const filteredOps = filterNav(opsNavigation);
  const filteredAnalytics = filterNav(analyticsNavigation);
  const filteredSystem = filterNav(systemNavigation);

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSwitchUser = async (userId: string) => {
    await actions.switchUser(userId);
    const user = reads.getUserById(userId);
    toast.success(`Switched to ${user?.name}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-brand-error-light text-brand-error border-brand-error-mid';
      case 'manager': return 'bg-brand-primary-light text-brand-primary border-brand-secondary';
      case 'agent': return 'bg-secondary text-muted-foreground border-transparent';
      case 'viewer': return 'bg-brand-warning-light text-brand-warning border-brand-warning-mid';
      default: return 'bg-secondary text-muted-foreground border-transparent';
    }
  };

  const getStatusDot = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-brand-success';
      case 'busy': return 'bg-brand-warning';
      default: return 'bg-muted-foreground/50';
    }
  };

  const renderNavItem = (item: { name: string; href: string; icon: any; badge?: string; permission: string | null }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
          active
            ? 'bg-brand-primary-light text-brand-primary font-medium'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-brand-primary' : 'text-muted-foreground'}`} />
        <span>{item.name}</span>
        {item.badge && (
          <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">{item.badge}</Badge>
        )}
      </Link>
    );
  };

  const renderSectionLabel = (label: string) => (
    <div className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider font-medium">
      {label}
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-white h-screen flex flex-col border-r border-border">
        {/* Brand Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl text-brand-main font-semibold">HelpDesk Pro</h1>
          {currentUser && (
            <div className="mt-1.5">
              <p className="text-sm text-muted-foreground">{currentUser.name}</p>
              <Badge className={`text-xs mt-1 ${getRoleColor(currentUser.role)}`}>
                {currentUser.role}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {renderSectionLabel('Main')}
          {filteredMain.map(renderNavItem)}

          {filteredOps.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              {renderSectionLabel('Operations')}
              {filteredOps.map(renderNavItem)}
            </>
          )}

          {filteredAnalytics.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              {renderSectionLabel('Analytics')}
              {filteredAnalytics.map(renderNavItem)}
            </>
          )}

          {filteredSystem.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              {filteredSystem.map(renderNavItem)}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 space-y-3 border-t border-border">
          {/* Current User Switcher */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDot(currentUser.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {reads.getDepartmentName(currentUser.department)}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Switch User (Demo)</div>
                <DropdownMenuSeparator />
                {users.map(user => {
                  const dept = reads.getDepartmentById(user.department);
                  return (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => handleSwitchUser(user.id)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium flex-shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role} · {dept?.name}</p>
                      </div>
                      {user.id === currentUser.id && (
                        <Check className="w-4 h-4 text-brand-primary flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Role restriction banner for viewers */}
          {currentUser?.role === 'viewer' && (
            <div className="flex items-center gap-2 p-2 bg-brand-warning-light border border-brand-warning-mid rounded-lg">
              <ShieldAlert className="w-4 h-4 text-brand-warning flex-shrink-0" />
              <span className="text-xs text-brand-warning">Read-only access</span>
            </div>
          )}

          {canCreateTickets && (
            <Button
              onClick={() => setIsNewTicketOpen(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <NewTicketForm onSuccess={() => setIsNewTicketOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dev API Panel */}
      <DevApiPanel />
    </div>
  );
}
