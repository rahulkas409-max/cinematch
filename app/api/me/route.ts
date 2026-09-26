import { FREE_MOOD_MATCHES_PER_DAY, PASS_HOURS, PRICE_PAISE, isRazorpayTestMode, isSandbox, razorpayKeyId } from "@/lib/config";
import { moodUsage } from "@/lib/db";
import { getUser } from "@/lib/session";
import type { MeResponse } from "@/lib/types";

export async function GET() {
  const user = await getUser();
  const body: MeResponse = {
    premium: user.premium,
    premiumUntil: user.premium_until,
    premiumHoursLeft: user.premium ? Math.max(1, Math.round((user.premium_until - Date.now()) / 3600_000)) : 0,
    sandbox: isSandbox(),
    razorpayTestMode: isRazorpayTestMode(),
    razorpayKeyId: razorpayKeyId(),
    pricePaise: PRICE_PAISE,
    passHours: PASS_HOURS,
    moodMatchesLeft: user.premium ? null : Math.max(0, FREE_MOOD_MATCHES_PER_DAY - moodUsage.get(user.id)),
  };
  return Response.json(body);
}
