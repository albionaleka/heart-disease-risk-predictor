import nodemailer from 'nodemailer';
import 'dotenv/config';

const getSmtpConfig = () => {
    const provider = process.env.SMTP_PROVIDER?.toLowerCase() || 'gmail';
    
    if (provider === 'gmail' || !process.env.SMTP_HOST) {
        return {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };
    }
    
    return {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
    };
};

const transporter = nodemailer.createTransport(getSmtpConfig());

transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP configuration error:', error.message);
        console.log('Please check your SMTP settings in .env file');
    } else {
        console.log('SMTP server is ready to send messages');
    }
});

export default transporter;