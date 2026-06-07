/**
 * server.js
 * ──────────────────────────────────────────────
 * CinemaWay Express Server
 * Serves the static front-end and exposes the
 * POST /api/briefs endpoint for project-brief submissions.
 * ──────────────────────────────────────────────
 */

// ── Load environment variables ───────────────────────────────────────
require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path       = require('path');

// ── Database (async init) ────────────────────────────────────────────
const { initDb, saveDb } = require('./db/init');

// ── Create Express app ───────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// ── Email helper ─────────────────────────────────────────────────────
async function sendNotificationEmail(brief, projectId) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[MAIL] SMTP not configured — skipping email notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const adminMailOptions = {
    from:    `"CinemaWay" <${process.env.SMTP_USER}>`,
    to:      process.env.ADMIN_EMAIL || 'admin@cinemaway.com',
    subject: `New Project Brief: ${projectId} — ${brief.project_title}`,
    html: `
      <h2>New Project Brief Received</h2>
      <p><strong>Project ID:</strong> ${projectId}</p>
      <p><strong>Name:</strong> ${brief.full_name}</p>
      <p><strong>Company:</strong> ${brief.company || 'N/A'}</p>
      <p><strong>Email:</strong> ${brief.email}</p>
      <p><strong>Phone:</strong> ${brief.phone || 'N/A'}</p>
      <hr>
      <p><strong>Title:</strong> ${brief.project_title}</p>
      <p><strong>Type:</strong> ${brief.project_type || 'N/A'}</p>
      <p><strong>Description:</strong> ${brief.project_description}</p>
      <p><strong>Services:</strong> ${brief.services_needed || 'N/A'}</p>
      <p><strong>Budget:</strong> ${brief.estimated_budget || 'N/A'}</p>
      <p><strong>Deadline:</strong> ${brief.desired_deadline || 'N/A'}</p>
      <p><strong>Location:</strong> ${brief.project_location || 'N/A'}</p>
      <p><strong>References:</strong> ${brief.reference_links || 'N/A'}</p>
      <p><strong>Notes:</strong> ${brief.additional_notes || 'N/A'}</p>
    `,
  };

  const clientMailOptions = {
    from:    `"CinemaWay" <${process.env.SMTP_USER}>`,
    to:      brief.email,
    subject: `Your CinemaWay Project Brief — ${projectId}`,
    html: `
      <h2>Thank you for reaching out, ${brief.full_name}!</h2>
      <p>We've received your project brief <strong>${projectId}</strong> and our team will review it shortly.</p>
      <p>We'll be in touch soon to discuss your project: <em>${brief.project_title}</em>.</p>
      <br>
      <p>Best regards,<br>The CinemaWay Team</p>
    `,
  };

  await transporter.sendMail(adminMailOptions);
  console.log(`[MAIL] Admin notification sent for ${projectId}`);

  await transporter.sendMail(clientMailOptions);
  console.log(`[MAIL] Client confirmation sent to ${brief.email}`);
}

// ── Validation ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Boot the server ──────────────────────────────────────────────────
(async () => {
  // Initialise database
  const db = await initDb();

  // ── POST /api/briefs ─────────────────────────────────────────────
  app.post('/api/briefs', async (req, res) => {
    try {
      const {
        full_name, company, email, phone,
        project_title, project_type, project_description,
        services_needed, estimated_budget, desired_deadline,
        project_location, reference_links, additional_notes,
      } = req.body;

      // Validate
      if (!full_name || !full_name.trim()) {
        return res.status(400).json({ success: false, error: 'Full name is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
      }
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
      }
      if (!project_title || !project_title.trim()) {
        return res.status(400).json({ success: false, error: 'Project title is required.' });
      }
      if (!project_description || !project_description.trim()) {
        return res.status(400).json({ success: false, error: 'Project description is required.' });
      }

      // Generate unique project ID
      const projectId = 'CW-' + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

      // Insert into database
      db.run(
        `INSERT INTO project_briefs (
          project_id, full_name, company, email, phone,
          project_title, project_type, project_description,
          services_needed, estimated_budget, desired_deadline,
          project_location, reference_links, additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          full_name.trim(),
          company?.trim() || null,
          email.trim().toLowerCase(),
          phone?.trim() || null,
          project_title.trim(),
          project_type?.trim() || null,
          project_description.trim(),
          services_needed?.trim() || null,
          estimated_budget?.trim() || null,
          desired_deadline?.trim() || null,
          project_location?.trim() || null,
          reference_links?.trim() || null,
          additional_notes?.trim() || null,
        ]
      );

      // Persist to disk
      saveDb(db);
      console.log(`[API] Brief ${projectId} saved to database`);

      // Send email (non-blocking)
      try {
        await sendNotificationEmail(req.body, projectId);
      } catch (mailErr) {
        console.error('[MAIL] Failed to send email:', mailErr.message);
      }

      return res.status(201).json({
        success:   true,
        projectId: projectId,
        message:   'Thank you for contacting CinemaWay. Our team will review your project and contact you shortly.',
      });

    } catch (err) {
      console.error('[API] Server error:', err.message);
      return res.status(500).json({
        success: false,
        error:   'An internal server error occurred. Please try again later.',
      });
    }
  });

  // ── Start listening ────────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n✦  CinemaWay server running at http://localhost:${PORT}\n`);
  });
})();
