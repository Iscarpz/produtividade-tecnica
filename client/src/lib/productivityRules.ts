export const OPEN_STATUSES = ["EM ANDAMENTO", "AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "AGUARDANDO SEGURADORA"] as const;
export const PRODUCTIVITY_EVENTS = ["RECEBIDO", "FINALIZADO", "ENVIADO_PP", "ENVIADO_ORCAMENTO", "ENVIADO_SEGURADORA"] as const;
export type OpenStatus = (typeof OPEN_STATUSES)[number];
export type ProductivityEvent = (typeof PRODUCTIVITY_EVENTS)[number];
export const isOpenStatus = (status: string): status is OpenStatus => OPEN_STATUSES.includes(status as OpenStatus);
export const isProductivityEvent = (event: string): event is ProductivityEvent => PRODUCTIVITY_EVENTS.includes(event as ProductivityEvent);
