import { Op } from 'sequelize'
import { Match, Pairing, QuestionnaireAnswer, QuestionnaireQuestion, User, UserPreference } from '../models/index.js'
import emailService from './emailService.js'

const getWeekInfo = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7)
  const year = utcDate.getUTCFullYear()
  return {
    year,
    weekNumber,
    weekKey: `${year}-W${weekNumber}`
  }
}

const normalizeAnswer = (value) => {
  if (Array.isArray(value)) {
    return [...value].sort()
  }
  return value
}

const calculateAnswerSimilarity = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    const setA = new Set(a)
    const setB = new Set(b)
    const intersection = [...setA].filter(item => setB.has(item)).length
    const union = new Set([...a, ...b]).size
    return union === 0 ? 0 : intersection / union
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b ? 1 : 0
  }
  return 0
}

const buildAnswerMap = async (userId) => {
  const answers = await QuestionnaireAnswer.findAll({
    where: { user_id: userId },
    include: [
      {
        model: QuestionnaireQuestion,
        as: 'question'
      }
    ]
  })
  const answerMap = new Map()
  for (const item of answers) {
    answerMap.set(item.question_id, {
      value: normalizeAnswer(item.answer_value),
      weight: item.question?.weight || 1
    })
  }
  return answerMap
}

const checkPreference = (user, preference, target) => {
  if (!preference) {
    return true
  }
  if (preference.preferred_gender !== 'both' && target.gender && preference.preferred_gender !== target.gender) {
    return false
  }
  if (preference.preferred_colleges?.length > 0 && target.college) {
    return preference.preferred_colleges.includes(target.college)
  }
  return true
}

const calculateCompatibility = async (userA, userB) => {
  const [mapA, mapB] = await Promise.all([buildAnswerMap(userA.id), buildAnswerMap(userB.id)])
  if (mapA.size === 0 || mapB.size === 0) {
    return 0
  }
  let totalWeight = 0
  let score = 0
  for (const [questionId, answerA] of mapA.entries()) {
    const answerB = mapB.get(questionId)
    if (!answerB) {
      continue
    }
    const weight = (answerA.weight + answerB.weight) / 2
    totalWeight += weight
    score += calculateAnswerSimilarity(answerA.value, answerB.value) * weight
  }
  if (totalWeight === 0) {
    return 0
  }
  return Number(((score / totalWeight) * 100).toFixed(2))
}

const getUserCurrentMatch = async (userId) => {
  const { weekKey } = getWeekInfo()
  return Match.findOne({
    where: {
      week_key: weekKey,
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    }
  })
}

const createPairingFromMatch = async (match, unlockedByUserId) => {
  const existing = await Pairing.findOne({ where: { match_id: match.id } })
  if (existing) {
    return existing
  }
  return Pairing.create({
    match_id: match.id,
    user1_id: match.user1_id,
    user2_id: match.user2_id,
    status: 'active',
    ended_by: unlockedByUserId
  })
}

const runWeeklyMatching = async () => {
  const { weekKey, weekNumber, year } = getWeekInfo()
  const existingCount = await Match.count({ where: { week_key: weekKey } })
  if (existingCount > 0) {
    return { created: 0, skipped: true, weekKey }
  }

  const allUsers = await User.findAll({
    where: {
      status: 'active'
    }
  })
  const users = []
  for (const user of allUsers) {
    const answerCount = await QuestionnaireAnswer.count({ where: { user_id: user.id } })
    if (answerCount >= 3) {
      users.push(user)
    }
  }

  const available = [...users]
  let created = 0
  while (available.length > 1) {
    const user = available.shift()
    const preference = await UserPreference.findOne({ where: { user_id: user.id } })
    let bestIndex = -1
    let bestScore = -1
    for (let i = 0; i < available.length; i += 1) {
      const candidate = available[i]
      const candidatePreference = await UserPreference.findOne({ where: { user_id: candidate.id } })
      if (!checkPreference(user, preference, candidate) || !checkPreference(candidate, candidatePreference, user)) {
        continue
      }
      const score = await calculateCompatibility(user, candidate)
      if (score > bestScore) {
        bestScore = score
        bestIndex = i
      }
    }
    if (bestIndex === -1) {
      continue
    }
    const partner = available.splice(bestIndex, 1)[0]
    const match = await Match.create({
      user1_id: user.id,
      user2_id: partner.id,
      week_key: weekKey,
      week_number: weekNumber,
      year,
      match_score: bestScore,
      status: 'pending'
    })
    created += 1
    await Promise.all([
      emailService.sendMatchNotification(user, partner),
      emailService.sendMatchNotification(partner, user)
    ])
    await match.reload()
  }
  return { created, skipped: false, weekKey }
}

export {
  calculateCompatibility,
  getWeekInfo,
  getUserCurrentMatch,
  createPairingFromMatch,
  runWeeklyMatching
}
