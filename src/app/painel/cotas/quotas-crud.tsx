"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";

import { createQuota, deleteQuota, updateQuota } from "@/actions/quotas";
import { formatBrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type QuotaRow = {
  id: string;
  name: string;
  monthlyAmount: string;
  counterpartiesNotes: string | null;
};

type ModalState =
  | { mode: "create" }
  | {
      mode: "edit";
      quota: QuotaRow;
    };

type Props = {
  quotas: QuotaRow[];
};

export function QuotasCrud({ quotas }: Props) {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...quotas].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [quotas],
  );

  const editingQuota = modalState?.mode === "edit" ? modalState.quota : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Cotas cadastradas</CardTitle>
          <Button onClick={() => setModalState({ mode: "create" })}>Nova cota</Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor mensal</TableHead>
                <TableHead>Contrapartidas</TableHead>
                <TableHead className="w-[180px] text-right">Comandos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Nenhuma cota cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>{formatBrl(q.monthlyAmount)}</TableCell>
                    <TableCell className="max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">
                      {q.counterpartiesNotes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setModalState({ mode: "edit", quota: q })}
                        >
                          Editar
                        </Button>
                        <form
                          action={async (formData) => {
                            const confirmed = window.confirm(
                              `Deseja realmente remover a cota "${q.name}"?`,
                            );
                            if (!confirmed) return;

                            startTransition(async () => {
                              await deleteQuota(formData);
                            });
                          }}
                        >
                          <input type="hidden" name="id" value={q.id} />
                          <Button type="submit" variant="ghost" size="sm" disabled={pending}>
                            Excluir
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!modalState} onOpenChange={(open) => !open && setModalState(null)}>
        <AnimatePresence>
          {modalState ? (
            <DialogContent forceMount asChild>
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingQuota ? "Editar cota de patrocinio" : "Nova cota de patrocinio"}
                  </DialogTitle>
                  <DialogDescription>
                    Defina o nome comercial, valor mensal e contrapartidas editoriais.
                  </DialogDescription>
                </DialogHeader>

                <form
                  className="grid gap-4 pt-2"
                  action={async (formData) => {
                    startTransition(async () => {
                      if (editingQuota) {
                        await updateQuota(formData);
                      } else {
                        await createQuota(formData);
                      }
                      setModalState(null);
                    });
                  }}
                >
                  {editingQuota ? <input type="hidden" name="id" value={editingQuota.id} /> : null}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da cota</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Cota Master"
                      defaultValue={editingQuota?.name ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyAmount">Valor mensal (BRL)</Label>
                    <Input
                      id="monthlyAmount"
                      name="monthlyAmount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      required
                      placeholder="25000"
                      defaultValue={editingQuota?.monthlyAmount ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="counterpartiesNotes">Contrapartidas</Label>
                    <Textarea
                      id="counterpartiesNotes"
                      name="counterpartiesNotes"
                      rows={4}
                      placeholder="Logo na abertura, mencao pelo host, spot de 30s..."
                      defaultValue={editingQuota?.counterpartiesNotes ?? ""}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalState(null)}
                      disabled={pending}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={pending}>
                      {editingQuota ? "Salvar alteracoes" : "Cadastrar cota"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </DialogContent>
          ) : null}
        </AnimatePresence>
      </Dialog>
    </div>
  );
}
