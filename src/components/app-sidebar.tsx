"use client";

import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Layers,
  Menu,
  Mic2,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutButton } from "@/components/sign-out-button";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const adminItems: NavItem[] = [
  { href: "/painel", label: "Painel executivo", icon: LayoutDashboard },
  { href: "/painel/temporadas", label: "Temporadas e episódios", icon: Layers },
  { href: "/painel/painelistas", label: "Painelistas", icon: Users },
  { href: "/painel/cotas", label: "Cotas de patrocínio", icon: Mic2 },
  { href: "/painel/financeiro/receitas", label: "Receitas", icon: CreditCard },
  { href: "/painel/financeiro/despesas", label: "Despesas", icon: BarChart3 },
  { href: "/painel/financeiro/fluxo", label: "Fluxo de caixa", icon: Shield },
];

const panelistItems: NavItem[] = [
  { href: "/painel", label: "Resumo", icon: LayoutDashboard },
  { href: "/painel/perfil", label: "Perfil executivo", icon: UserCircle },
];

function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/painel" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-accent shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.25)]"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({
  role,
  userName,
  userEmail,
}: {
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const items = role === "ADMIN" ? adminItems : panelistItems;

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-primary/20 bg-gradient-to-b from-card/95 to-background/90 backdrop-blur-md md:flex md:flex-col">
        <div className="border-b border-border/80 bg-card/30 px-4 py-3">
          <Link href="/painel" className="block">
            <Image
              src="/images/logo-cyberseccast.png"
              alt="CyberSec Cast"
              width={340}
              height={80}
              priority
              className="h-auto w-full"
            />
          </Link>
          <p className="mt-2 truncate text-[11px] font-medium text-muted-foreground">
            Inteligência executiva · BH + São Paulo
          </p>
        </div>
        <ScrollArea className="flex-1 py-4">
          <NavLinks items={items} />
        </ScrollArea>
        <div className="border-t border-border/80 p-3">
          <div className="mb-2 rounded-lg bg-muted/30 px-3 py-2 text-xs">
            <p className="font-medium text-foreground">{userName ?? "Conta"}</p>
            <p className="truncate text-muted-foreground">{userEmail}</p>
            <p className="mt-1 text-[10px] uppercase text-accent">
              {role === "ADMIN" ? "Administração" : "Painelista"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <SignOutButton className="flex-1" />
          </div>
        </div>
      </aside>

      <div className="flex items-center gap-2 border-b border-border/80 bg-background/95 px-3 py-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetHeader className="border-b border-border/80 bg-card/40 p-4 text-left">
              <SheetTitle className="flex flex-col gap-1 text-left text-base font-semibold normal-case">
                <span className="block">
                  <Image
                    src="/images/logo-cyberseccast.png"
                    alt="CyberSec Cast"
                    width={340}
                    height={80}
                    className="h-auto w-full max-w-[220px]"
                  />
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Inteligência para quem decide.
                </span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="max-h-[60vh] flex-1">
              <div className="py-4">
                <MobileNav role={role} />
              </div>
            </ScrollArea>
            <div className="border-t border-border/80 p-3">
              <div className="mb-2 rounded-lg bg-muted/30 px-3 py-2 text-xs">
                <p className="font-medium text-foreground">{userName ?? "Conta"}</p>
                <p className="truncate text-muted-foreground">{userEmail}</p>
                <p className="mt-1 text-[10px] uppercase text-accent">
                  {role === "ADMIN" ? "Administração" : "Painelista"}
                </p>
              </div>
              <SignOutButton />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">Painel operacional</span>
        <div className="ml-auto flex items-center gap-1">
          <ModeToggle />
        </div>
      </div>
    </>
  );
}

function MobileNav({ role }: { role: UserRole }) {
  const items = role === "ADMIN" ? adminItems : panelistItems;
  return <NavLinks items={items} />;
}
