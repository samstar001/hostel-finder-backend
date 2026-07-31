// Thin wrapper around Resend. Every part of the app that needs to
// send an email calls sendEmail() — nothing else touches the Resend
// SDK directly.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: 'Hostel Finder <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Email failed to send: ${error.message}`);
  }

  return data;
};