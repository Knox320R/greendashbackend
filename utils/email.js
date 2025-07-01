const nodemailer = require('nodemailer');

// Create transporter for email sending
const createTransporter = () => {
  // Use SendGrid if API key is provided
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Use SMTP if configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to mock transporter for development
  return nodemailer.createTransporter({
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: {
      user: 'test',
      pass: 'test'
    }
  });
};

const transporter = createTransporter();

// Send verification email
const sendVerificationEmail = async (email, token, referralLink) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://greendash.io'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@greendash.io',
      to: email,
      subject: 'Verify Your Email - GreenDash',
      html: `
        <h2>Welcome to GreenDash!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>Your referral link: ${referralLink}</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] Verification email to ${email}: ${verificationUrl}`);
      return Promise.resolve();
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw error to prevent registration failure
    return Promise.resolve();
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://greendash.io'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@greendash.io',
      to: email,
      subject: 'Reset Your Password - GreenDash',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    };

    if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] Password reset email to ${email}: ${resetUrl}`);
      return Promise.resolve();
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw error to prevent password reset failure
    return Promise.resolve();
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@greendash.io',
      to: email,
      subject: 'Welcome to GreenDash!',
      html: `
        <h2>Welcome to GreenDash, ${firstName}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Here are some things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our staking packages</li>
          <li>Invite friends using your referral link</li>
          <li>Start earning rewards</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy staking!</p>
        <p>The GreenDash Team</p>
      `
    };

    if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] Welcome email to ${email}`);
      return Promise.resolve();
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error to prevent registration failure
    return Promise.resolve();
  }
};

// Send withdrawal notification
const sendWithdrawalNotification = async (email, amount, currency, status) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@greendash.io',
      to: email,
      subject: `Withdrawal ${status} - GreenDash`,
      html: `
        <h2>Withdrawal ${status}</h2>
        <p>Your withdrawal request for ${amount} ${currency} has been ${status}.</p>
        <p>Amount: ${amount} ${currency}</p>
        <p>Status: ${status}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you for using GreenDash!</p>
      `
    };

    if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY && !process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] Withdrawal notification to ${email}: ${amount} ${currency} - ${status}`);
      return Promise.resolve();
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`Withdrawal notification sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending withdrawal notification:', error);
    // Don't throw error to prevent withdrawal processing failure
    return Promise.resolve();
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendWithdrawalNotification
}; 