
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contact, details, services, timeline, aiSummary, internalEstimate, lang } = req.body;

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const isResend = smtpHost.includes('resend');

  // Si usas Resend, el usuario es SIEMPRE 'resend'
  const authUser = isResend ? 'resend' : process.env.SMTP_USER;
  const authPass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: authUser,
      pass: authPass,
    },
  });

  try {
    // Para Resend, si no tienes dominio verificado, usa onboarding@resend.dev
    // Para Gmail, usa tu propio correo (SMTP_USER)
    const fromEmail = isResend ? 'onboarding@resend.dev' : process.env.SMTP_USER;

    // 1. EMAIL PARA TI (ARTURO)
    await transporter.sendMail({
      from: `"The Smart Corner" <${fromEmail}>`,
      to: 'arturonaranxo@gmail.com',
      subject: 'Agency The Smart Corner - Nuevo Lead',
      html: `
        <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
          <h1 style="color: #8b5cf6;">🚀 Nuevo Briefing: ${contact.fullName}</h1>
          <p><strong>Empresa/Proyecto:</strong> ${contact.company || 'N/A'}</p>
          <p><strong>Email Cliente:</strong> ${contact.email}</p>
          <p><strong>Presupuesto:</strong> ${timeline.budgetRange}</p>
          <hr style="border: 1px solid #1e293b; margin: 30px 0;"/>
          <h2 style="color: #ec4899;">Resumen IA:</h2>
          <div style="background: #1e293b; padding: 20px; border-radius: 10px; font-style: italic; line-height: 1.6;">
            ${aiSummary.replace(/\n/g, '<br/>')}
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 25px; text-align: right;">
            Cálculo base interno: ~${internalEstimate}€
          </p>
        </div>
      `,
    });

    // 2. EMAIL PARA EL CLIENTE (CONFIRMACIÓN)
    const subjects: Record<string, string> = {
      en: "Briefing Received - The Smart Corner",
      es: "Briefing Recibido - The Smart Corner",
      pl: "Briefing Otrzymany - The Smart Corner"
    };

    const messages: Record<string, string> = {
      en: `Hi ${contact.fullName}, we have received your briefing. We'll contact you soon!`,
      es: `Hola ${contact.fullName}, hemos recibido tu briefing correctamente. ¡Te contactaremos pronto!`,
      pl: `Cześć ${contact.fullName}, otrzymaliśmy Twój briefing. Skontaktujemy się wkrótce!`
    };

    await transporter.sendMail({
      from: `"The Smart Corner" <${fromEmail}>`,
      to: contact.email,
      subject: subjects[lang] || subjects.en,
      text: messages[lang] || messages.en,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mail Error:", error);
    return res.status(500).json({ error: 'SMTP Error. Check credentials.' });
  }
}
