import { User, UserPreference, College, Grade } from '../models/index.js'
import { collegeMajors } from '../database/baseData.js'
import { sequelize } from '../config/database.js'

const USER_META_CACHE_TTL_MS = Number(process.env.USER_META_CACHE_TTL_MS || 10 * 60 * 1000)
const userMetaCache = {
  colleges: { value: null, expiresAt: 0 },
  grades: { value: null, expiresAt: 0 },
  majors: { value: null, expiresAt: 0 }
}

const getCachedMeta = async (key, loader) => {
  const now = Date.now()
  const cacheItem = userMetaCache[key]
  if (cacheItem.value && cacheItem.expiresAt > now) {
    return cacheItem.value
  }
  const value = await loader()
  userMetaCache[key] = {
    value,
    expiresAt: now + USER_META_CACHE_TTL_MS
  }
  return value
}

const getDefaultPreferredGender = (gender) => {
  if (gender === 'male') {
    return 'female'
  }
  if (gender === 'female') {
    return 'male'
  }
  return 'both'
}

const getProfile = async (ctx) => {
  const user = await User.findByPk(ctx.state.user.id, {
    include: [{
      model: UserPreference,
      as: 'preferences'
    }]
  })
  
  if (!user) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
    return
  }
  
  ctx.body = {
    success: true,
    data: {
      user: user.toJSON(),
      preferences: user.preferences || {}
    }
  }
}

const updateProfile = async (ctx) => {
  const userId = ctx.state.user.id
  const updateData = ctx.request.body
  
  const allowedFields = [
    'nickname', 'name', 'gender', 'campus', 'college', 'major', 'grade',
    'bio', 'wechat', 'qq', 'phone'
  ]
  
  const filteredData = {}
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field]
    }
  }
  
  const user = await User.findByPk(userId)
  
  if (!user) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
    return
  }
  
  await user.update(filteredData)
  
  ctx.body = {
    success: true,
    data: user.toJSON(),
    message: '资料更新成功'
  }
}

const updatePreferences = async (ctx) => {
  const userId = ctx.state.user.id
  const {
    preferred_gender,
    preferred_colleges,
    preferred_campus,
    preferred_college,
    preferred_major,
    preferred_grade
  } = ctx.request.body
  const user = await User.findByPk(userId)
  const fallbackPreferredGender = getDefaultPreferredGender(user?.gender)
  
  let preference = await UserPreference.findOne({ where: { user_id: userId } })
  const nextOtherPreferences = {
    preferred_campus: preferred_campus || '',
    preferred_college: preferred_college || '',
    preferred_major: preferred_major || '',
    preferred_grade: preferred_grade || ''
  }
  
  if (!preference) {
    preference = await UserPreference.create({
      user_id: userId,
      preferred_gender: preferred_gender || fallbackPreferredGender,
      preferred_colleges: preferred_colleges || [],
      other_preferences: nextOtherPreferences
    })
  } else {
    const mergedOtherPreferences = {
      ...(preference.other_preferences || {}),
      ...nextOtherPreferences
    }
    await preference.update({
      preferred_gender: preferred_gender || preference.preferred_gender,
      preferred_colleges: preferred_colleges || preference.preferred_colleges,
      other_preferences: mergedOtherPreferences
    })
  }
  
  ctx.body = {
    success: true,
    data: preference.toJSON(),
    message: '偏好设置更新成功'
  }
}

const updateProfileAndPreferences = async (ctx) => {
  const userId = ctx.state.user.id
  const payload = ctx.request.body || {}
  const allowedProfileFields = [
    'nickname', 'name', 'gender', 'campus', 'college', 'major', 'grade',
    'bio', 'wechat', 'qq', 'phone'
  ]
  const profileUpdates = {}
  for (const field of allowedProfileFields) {
    if (payload[field] !== undefined) {
      profileUpdates[field] = payload[field]
    }
  }

  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction })
    if (!user) {
      return null
    }
    if (Object.keys(profileUpdates).length > 0) {
      await user.update(profileUpdates, { transaction })
    }

    const {
      preferred_gender,
      preferred_colleges,
      preferred_campus,
      preferred_college,
      preferred_major,
      preferred_grade
    } = payload
    const fallbackPreferredGender = getDefaultPreferredGender(user.gender)
    let preference = await UserPreference.findOne({
      where: { user_id: userId },
      transaction
    })
    const nextOtherPreferences = {
      preferred_campus: preferred_campus || '',
      preferred_college: preferred_college || '',
      preferred_major: preferred_major || '',
      preferred_grade: preferred_grade || ''
    }

    if (!preference) {
      preference = await UserPreference.create({
        user_id: userId,
        preferred_gender: preferred_gender || fallbackPreferredGender,
        preferred_colleges: preferred_colleges || [],
        other_preferences: nextOtherPreferences
      }, { transaction })
    } else {
      const mergedOtherPreferences = {
        ...(preference.other_preferences || {}),
        ...nextOtherPreferences
      }
      await preference.update({
        preferred_gender: preferred_gender || preference.preferred_gender || fallbackPreferredGender,
        preferred_colleges: preferred_colleges || preference.preferred_colleges,
        other_preferences: mergedOtherPreferences
      }, { transaction })
    }

    return {
      user: user.toJSON(),
      preferences: preference.toJSON()
    }
  })

  if (!result) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
    return
  }

  ctx.body = {
    success: true,
    data: result,
    message: '资料与偏好更新成功'
  }
}

const getColleges = async (ctx) => {
  const colleges = await getCachedMeta('colleges', async () => {
    return College.findAll({
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    })
  })
  
  ctx.body = {
    success: true,
    data: { colleges }
  }
}

const getGrades = async (ctx) => {
  const grades = await getCachedMeta('grades', async () => {
    return Grade.findAll({
      order: [['sort_order', 'ASC']]
    })
  })
  
  ctx.body = {
    success: true,
    data: { grades }
  }
}

const getCollegeMajors = async (ctx) => {
  const majorsMap = await getCachedMeta('majors', async () => collegeMajors)
  const { college } = ctx.query
  if (college) {
    ctx.body = {
      success: true,
      data: {
        college,
        majors: majorsMap[college] || []
      }
    }
    return
  }
  ctx.body = {
    success: true,
    data: {
      college_majors: majorsMap
    }
  }
}

export {
  getProfile,
  updateProfile,
  updatePreferences,
  updateProfileAndPreferences,
  getColleges,
  getGrades,
  getCollegeMajors
}
