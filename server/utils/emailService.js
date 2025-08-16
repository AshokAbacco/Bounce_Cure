import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'xemail.test.2025@gmail.com',
      subject: 'Your 2FA Code',
      text,
    });

    console.log('Email sent:', data);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email send failed');
  }
};

export default sendEmail;
