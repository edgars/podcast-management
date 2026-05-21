import type { ExpensePaymentStatus, MonthlyPaymentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const sponsorLabels: Record<MonthlyPaymentStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Atrasado",
};

const expenseLabels: Record<ExpensePaymentStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Atrasado",
};

export function SponsorPaymentBadge({ status }: { status: MonthlyPaymentStatus }) {
  const variant =
    status === "PAID"
      ? "success"
      : status === "OVERDUE"
        ? "destructive"
        : "warning";
  return <Badge variant={variant}>{sponsorLabels[status]}</Badge>;
}

export function ExpenseStatusBadge({ status }: { status: ExpensePaymentStatus }) {
  const variant =
    status === "PAID"
      ? "success"
      : status === "OVERDUE"
        ? "destructive"
        : "warning";
  return <Badge variant={variant}>{expenseLabels[status]}</Badge>;
}
