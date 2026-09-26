/** Payload carried in /invite#… links. Short keys keep links WhatsApp-friendly. */
export type Invite = { f: string; t: string; n?: string };

/** Payload carried in /ticket#… links. */
export type TicketData = Invite & { m: string; v: string; w: string };

export function isInvite(x: unknown): x is Invite {
  return !!x && typeof x === "object" && typeof (x as Invite).f === "string" && typeof (x as Invite).t === "string";
}

export function isTicket(x: unknown): x is TicketData {
  return isInvite(x) && typeof (x as TicketData).m === "string" && typeof (x as TicketData).v === "string";
}
