import nodemailer from "nodemailer";
import { text } from "stream/consumers";

type HCaptchaVerifyResponse = {
  success: boolean;
  "error-codes"?: string[] | string;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  score?: number;
  score_reason?: string[];
};

const mailSenderAccount = {
  user: process.env.MAIL_SENDER_ACCOUNT_USERNAME,
  pass: process.env.MAIL_SENDER_ACCOUNT_PASSWORD,
};

// Escape base per HTML (evita injection nelle variabili utente)
function escapeHtml(str: string) {
  return str.replace(/[&<>'"/]/g, function (s) {
    const entity: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
      '/': '&#x2F;',
    };
    return entity[s] || s;
  });
};

export async function POST(request: Request) {
  try {
    const { name, surname, email, business_name, request: requestType, description, language, hCaptchaToken } =
      await request.json();

    // Applica escape HTML ai campi che verranno usati nei template
    const escapedName = escapeHtml(name);
    const escapedSurname = escapeHtml(surname || '');
    const escapedBusinessName = escapeHtml(business_name);
    const escapedRequestType = escapeHtml(requestType);
    const escapedDescription = escapeHtml(description);

    if (!name || !email || !business_name || !requestType || !description) {
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), { status: 400 });
    }

    // Verifica hCaptcha
    if (!hCaptchaToken) {
      return new Response(JSON.stringify({ success: false, message: "hCaptcha token missing" }), { status: 400 });
    }

    const captchaVerifyUrl = 'https://hcaptcha.com/siteverify';
    const captchaResponse = await fetch(captchaVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.HCAPTCHA_SECRET_KEY}&response=${hCaptchaToken}`,
    });

    const captchaData: HCaptchaVerifyResponse = await captchaResponse.json();

    if (!captchaData.success) {
      return new Response(JSON.stringify({ success: false, message: "hCaptcha verification failed" }), { status: 400 });
    }

    if (!mailSenderAccount.user || !mailSenderAccount.pass) {
      return new Response(JSON.stringify({ success: false, message: "Email configuration missing" }), { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: mailSenderAccount.user,
        pass: mailSenderAccount.pass,
      },
    });

    // Email interna sempre in italiano
    const internalMailData = {
      from: mailSenderAccount.user,
      to: "commerciale@integys.com",
      subject: "BRAINIVE - Richiesta di contatto",
      text: `Nome: ${escapedName}\nCognome: ${escapedSurname}\nEmail aziendale: ${email}\nAzienda: ${escapedBusinessName}\nRichiesta: ${escapedRequestType}\nDescrizione:\n${escapedDescription}`,
      html: `<div> Nome: ${escapedName} <br/> Cognome: ${escapedSurname} <br/> Email aziendale: ${email} <br/> Azienda: ${escapedBusinessName} <br/> Richiesta: ${escapedRequestType} <br/> Descrizione: <br/> ${escapedDescription} </div>`,
    };

    // Email di conferma per l'utente (multilingue)
    const confirmationTexts = {
      it: {
        subject: "Riepilogo richiesta di contatto - Brainive",
        body: `<div>
          <h1>Brainive</h1>
          <div>
            <p>Gentile ${escapedName} ${escapedSurname}, <br><br>
            Grazie per averci contattato. Di seguito il riepilogo della tua richiesta: <br><br>
            <strong>Azienda:</strong> ${escapedBusinessName} <br>
            <strong>Oggetto:</strong> ${escapedRequestType} <br>
            <strong>Messaggio:</strong> ${escapedDescription} <br><br>
            Ti contatteremo al più presto. <br><br>
            Cordiali saluti, <br><br>
            Il Team di Brainive</p>
          </div>
        </div>`,
        text: `${escapedName} ${escapedSurname}, grazie per averci contattato. Richiesta: ${escapedRequestType}. Messaggio: ${escapedDescription}`,
      },
      en: {
        subject: "Contact Request Summary - Brainive",
        body: `<div>
          <h1>Brainive</h1>
          <div>
            <p>Dear ${escapedName} ${escapedSurname}, <br><br>
            Thank you for contacting us. Below is a summary of your request: <br><br>
            <strong>Company:</strong> ${escapedBusinessName} <br>
            <strong>Subject:</strong> ${escapedRequestType} <br>
            <strong>Message:</strong> ${escapedDescription} <br><br>
            We will contact you as soon as possible. <br><br>
            Best regards, <br><br>
            The Brainive Team</p>
          </div>
        </div>`,
        text: `${escapedName} ${escapedSurname}, thank you for contacting us. Request: ${escapedRequestType}. Message: ${escapedDescription}`,
      }
    };

    const lang = language === "en" ? "en" : "it";
    const confirmationTemplate = confirmationTexts[lang];

    const userConfirmationMail = {
      from: mailSenderAccount.user,
      to: email,
      subject: confirmationTemplate.subject,
      text: confirmationTemplate.text,
      html: confirmationTemplate.body,
    };

    // Invia entrambe le email
    await transporter.sendMail(internalMailData);
    await transporter.sendMail(userConfirmationMail);

    const successMessage = language === "en" 
      ? "Request sent successfully" 
      : "Richiesta inviata correttamente";

    return new Response(
      JSON.stringify({
        success: true,
        message: successMessage,
        data: { name: escapedName, surname: escapedSurname, email, business_name: escapedBusinessName, request: escapedRequestType },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("contactform error", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
  }
}
