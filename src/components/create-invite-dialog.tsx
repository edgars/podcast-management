"use client";

import { useState, useTransition } from "react";

import { createPanelistInvite } from "@/actions/invites";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateInviteDialog() {
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setInviteUrl(null);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Convidar novo painelista</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convite executivo</DialogTitle>
          <DialogDescription>
            Gere um link único, válido por 14 dias, para o convidado concluir o
            cadastro e preferências de gravação.
          </DialogDescription>
        </DialogHeader>
        {inviteUrl ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">Link gerado</p>
            <p className="break-all text-muted-foreground">{inviteUrl}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteUrl);
              }}
            >
              Copiar link
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setError(null);
              setInviteUrl(null);
              startTransition(async () => {
                const res = await createPanelistInvite(formData);
                if (!res.ok) {
                  setError(res.error ?? "Não foi possível gerar o convite.");
                  return;
                }
                setInviteUrl(res.url);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="targetEmail">E-mail do convidado (opcional)</Label>
              <Input
                id="targetEmail"
                name="targetEmail"
                type="email"
                placeholder="executivo@empresa.com"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Gerando…" : "Gerar convite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
