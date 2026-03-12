import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendPasswordResetEmail(to, resetLink) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #007BFF;">Password Reset Request</h2>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best regards,<br>Your Company Team</p>
            </div>
        `,
    });
}