
/**
 * EXAMPLE BACKEND ENDPOINT (Node.js + Express)
 * Target: arturonaranxo@gmail.com
 */

/*
const express = require('express');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/api/briefings', async (req, res) => {
    const { contact, details, services, timeline, aiSummary, internalEstimate, lang } = req.body;

    try {
        // 1. Save to Database
        const query = `
            INSERT INTO briefings 
            (client_name, client_email, client_company, project_name, project_description, project_services, budget_range, deadline, ai_summary, internal_estimate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `;
        const values = [
            contact.fullName, contact.email, contact.company, 
            details.projectName, details.description, JSON.stringify(services),
            timeline.budgetRange, timeline.deadline, aiSummary, internalEstimate
        ];
        
        const dbResult = await pool.query(query, values);

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        // 3. SEND EMAIL TO FREELANCER (Arturo)
        await transporter.sendMail({
            from: '"The Smart Corner" <noreply@thesmartcorner.com>',
            to: 'arturonaranxo@gmail.com',
            subject: 'Agency The Smart Corner', // ASUNTO REQUERIDO
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #8B5CF6;">
                    <h2 style="color: #8B5CF6;">🚀 Nuevo Briefing Recibido</h2>
                    <p><strong>De:</strong> ${contact.fullName} (${contact.email})</p>
                    <p><strong>Proyecto:</strong> ${details.projectName}</p>
                    <p><strong>Servicios:</strong> ${services.join(', ')}</p>
                    <hr/>
                    <h3>Resumen IA:</h3>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">${aiSummary}</div>
                </div>
            `
        });

        // 4. SEND CONFIRMATION EMAIL TO CLIENT
        const confirmationSubjects = {
            en: "We've received your request - The Smart Corner",
            es: "Hemos recibido tu solicitud - The Smart Corner",
            pl: "Otrzymaliśmy Twoją prośbę - The Smart Corner"
        };

        const confirmationTexts = {
            en: "Thank you for contacting us. We will review your briefing and get back to you shortly.",
            es: "Gracias por contactar con nosotros. Revisaremos tu briefing y te contactaremos pronto.",
            pl: "Dziękujemy za kontakt. Przeanalizujemy Twój briefing i wkrótce się z Tobą skontaktujemy."
        };

        await transporter.sendMail({
            from: '"The Smart Corner" <hello@thesmartcorner.com>',
            to: contact.email,
            subject: confirmationSubjects[lang] || confirmationSubjects.en,
            text: confirmationTexts[lang] || confirmationTexts.en
        });

        res.status(201).json({ success: true, id: dbResult.rows[0].id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing briefing' });
    }
});

module.exports = router;
*/
