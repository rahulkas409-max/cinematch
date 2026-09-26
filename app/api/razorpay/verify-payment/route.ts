import crypto from "node:crypto";
import { PASS_HOURS, PRICE_PAISE, isSandbox, razorpaySecret , paywallEnabled } from "@/lib/config";
import { orders, users } from "@/lib/db";
import { getUser } from "@/lib/session";

const fail = (error: string, status = 400) => Response.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  if (!paywallEnabled()) return Response.json({ error: "Payments are disabled — CineMatch is free right now." }, { status: 404 });
  const user = await getUser();
  const body = await req.json().catch(() => ({}));

  // ---- Sandbox: only honoured when no Razorpay keys are configured ----
  if (body.sandbox) {
    if (!isSandbox()) return fail("Sandbox payments are disabled when Razorpay keys are configured.", 403);
    const order = typeof body.orderId === "string" ? orders.get(body.orderId) : undefined;
    if (!order || order.user_id !== user.id || !order.sandbox) return fail("Unknown order", 404);
    if (orders.markPaid(order.id, `sandbox_pay_${crypto.randomBytes(6).toString("hex")}`)) {
      users.extendPremium(user.id, PASS_HOURS);
    }
    return Response.json({ ok: true, premiumUntil: users.get(user.id)!.premium_until });
  }

  // ---- Live / test-mode Razorpay ----
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (![orderId, paymentId, signature].every((v) => typeof v === "string" && v.length > 0 && v.length < 200)) {
    return fail("Missing payment fields");
  }
  const secret = razorpaySecret();
  if (!secret) return fail("Payments are not configured", 503);

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return fail("Signature verification failed", 400);

  const order = orders.get(orderId);
  if (!order || order.user_id !== user.id) return fail("Order not found for this session", 404);
  if (order.amount !== PRICE_PAISE || order.currency !== "INR") return fail("Order amount mismatch", 400);

  if (orders.markPaid(orderId, paymentId)) users.extendPremium(user.id, PASS_HOURS);
  return Response.json({ ok: true, premiumUntil: users.get(user.id)!.premium_until });
}
