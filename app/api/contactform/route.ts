import nodemailer from "nodemailer";

const mailSenderAccount = {
  user: process.env.MAIL_SENDER_ACCOUNT_USERNAME,
  pass: process.env.MAIL_SENDER_ACCOUNT_PASSWORD,
};

export async function POST(request: Request) {
  try {
    const { name, surname, email, business_name, request: requestType, description, language, hCaptchaToken } =
      await request.json();

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

    const captchaData = await captchaResponse.json();

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
      subject: "Richiesta di contatto da brainive",
      text: description,
      html: `<div> Nome: ${name} <br/> Cognome: ${surname} <br/> Email aziendale: ${email} <br/> Azienda: ${business_name} <br/> Richiesta: ${requestType} <br/> Descrizione: <br/> ${description} </div>`,
    };

    // Email di conferma per l'utente (multilingue)
    const confirmationTexts = {
      it: {
        subject: "Riepilogo richiesta di contatto - Brainive",
        body: `<div>
          <h1>Brainive</h1>
          <div>
            <p>Gentile ${name} ${surname}, <br><br>
            Grazie per averci contattato. Di seguito il riepilogo della tua richiesta: <br><br>
            <strong>Azienda:</strong> ${business_name} <br>
            <strong>Oggetto:</strong> ${requestType} <br>
            <strong>Messaggio:</strong> ${description} <br><br>
            Ti contatteremo al più presto. <br><br>
            Cordiali saluti, <br><br>
            Il Team di Brainive</p>
          </div>
        </div>`
      },
      en: {
        subject: "Contact Request Summary - Brainive",
        body: `<div>
          <h1>Brainive</h1>
          <div>
            <p>Dear ${name} ${surname}, <br><br>
            Thank you for contacting us. Below is a summary of your request: <br><br>
            <strong>Company:</strong> ${business_name} <br>
            <strong>Subject:</strong> ${requestType} <br>
            <strong>Message:</strong> ${description} <br><br>
            We will contact you as soon as possible. <br><br>
            Best regards, <br><br>
            The Brainive Team</p>
          </div>
        </div>`
      }
    };

    const lang = language === "en" ? "en" : "it";
    const confirmationTemplate = confirmationTexts[lang];

    const userConfirmationMail = {
      from: mailSenderAccount.user,
      to: email,
      subject: confirmationTemplate.subject,
      text: `${name} ${surname}, grazie per averci contattato. Richiesta: ${requestType}. Messaggio: ${description}`,
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
        data: { name, surname, email, business_name, request: requestType },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("contactform error", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
  }
}
