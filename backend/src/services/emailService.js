import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'
import { EmailTemplateConfig } from '../models/index.js'

const DEFAULT_MATCH_SYSTEM_PROMPT = '你擅长写自然、真诚、克制的校园交友助攻文案。'
const DEFAULT_MATCH_RULES = [
  '你是校园匿名配对平台的邮件文案助手。',
  '请结合双方资料，写一段风趣但克制、不油腻、不冒犯的“助攻建议”。',
  '要求：',
  '1. 使用简体中文；',
  '2. 1-2句，总字数不超过70字；',
  '3. 不编造资料中不存在的信息；',
  '4. 不出现露骨、低俗、歧视内容；',
  '5. 直接输出文案，不要标题，不要解释。'
].join('\n')
const DEFAULT_PAIRING_SYSTEM_PROMPT = DEFAULT_MATCH_SYSTEM_PROMPT
const DEFAULT_PAIRING_RULES = DEFAULT_MATCH_RULES

class EmailService {
  constructor() {
    this.transporter = null
    this.configCache = null
    this.configCacheAt = 0
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

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  buildUserProfileSummary(user = {}) {
    const genderMap = {
      male: '男',
      female: '女',
      other: '其他'
    }
    return {
      nickname: user.nickname || user.name || '未设置',
      gender: genderMap[user.gender] || '未设置',
      campus: user.campus || '未设置',
      college: user.college || '未设置',
      major: user.major || '未设置',
      grade: user.grade || '未设置',
      bio: (user.bio || '').slice(0, 200) || '未填写'
    }
  }

  buildFallbackWingmanLine(receiver, matchUser) {
    const receiverName = receiver.nickname || receiver.name || '同学'
    const matchName = matchUser.nickname || matchUser.name || 'TA'
    const major = matchUser.major && matchUser.major !== '你猜' ? matchUser.major : '神秘专业'
    return `${receiverName}，本周你与 ${matchName} 完成了同频匹配。TA 来自 ${major}，不妨从课程、食堂和校园日常先开启第一句，轻松一点更容易聊开。`
  }

  buildPairingTemplateLine(receiver, matchUser) {
    const receiverName = receiver.nickname || receiver.name || '同学'
    const matchName = matchUser.nickname || matchUser.name || '对方'
    return `${receiverName}，你和 ${matchName} 已顺利双向解锁。建议先从最近课程、校园日常轻松开场，真诚交流更容易拉近距离。`
  }

  async getTemplateConfig() {
    const now = Date.now()
    if (this.configCache && now - this.configCacheAt < 30000) {
      return this.configCache
    }
    let config = await EmailTemplateConfig.findOne({
      order: [['id', 'ASC']]
    })
    if (!config) {
      config = await EmailTemplateConfig.create({
        ai_enabled: true,
        temperature: 0.7,
        max_tokens: 180,
        match_system_prompt: DEFAULT_MATCH_SYSTEM_PROMPT,
        match_user_rules: DEFAULT_MATCH_RULES,
        pairing_system_prompt: DEFAULT_PAIRING_SYSTEM_PROMPT,
        pairing_user_rules: DEFAULT_PAIRING_RULES
      })
    }
    this.configCache = config
    this.configCacheAt = now
    return config
  }

  clearTemplateConfigCache() {
    this.configCache = null
    this.configCacheAt = 0
  }

  async generateWingmanLine(receiver, matchUser, options = {}) {
    const { scene = 'match_notification' } = options
    const apiKey = process.env.MATCH_AI_API_KEY
    const apiUrl = process.env.MATCH_AI_API_URL
    const model = process.env.MATCH_AI_MODEL
    const config = await this.getTemplateConfig()
    if (!config.ai_enabled || !apiKey || !apiUrl || !model) {
      return this.buildFallbackWingmanLine(receiver, matchUser)
    }

    const receiverProfile = this.buildUserProfileSummary(receiver)
    const matchProfile = this.buildUserProfileSummary(matchUser)
    const isPairingScene = scene === 'pairing_unlocked'
    const userRules = isPairingScene
      ? (config.pairing_user_rules || DEFAULT_PAIRING_RULES)
      : (config.match_user_rules || DEFAULT_MATCH_RULES)
    const systemPrompt = isPairingScene
      ? (config.pairing_system_prompt || DEFAULT_PAIRING_SYSTEM_PROMPT)
      : (config.match_system_prompt || DEFAULT_MATCH_SYSTEM_PROMPT)
    const prompt = [
      userRules,
      '',
      `收件人资料：${JSON.stringify(receiverProfile)}`,
      `匹配对象资料：${JSON.stringify(matchProfile)}`
    ].join('\n')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: Number(config.temperature || 0.7),
          max_tokens: Number(config.max_tokens || 180),
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })
      if (!response.ok) {
        throw new Error(`match ai http status ${response.status}`)
      }
      const data = await response.json()
      const generated = data?.choices?.[0]?.message?.content?.trim()
      if (!generated) {
        throw new Error('match ai empty content')
      }
      return generated.slice(0, 120)
    } catch (error) {
      logger.warn('Generate wingman line failed, fallback applied:', error.message)
      return this.buildFallbackWingmanLine(receiver, matchUser)
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
    const userDisplayName = user.nickname || user.name || '同学'
    const matchDisplayName = matchUser.nickname || '未设置'
    
    const wingmanLine = await this.generateWingmanLine(user, matchUser, { scene: 'match_notification' })

    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '【CSUST DateDrop】本周为您匹配到了新对象！',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的 ${userDisplayName}：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">本周二，我们为您匹配到了一位新的对象！</p>
          
          <div style="background: #f5f5f5; padding: 30px; margin: 30px 0;">
            <h3 style="color: #000; margin-top: 0;">【匹配对象信息】</h3>
            <p style="color: #333; font-size: 15px; line-height: 1.8;">
              <strong>昵称：</strong>${matchDisplayName}<br>
              <strong>性别：</strong>${genderMap[matchUser.gender] || '未设置'}<br>
              <strong>学院：</strong>${matchUser.college || '未设置'}<br>
              <strong>专业：</strong>${matchUser.major || '未设置'}<br>
              <strong>年级：</strong>${matchUser.grade || '未设置'}
            </p>
            
            ${matchUser.bio ? `
              <h4 style="color: #000; margin-top: 20px;">【个人简介】</h4>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">${this.escapeHtml(matchUser.bio)}</p>
            ` : ''}
          </div>

          <div style="background: #fff9ef; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.7;">
              <strong>本周助攻：</strong>${this.escapeHtml(wingmanLine)}
            </p>
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

  async sendPairingUnlocked(user, matchUser) {
    if (!this.transporter) {
      logger.info(`[DEV MODE] Pairing unlocked notification for ${user.email}`)
      return { messageId: 'dev-mode' }
    }

    const matchDisplayName = matchUser.name || matchUser.nickname || '对方'
    const wingmanLine = this.buildPairingTemplateLine(user, matchUser)
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '【CSUST DateDrop】你们已双向解锁，联系方式已开放',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">恭喜你们双向解锁成功！</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.8;">
            你与 ${matchDisplayName} 已完成双向解锁，以下是对方联系方式：
          </p>
          <div style="background: #f5f5f5; padding: 24px; margin: 24px 0;">
            <p style="margin: 8px 0;"><strong>邮箱：</strong>${matchUser.email || '未设置'}</p>
            <p style="margin: 8px 0;"><strong>微信：</strong>${matchUser.wechat || '未设置'}</p>
            <p style="margin: 8px 0;"><strong>QQ：</strong>${matchUser.qq || '未设置'}</p>
            <p style="margin: 8px 0;"><strong>电话：</strong>${matchUser.phone || '未设置'}</p>
          </div>
          <div style="background: #fff9ef; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.7;">
              <strong>助攻一句：</strong>${this.escapeHtml(wingmanLine)}
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">祝你们相处愉快。</p>
        </div>
      `
    }
    return this.sendMail(mailOptions)
  }

  renderTemplate(template = '', variables = {}) {
    return String(template).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const value = variables[key]
      if (value === undefined || value === null) {
        return ''
      }
      return String(value)
    })
  }

  async sendCustomTemplateEmail(user, {
    subject,
    htmlTemplate
  }) {
    if (!this.transporter) {
      logger.info(`[DEV MODE] Custom email for ${user.email}: ${subject}`)
      return { messageId: 'dev-mode' }
    }
    const genderMap = {
      male: '男',
      female: '女',
      other: '其他'
    }
    const variables = {
      id: user.id,
      email: user.email || '',
      nickname: user.nickname || '',
      name: user.name || '',
      gender: genderMap[user.gender] || '',
      campus: user.campus || '',
      college: user.college || '',
      major: user.major || '',
      grade: user.grade || '',
      bio: user.bio || '',
      wechat: user.wechat || '',
      qq: user.qq || '',
      phone: user.phone || ''
    }
    const renderedHtml = this.renderTemplate(htmlTemplate || '', variables)
    const mailOptions = {
      from: `"CSUST DateDrop Admin" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject || '【CSUST DateDrop】通知',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          ${renderedHtml}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af;">此邮件由管理员后台发送。</p>
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
