import axios from 'axios';

const SMTP2GO_API_BASE_URL = 'https://api.smtp2go.com/v3/';
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const DEFAULT_SENDER = process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org';


export async function sendEmail({ to, subject, text, html, from }: { to: string | string[], subject: string, text?: string, html?: string, from?: string }) {
  if (!SMTP2GO_API_KEY) {
    console.error("SMTP2GO_API_KEY not set in environment — cannot send email");
    throw new Error("Email service not configured");
  }
  const toList = Array.isArray(to) ? to : [to];
  const payload: any = {
    sender: from || `RP Foundation <${DEFAULT_SENDER}>`,
    to: toList,
    subject,
  };
  if (text) payload.text_body = text;
  if (html) payload.html_body = html;

  const url = new URL("email/send", SMTP2GO_API_BASE_URL).toString();
  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": SMTP2GO_API_KEY,
      "Accept": "application/json",
    },
  });
  if (response.data?.data?.failed) {
    console.error("SMTP2GO send failures:", response.data.data.failures);
  }
  return response.data;
}
