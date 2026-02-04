import { NextResponse } from "next/server";

type HCaptchaVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string };

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing captcha token" },
      { status: 400 }
    );
  }

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Missing HCAPTCHA secret" },
      { status: 500 }
    );
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await verifyResponse.json()) as HCaptchaVerifyResponse;

  if (!data.success) {
    return NextResponse.json(
      { success: false, errors: data["error-codes"] ?? [] },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
