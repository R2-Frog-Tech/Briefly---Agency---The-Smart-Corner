
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fullName, email, services, projectName, description, deadline, budgetRange, estimate, lang } = req.body;
  
  let aiSummary = "";

  // 1. GENERAR RESUMEN CON GEMINI
  // La API Key debe obtenerse exclusivamente de process.env.API_KEY
  if (process.env.API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Actua como un estratega creativo experto. Analiza este briefing de proyecto y proporciona un resumen profesional e inspirador en el idioma ${lang}.
      - Proyecto: ${projectName}
      - Servicios solicitados: ${services.join(', ')}
      - Briefing: ${description}
      - Inversión objetivo: ${budgetRange}
      
      El tono debe ser experto y alentador. Máximo 150 palabras.`;

      // Se usa ai.models.generateContent directamente
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      // Acceso directo a la propiedad .text (no es un método)
      aiSummary = aiResponse.text || "Análisis no disponible en este momento.";
    } catch (e) {
      console.error("Gemini Error:", e);
      aiSummary = "Datos recibidos correctamente, pero el resumen de IA falló temporalmente.";
    }
  }

  // 2. CONFIGURAR SMTP
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'arturonaranxo@gmail.com',
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Definimos el remitente solicitado
    const myEmail = 'arturonaranxo@gmail.com';

    // 3. EMAIL PARA ARTURO (FREELANCER)
    await transporter.sendMail({
      from: `"Smart Corner Briefing" <${myEmail}>`,
      to: myEmail,
      replyTo: email,
      subject: `🚀 Nuevo Proyecto: ${projectName}`,
      html: `
        <div style="font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 20px; line-height: 1.6;">
          <h1 style="color: #8b5cf6; margin-bottom: 5px;">Nuevo Briefing</h1>
          <p style="font-size: 14px; opacity: 0.8; margin-top: 0;">De: ${fullName} (${email})</p>
          
          <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.1);">
            <p><strong>Proyecto:</strong> ${projectName}</p>
            <p><strong>Servicios:</strong> ${services.join(', ')}</p>
            <p><strong>Plazo:</strong> ${deadline}</p>
            <p><strong>Presupuesto:</strong> ${budgetRange}</p>
            <p><strong>Inversión Base (Calculada):</strong> ${estimate}€</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;"/>
            <p><strong>Descripción:</strong><br/>${description}</p>
          </div>
          
          <h3 style="color: #ec4899; margin-top: 40px;">Análisis Estratégico (IA):</h3>
          <div style="background: #1e293b; padding: 25px; border-radius: 15px; border-left: 4px solid #ec4899; font-style: italic; color: #cbd5e1;">
            ${aiSummary.replace(/\n/g, '<br/>')}
          </div>
          
          <p style="font-size: 10px; text-align: center; margin-top: 50px; opacity: 0.3;">
            The Smart Corner Automation Engine v2.5
          </p>
        </div>
      `
    });

    // 4. CONFIRMACIÓN AL CLIENTE
    const confirmSubjects: Record<string, string> = { 
      es: "Confirmación de Briefing - The Smart Corner", 
      en: "Briefing Received - The Smart Corner", 
      pl: "Briefing Otrzymany - The Smart Corner" 
    };
    
    const confirmTexts: Record<string, string> = { 
      es: `Hola ${fullName}, he recibido correctamente los detalles de tu proyecto "${projectName}". Revisaré toda la información y te contactaré muy pronto.`,
      en: `Hi ${fullName}, I have successfully received the details for your project "${projectName}". I will review everything and get back to you shortly.`,
      pl: `Cześć ${fullName}, otrzymałem szczegóły Twojego projektu "${projectName}". Przeanalizuję wszystko i wkrótce się z Tobą skontaktuję.`
    };

    await transporter.sendMail({
      from: `"The Smart Corner" <${myEmail}>`,
      to: email,
      subject: confirmSubjects[lang] || confirmSubjects.en,
      text: confirmTexts[lang] || confirmTexts.en
    });

    return res.status(200).json({ success: true, aiSummary });
  } catch (error) {
    console.error("Mail Error Detail:", error);
    return res.status(500).json({ error: 'Mail delivery failed. Check SMTP credentials.' });
  }
}
