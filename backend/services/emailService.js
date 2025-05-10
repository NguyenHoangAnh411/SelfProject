const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Xác thực email của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Xác thực email của bạn</h2>
          <p>Xin chào,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấp vào nút bên dưới để xác thực email của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Xác thực email
            </a>
          </div>
          <p>Hoặc bạn có thể copy và paste đường link sau vào trình duyệt:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>Link này sẽ hết hạn sau 24 giờ.</p>
          <p>Nếu bạn không yêu cầu xác thực email này, vui lòng bỏ qua email này.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác thực tài khoản',
      html: `<p>Mã xác thực của bạn là: <b>${code}</b></p><p>Mã này có hiệu lực trong 15 phút.</p>`
    };
    await transporter.sendMail(mailOptions);
    console.log('Verification code sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw new Error('Failed to send verification code');
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationCode
}; 