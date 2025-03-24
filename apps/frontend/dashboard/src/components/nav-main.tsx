import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';

export function NavMain({
  items,
}: Readonly<{
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}>) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <Link to={item.url} title={item.title} key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={location.pathname === item.url}
              >
                {item.icon && <item.icon />}
                {item.title}
              </SidebarMenuButton>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
