import "server-only";

export const PRICE_PAISE = 900; // ₹9.00
export const PASS_HOURS = 24;
export const FREE_RECS = 3;
export const FREE_MOOD_MATCHES_PER_DAY = 3;

export const razorpayKeyId = () => process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || "";
export const razorpaySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim() || "";

/** Sandbox mode: no Razorpay keys configured, so the ₹9 unlock is simulated. */
export const isSandbox = () => !razorpayKeyId() || !razorpaySecret();

/** Razorpay test keys (rzp_test_…) run the real checkout with test cards/UPI. */
export const isRazorpayTestMode = () => razorpayKeyId().startsWith("rzp_test_");
