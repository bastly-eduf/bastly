import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!env.gmailUser || !env.gmailAppPassword) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.gmailUser,
        pass: env.gmailAppPassword,
      },
    });
  }

  return transporter;
}

export function isEmailConfigured() {
  return Boolean(env.gmailUser && env.gmailAppPassword);
}

export async function sendEmail({ to, subject, text, html, developmentUrl = '' }) {
  const mailer = getTransporter();

  if (!mailer) {
    if (env.nodeEnv === 'production') {
      throw new Error('Email service is not configured.');
    }

    console.log('\n[Bastly development email]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (developmentUrl) {
      console.log(`Open: ${developmentUrl}`);
    }
    console.log('');

    return {
      delivered: false,
      developmentPreview: true,
    };
  }

  await mailer.sendMail({
    from: `"${env.emailFromName}" <${env.gmailUser}>`,
    to,
    subject,
    text,
    html,
  });

  return {
    delivered: true,
    developmentPreview: false,
  };
}

function emailShell({ eyebrow, title, body, buttonLabel, buttonUrl }) {
  return `
    <div style="margin:0;padding:32px 16px;background:#f4faff;font-family:Arial,sans-serif;color:#10213a">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dfe8f1;border-radius:24px;overflow:hidden">
        <div style="padding:28px;background:#061f49;color:#ffffff">
          <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#82c8ff">${eyebrow}</div>
          <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15">${title}</h1>
        </div>
        <div style="padding:28px">
          <div style="font-size:15px;line-height:1.8;color:#64748b">${body}</div>
          <a href="${buttonUrl}" style="display:inline-block;margin-top:22px;padding:13px 20px;border-radius:999px;background:#237fd1;color:#ffffff;text-decoration:none;font-weight:700">${buttonLabel}</a>
          <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#94a3b8">If the button does not work, copy this link into your browser:<br>${buttonUrl}</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendDoctorInviteEmail({ email, fullName, inviteUrl }) {
  return sendEmail({
    to: email,
    subject: 'Set up your Bastly doctor account',
    developmentUrl: inviteUrl,
    text: `Hi ${fullName}, Bastly Academy invited you to create your doctor account. Open this link: ${inviteUrl}`,
    html: emailShell({
      eyebrow: 'Doctor invitation',
      title: 'Welcome to Bastly.',
      body: `Hi ${fullName},<br><br>Bastly Academy has created your doctor invitation. Use the secure link below to choose your password and activate your account. The link expires automatically and works once.`,
      buttonLabel: 'Set up my account',
      buttonUrl: inviteUrl,
    }),
  });
}

export async function sendParentInviteEmail({ email, parentName, studentName, inviteUrl }) {
  return sendEmail({
    to: email,
    subject: `Your Bastly parent account for ${studentName}`,
    developmentUrl: inviteUrl,
    text: `Hi ${parentName}, you have been invited to Bastly as the parent/guardian of ${studentName}. Open: ${inviteUrl}`,
    html: emailShell({
      eyebrow: 'Parent invitation',
      title: 'Follow their progress with Bastly.',
      body: `Hi ${parentName},<br><br>You have been invited as the parent/guardian of <strong>${studentName}</strong>. The secure link below will connect you to their Bastly progress. If you already have a parent account, the student will be linked to it.`,
      buttonLabel: 'Open my invitation',
      buttonUrl: inviteUrl,
    }),
  });
}

export async function sendVerificationEmail({ email, fullName, verificationUrl }) {
  return sendEmail({
    to: email,
    subject: 'Verify your Bastly email',
    developmentUrl: verificationUrl,
    text: `Hi ${fullName}, verify your Bastly email here: ${verificationUrl}`,
    html: emailShell({
      eyebrow: 'Email verification',
      title: 'One quick check.',
      body: `Hi ${fullName},<br><br>Verify your email to finish securing your Bastly account.`,
      buttonLabel: 'Verify my email',
      buttonUrl: verificationUrl,
    }),
  });
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  return sendEmail({
    to: email,
    subject: 'Reset your Bastly password',
    developmentUrl: resetUrl,
    text: `Hi ${fullName}, reset your Bastly password here: ${resetUrl}`,
    html: emailShell({
      eyebrow: 'Password reset',
      title: 'Reset your password.',
      body: `Hi ${fullName},<br><br>Someone requested a password reset for your Bastly account. This link expires shortly. If it was not you, you can ignore this email.`,
      buttonLabel: 'Reset password',
      buttonUrl: resetUrl,
    }),
  });
}
