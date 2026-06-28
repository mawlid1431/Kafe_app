import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_SECTIONS, type AdminNavItem } from '@/admin/adminNav';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 76;

function SidebarNavLink({ item, collapsed }: { item: AdminNavItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/'}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center rounded-xl py-2.5 text-sm font-medium',
            'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3',
            isActive
              ? 'bg-primary/12 text-coffee-dark shadow-[inset_0_0_0_1px_rgba(96,128,112,0.22)]'
              : 'text-coffee-title hover:bg-primary/8 hover:text-primary-dark',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={cn(
                'absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200',
                isActive ? 'bg-primary opacity-100' : 'bg-primary/0 opacity-0 group-hover:bg-primary/50 group-hover:opacity-100',
                collapsed && 'left-0.5 h-5 w-0.5',
              )}
              aria-hidden
            />
            <span
              className={cn(
                'relative z-[1] inline-flex shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-coffee-title group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span
              className={cn(
                'relative z-[1] truncate transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100',
              )}
            >
              {item.label}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <aside
      style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      className={cn(
        'relative flex h-dvh shrink-0 flex-col overflow-hidden',
        'border-r border-outline-variant/50 bg-surface/95 shadow-[4px_0_24px_rgba(77,99,89,0.06)]',
        'backdrop-blur-md transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-outline-variant/40 py-4',
          collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4',
        )}
      >
        <div className={cn('flex min-w-0 items-center gap-3', collapsed && 'justify-center')}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-outline-variant/50 bg-white shadow-soft transition-transform duration-200 hover:scale-105">
            <span className="text-sm font-bold text-primary">KE</span>
          </div>
          <div
            className={cn(
              'overflow-hidden leading-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100',
            )}
          >
            <p className="truncate text-sm font-semibold text-coffee-dark">{BRAND_NAME}</p>
            <p className="truncate text-[11px] text-muted">{BRAND_TAGLINE}</p>
          </div>
        </div>
        {!collapsed && (
          <button type="button" onClick={onToggleCollapsed} className="admin-btn-ghost h-9 w-9 p-0" aria-label="Collapse sidebar">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-outline-variant/40 px-2 pb-3">
          <button type="button" onClick={onToggleCollapsed} className="admin-btn-ghost h-9 w-9 p-0" aria-label="Expand sidebar">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div
            key={section.title ?? 'main'}
            className={cn(section.title && 'mt-4 border-t border-outline-variant/30 pt-4 first:mt-0 first:border-0 first:pt-0')}
          >
            {section.title && !collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{section.title}</p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavLink key={item.to} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-outline-variant/40 p-3">
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-outline-variant/45 bg-white/80 p-3 transition-all duration-300',
            collapsed ? 'px-2 py-2.5 text-center' : '',
          )}
        >
          {collapsed ? (
            <p className="text-sm font-semibold text-primary" title="Sage Admin">◆</p>
          ) : (
            <>
              <p className="text-xs font-semibold text-coffee-dark">Kafe Eman Admin</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">Manage your mobile app, orders & users in one place.</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
