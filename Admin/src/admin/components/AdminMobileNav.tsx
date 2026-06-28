import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { ADMIN_NAV_SECTIONS } from '@/admin/adminNav';
import { BRAND_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

export function AdminMobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div className="absolute left-0 top-0 flex h-full w-[min(300px,85vw)] animate-scale-in flex-col border-r border-outline-variant/40 bg-surface shadow-modal">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-4 py-4">
          <div>
            <p className="font-semibold text-coffee-dark">{BRAND_NAME}</p>
            <p className="text-xs text-muted">Admin menu</p>
          </div>
          <button type="button" onClick={onClose} className="admin-btn-ghost h-10 w-10 p-0" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title ?? 'main'} className={cn(section.title && 'mt-4 border-t border-outline-variant/30 pt-4')}>
              {section.title && (
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{section.title}</p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                            isActive ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(96,128,112,0.2)]' : 'text-coffee-title hover:bg-primary/8',
                          )
                        }
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
