
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contact, details, services, timeline, aiSummary, internalEstimate, lang } = req.body;

  // Configuración del transportador (Datos que debes poner en Vercel Settings)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER, // Tu email de empresa (ej: hola@thesmartcorner.com)
      pass: process.env.SMTP_PASS, // Tu contraseña de aplicación de Google
    },
  });

  try {
    // 1. EMAIL PARA TI (ARTURO) - Donde recibes el trabajo
    await transporter.sendMail({
      from: `"The Smart Corner" <${process.env.SMTP_USER}>`,
      to: 'arturonaranxo@gmail.com', // TU EMAIL PROFESIONAL
      subject: 'Agency The Smart Corner',
      html: `
        <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
          <h1 style="color: #8b5cf6;">🚀 Nuevo Briefing de ${contact.fullName}</h1>
          <p><strong>Empresa/Proyecto:</strong> ${contact.company || 'N/A'}</p>
          <p><strong>Email Cliente:</strong> ${contact.email}</p>
          <p><strong>Nombre Proyecto:</strong> ${details.projectName}</p>
          <p><strong>Presupuesto Cliente:</strong> ${timeline.budgetRange}</p>
          <hr style="border: 1px solid #1e293b; margin: 30px 0;"/>
          <h2 style="color: #ec4899;">Resumen Estratégico (IA):</h2>
          <div style="background: #1e293b; padding: 20px; border-radius: 10px; font-style: italic; line-height: 1.6;">
            ${aiSummary.replace(/\n/g, '<br/>')}
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 25px; text-align: right;">
            Cálculo base para presupuesto: ~${internalEstimate}€
          </p>
        </div>
      `,
    });

    // 2. EMAIL PARA EL CLIENTE - Confirmación automática
    const subjects: any = {
      en: "Briefing Received - The Smart Corner",
      es: "Briefing Recibido - The Smart Corner",
      pl: "Briefing Otrzymany - The Smart Corner"
    };

    const messages: any = {
      en: `Hi ${contact.fullName},\n\nWe have successfully received your briefing for "${details.projectName}". Our team will review it and contact you within 48 business hours.\n\nBest regards,\nThe Smart Corner Team.`,
      es: `Hola ${contact.fullName},\n\nHemos recibido correctamente tu briefing para "${details.projectName}". Nuestro equipo lo revisará y te contactará en un máximo de 48 horas hábiles.\n\nSaludos,\nEl equipo de The Smart Corner.`,
      pl: `Cześć ${contact.fullName},\n\nPomyślnie otrzymaliśmy Twój briefing dotyczący projektu "${details.projectName}". Nasz zespół przeanalizuje go i skontaktuje się z Tobą w ciągu 48 godzin roboczych.\n\nPozdrawiamy,\nZespół The Smart Corner.`
    };

    await transporter.sendMail({
      from: `"The Smart Corner" <${process.env.SMTP_USER}>`,
      to: contact.email, // EMAIL QUE EL CLIENTE ESCRIBIÓ EN EL FORMULARIO
      subject: subjects[lang] || subjects.en,
      text: messages[lang] || messages.en,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mail Error:", error);
    return res.status(500).json({ error: 'Failed to send emails. Check Vercel logs.' });
  }
}
