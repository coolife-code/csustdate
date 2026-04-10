import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'

class EmailService {
  constructor() {
    this.transporter = null
    this.init()
  }
  
  init() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    } else {
      logger.warn('SMTP configuration not found, email service disabled')
    }
  }
  
  async sendVerificationCode(email, code) {
    if (!this.transporter) {
      logger.info(`[DEV MODE] Verification code for ${email}: ${code}`)
      return { messageId: 'dev-mode' }
    }
    
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【CSUST DateDrop】验证码',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的同学：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">您好！您的验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">验证码有效期为10分钟，请尽快完成验证。</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">如果这不是您的操作，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">CSUST DateDrop 团队</p>
        </div>
      `
    }
    
    return this.sendMail(mailOptions)
  }
  
  async sendMatchNotification(user, matchUser) {
    if (!this.transporter) {
      logger.info(`[DEV MODE] Match notification for ${user.email}`)
      return { messageId: 'dev-mode' }
    }
    
    const genderMap = {
      'male': '男',
      'female': '女',
      'other': '其他'
    }
    
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '【CSUST DateDrop】本周为您匹配到了新对象！',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的 ${user.name || '同学'}：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">本周二，我们为您匹配到了一位新的对象！</p>
          
          <div style="background: #f5f5f5; padding: 30px; margin: 30px 0;">
            <h3 style="color: #000; margin-top: 0;">【匹配对象信息】</h3>
            <p style="color: #333; font-size: 15px; line-height: 1.8;">
              <strong>姓名：</strong>${matchUser.name || '未设置'}<br>
              <strong>性别：</strong>${genderMap[matchUser.gender] || '未设置'}<br>
              <strong>学院：</strong>${matchUser.college || '未设置'}<br>
              <strong>专业：</strong>${matchUser.major || '未设置'}<br>
              <strong>年级：</strong>${matchUser.grade || '未设置'}
            </p>
            
            ${matchUser.bio ? `
              <h4 style="color: #000; margin-top: 20px;">【个人简介】</h4>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">${matchUser.bio}</p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/match" 
               style="display: inline-block; background: #000; color: #fff; padding: 15px 40px; 
                      text-decoration: none; font-size: 16px; font-weight: 600;">
              登录网站查看详情
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">祝您早日找到心仪的对象！</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">CSUST DateDrop 团队</p>
        </div>
      `
    }
    
    return this.sendMail(mailOptions)
  }
  
  async sendMail(mailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions)
      logger.info('Email sent:', info.messageId)
      return info
    } catch (error) {
      logger.error('Send email error:', error)
      throw error
    }
  }
}

export default new EmailService()
