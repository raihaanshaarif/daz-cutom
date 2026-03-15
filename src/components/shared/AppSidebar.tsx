"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Users,
  ClipboardList,
  Globe,
  Command,
  ShoppingBag,
  Factory,
  Package,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavLeaf {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavParent {
  title: string;
  icon: React.ElementType;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavParent;

interface NavGroup {
  label: string;
  items: NavItem[];
}

function isNavParent(item: NavItem): item is NavParent {
  return "children" in item && Array.isArray((item as NavParent).children);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Contacts",
      items: [
        {
          title: "Contact",
          icon: Users,
          children: [
            {
              title: "Create Contact",
              url: "/dashboard/contact/create-contact",
              icon: PlusCircle,
            },
            {
              title: "My Contacts",
              url: "/dashboard/contact/my-contacts",
              icon: Users,
            },
          ],
        },
      ],
    },
    {
      label: "Orders",
      items: [
        {
          title: "Orders",
          icon: Package,
          children: [
            {
              title: "Create Order",
              url: "/dashboard/order/create-order",
              icon: PlusCircle,
            },
            {
              title: "Orders List",
              url: "/dashboard/order/order-list",
              icon: Package,
            },
          ],
        },
      ],
    },
    {
      label: "Commercials",
      items: [
        {
          title: "Commercial",
          icon: Command,
          children: [
            {
              title: "Create Invoice",
              url: "/dashboard/commercial/create-invoice",
              icon: PlusCircle,
            },
            {
              title: "Invoice List",
              url: "/dashboard/commercial/invoice-list",
              icon: Command,
            },
          ],
        },
      ],
    },
    {
      label: "Tasks",
      items: [
        {
          title: "Tasks",
          icon: ClipboardList,
          children: [
            ...(isAdmin
              ? [
                  {
                    title: "Create Task",
                    url: "/dashboard/admin/task/create-task",
                    icon: PlusCircle,
                  },
                  {
                    title: "All Tasks",
                    url: "/dashboard/admin/task/all-task",
                    icon: ClipboardList,
                  },
                ]
              : []),
            {
              title: "My Tasks",
              url: "/dashboard/my-task",
              icon: ClipboardList,
            },
          ],
        },
      ],
    },
    {
      label: "Settings",
      items: [
        ...(isAdmin
          ? [
              {
                title: "Users",
                icon: Users,
                children: [
                  {
                    title: "Create User",
                    url: "/dashboard/user/create-user",
                    icon: PlusCircle,
                  },
                  {
                    title: "User List",
                    url: "/dashboard/user/user-list",
                    icon: Users,
                  },
                ],
              },
            ]
          : []),
      ],
    },
    {
      label: "Others",
      items: [
        {
          title: "Country",
          icon: Globe,
          children: [
            {
              title: "Create Country",
              url: "/dashboard/country/create-country",
              icon: PlusCircle,
            },
            {
              title: "Country List",
              url: "/dashboard/country/country-list",
              icon: Globe,
            },
          ],
        },
        {
          title: "Buyer",
          icon: ShoppingBag,
          children: [
            {
              title: "Create Buyer",
              url: "/dashboard/buyer/create-buyer",
              icon: PlusCircle,
            },
            {
              title: "Buyers List",
              url: "/dashboard/buyer/buyer-list",
              icon: ShoppingBag,
            },
            {
              title: "Assign User",
              url: "/dashboard//buyer/assign-user",
              icon: PlusCircle,
            },
          ],
        },
        {
          title: "Factory",
          icon: Factory,
          children: [
            {
              title: "Create Factory",
              url: "/dashboard/factory/create-factory",
              icon: PlusCircle,
            },
            {
              title: "Factories List",
              url: "/dashboard/factory/factory-list",
              icon: Factory,
            },
          ],
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header — logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">DAZ CRM</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {session?.user?.role?.toLowerCase().replace("_", " ") ?? ""}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) =>
                !isNavParent(item) ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <Collapsible
                    key={item.title}
                    className="group/collapsible"
                    defaultOpen={item.children.some((c) =>
                      pathname.startsWith(c.url),
                    )}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === child.url}
                              >
                                <Link href={child.url}>
                                  <child.icon />
                                  {child.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — user + logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              onClick={() => {
                if (session?.user?.id) {
                  router.push(
                    `/dashboard/user/user-profile?id=${session.user.id}`,
                  );
                }
              }}
              className="cursor-pointer"
            >
              <button type="button">
                <Avatar className="size-6 rounded-lg">
                  <AvatarFallback className="rounded-lg text-[10px]">
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">
                    {session?.user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
