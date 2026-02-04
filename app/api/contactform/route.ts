import nodemailer from "nodemailer";

const mailSenderAccount = {
  user: process.env.MAIL_SENDER_ACCOUNT_USERNAME,
  pass: process.env.MAIL_SENDER_ACCOUNT_PASSWORD,
};

export async function POST(request: Request) {
  try {
    const { name, email, businessName, requestType, message } =
      await request.json();

    if (!name || !email || !businessName || !requestType || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (!mailSenderAccount.user || !mailSenderAccount.pass) {
      return new Response("Email configuration missing", { status: 500 });
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

    const mailData = {
      from: mailSenderAccount.user,
      to: "commerciale@integys.com",
      subject: `Richiesta di contatto da brainive`,
      text: message,
      html: `<div> Nome: ${name} <br/> Email aziendale: ${email} <br/> Azienda: ${businessName} <br/> Richiesta: ${requestType} <br/> Messaggio: <br/> ${message} </div>`,
    };

    await transporter.sendMail(mailData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Richiesta inviata correttamente",
        data: { name, email, businessName, requestType },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("contactform error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
