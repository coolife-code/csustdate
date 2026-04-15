import { Op, fn, col, literal } from 'sequelize'
import { Match, Pairing, QuestionnaireAnswer, QuestionnaireQuestion, User, UserPreference } from '../models/index.js'
import { enqueueEmailNotification } from './emailQueueService.js'

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

const buildAnswerMapsForUsers = async (userIds) => {
  const maps = new Map(userIds.map((id) => [id, new Map()]))
  if (userIds.length === 0) {
    return maps
  }
  const answers = await QuestionnaireAnswer.findAll({
    where: { user_id: userIds },
    include: [
      {
        model: QuestionnaireQuestion,
        as: 'question'
      }
    ]
  })
  for (const item of answers) {
    if (!maps.has(item.user_id)) {
      maps.set(item.user_id, new Map())
    }
    maps.get(item.user_id).set(item.question_id, {
      value: normalizeAnswer(item.answer_value),
      weight: item.question?.weight || 1
    })
  }
  return maps
}

const calculateCompatibilityFromMaps = (mapA, mapB) => {
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

const calculateCompatibility = async (userA, userB) => {
  const maps = await buildAnswerMapsForUsers([userA.id, userB.id])
  return calculateCompatibilityFromMaps(maps.get(userA.id) || new Map(), maps.get(userB.id) || new Map())
}

const getOtherPreferences = (preference) => preference?.other_preferences || {}

const isGenderMatched = (preference, target) => {
  if (!preference || preference.preferred_gender === 'both') {
    return true
  }
  if (!target.gender) {
    return false
  }
  return preference.preferred_gender === target.gender
}

const isCampusMatched = (preference, target) => {
  const preferredCampus = getOtherPreferences(preference).preferred_campus
  if (!preferredCampus) {
    return true
  }
  if (!target.campus) {
    return false
  }
  return target.campus === preferredCampus
}

const isGradeMatched = (preference, target) => {
  const preferredGrade = getOtherPreferences(preference).preferred_grade
  if (!preferredGrade) {
    return true
  }
  if (!target.grade) {
    return false
  }
  return target.grade === preferredGrade
}

const isCollegeMatched = (preference, target) => {
  if (!preference) {
    return true
  }
  const otherPreferences = getOtherPreferences(preference)
  if (preference.preferred_colleges?.length > 0) {
    if (!target.college || !preference.preferred_colleges.includes(target.college)) {
      return false
    }
  }
  if (otherPreferences.preferred_college) {
    if (!target.college || target.college !== otherPreferences.preferred_college) {
      return false
    }
  }
  return true
}

const isMajorMatched = (preference, target) => {
  const preferredMajor = getOtherPreferences(preference).preferred_major
  if (!preferredMajor) {
    return true
  }
  if (!target.major || target.major === '你猜') {
    return false
  }
  return target.major === preferredMajor
}

const criteriaCheckers = {
  gender: isGenderMatched,
  campus: isCampusMatched,
  grade: isGradeMatched,
  college: isCollegeMatched,
  major: isMajorMatched
}

const isPreferenceMatched = (preference, target, requiredCriteria) => {
  return requiredCriteria.every((criterion) => criteriaCheckers[criterion](preference, target))
}

const isMutualPreferenceMatched = (user, userPreference, candidate, candidatePreference, requiredCriteria) => {
  return isPreferenceMatched(userPreference, candidate, requiredCriteria)
    && isPreferenceMatched(candidatePreference, user, requiredCriteria)
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

const autoUnlockExpiredPendingMatches = async () => {
  const autoUnlockHours = Number(process.env.MATCH_AUTO_UNLOCK_HOURS || 5)
  const cutoffTime = new Date(Date.now() - autoUnlockHours * 60 * 60 * 1000)
  const matches = await Match.findAll({
    where: {
      // Auto unlock all timeout matches as long as neither side has skipped.
      status: {
        [Op.in]: ['pending', 'user1_unlocked', 'user2_unlocked']
      },
      createdAt: {
        [Op.lte]: cutoffTime
      }
    },
    order: [['created_at', 'ASC']]
  })
  if (matches.length === 0) {
    return { scanned: 0, autoUnlocked: 0 }
  }
  let autoUnlocked = 0
  for (const match of matches) {
    if (match.status === 'both_unlocked' || match.status === 'both_skipped' || match.status === 'user1_skipped' || match.status === 'user2_skipped') {
      continue
    }
    match.status = 'both_unlocked'
    await match.save()
    await createPairingFromMatch(match, null)
    const [user1, user2] = await Promise.all([
      User.findByPk(match.user1_id),
      User.findByPk(match.user2_id)
    ])
    if (user1 && user2) {
      await Promise.allSettled([
        enqueueEmailNotification({
          type: 'pairing_unlocked',
          toUserId: user1.id,
          matchUserId: user2.id,
          matchId: match.id,
          priority: 80
        }),
        enqueueEmailNotification({
          type: 'pairing_unlocked',
          toUserId: user2.id,
          matchUserId: user1.id,
          matchId: match.id,
          priority: 80
        })
      ])
    }
    autoUnlocked += 1
  }
  return {
    scanned: matches.length,
    autoUnlocked
  }
}

const runWeeklyMatching = async () => {
  const { weekKey, weekNumber, year } = getWeekInfo()
  const existingCount = await Match.count({ where: { week_key: weekKey } })
  if (existingCount > 0) {
    return { created: 0, skipped: true, weekKey }
  }

  const answeredUsers = await QuestionnaireAnswer.findAll({
    attributes: ['user_id', [fn('COUNT', col('id')), 'answer_count']],
    group: ['user_id'],
    having: literal('COUNT(id) >= 3')
  })
  const answeredUserIds = answeredUsers.map((item) => item.user_id)
  if (answeredUserIds.length === 0) {
    return { created: 0, skipped: false, weekKey }
  }

  const users = await User.findAll({
    where: {
      status: 'active',
      id: answeredUserIds
    },
    include: [{
      model: UserPreference,
      as: 'preferences',
      required: false
    }]
  })
  const answerMaps = await buildAnswerMapsForUsers(users.map((user) => user.id))
  const preferenceMap = new Map(users.map((user) => [user.id, user.preferences || null]))
  const fallbackCriteriaLevels = [
    ['gender', 'campus', 'grade', 'college', 'major'],
    ['gender', 'campus', 'grade', 'college'],
    ['gender', 'campus', 'grade'],
    ['gender', 'campus'],
    ['gender']
  ]

  const available = [...users]
  let created = 0
  while (available.length > 1) {
    const user = available.shift()
    const preference = preferenceMap.get(user.id) || null
    let bestIndex = -1
    let bestScore = -1

    for (const requiredCriteria of fallbackCriteriaLevels) {
      let levelBestIndex = -1
      let levelBestScore = -1
      for (let i = 0; i < available.length; i += 1) {
        const candidate = available[i]
        const candidatePreference = preferenceMap.get(candidate.id) || null
        if (!isMutualPreferenceMatched(user, preference, candidate, candidatePreference, requiredCriteria)) {
          continue
        }
        const score = calculateCompatibilityFromMaps(
          answerMaps.get(user.id) || new Map(),
          answerMaps.get(candidate.id) || new Map()
        )
        if (score > levelBestScore) {
          levelBestScore = score
          levelBestIndex = i
        }
      }
      if (levelBestIndex !== -1) {
        bestIndex = levelBestIndex
        bestScore = levelBestScore
        break
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
      enqueueEmailNotification({
        type: 'match_notification',
        toUserId: user.id,
        matchUserId: partner.id,
        matchId: match.id,
        priority: 100
      }),
      enqueueEmailNotification({
        type: 'match_notification',
        toUserId: partner.id,
        matchUserId: user.id,
        matchId: match.id,
        priority: 100
      })
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
  autoUnlockExpiredPendingMatches,
  runWeeklyMatching
}
