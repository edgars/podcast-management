"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("w-full", className)}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Encerrar sessão
    </Button>
  );
}
