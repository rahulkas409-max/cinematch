import crypto from "node:crypto";
import Razorpay from "razorpay";
import { PRICE_PAISE, isSandbox, razorpayKeyId, razorpaySecret } from "@/lib/config";
import { orders } from "@/lib/db";
import { getUser } from "@/lib/session";

export async function POST() {
  const user = await getUser();

  if (isSandbox()) {
    const id = `sandbox_order_${crypto.randomBytes(8).toString("hex")}`;
    orders.create({ id, user_id: user.id, amount: PRICE_PAISE, currency: "INR", sandbox: true });
    return Response.json({ sandbox: true, orderId: id, amount: PRICE_PAISE, currency: "INR" });
  }

  try {
    const rzp = new Razorpay({ key_id: razorpayKeyId(), key_secret: razorpaySecret() });
    const order = await rzp.orders.create({
      amount: PRICE_PAISE,
      currency: "INR",
      receipt: `cm_${user.id.slice(0, 12)}_${Date.now()}`,
      notes: { product: "CineMatch 24h pass", user: user.id },
    });
    orders.create({ id: order.id, user_id: user.id, amount: Number(order.amount), currency: order.currency, sandbox: false });
    return Response.json({ sandbox: false, orderId: order.id, amount: order.amount, currency: order.currency, keyId: razorpayKeyId() });
  } catch (err) {
    console.error("[razorpay] create-order failed", err);
    return Response.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
