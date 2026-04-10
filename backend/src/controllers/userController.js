import { User, UserPreference, College, Grade } from '../models/index.js'

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
    'name', 'gender', 'birth_date', 'college', 'major', 'grade',
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
  const { preferred_gender, min_age, max_age, preferred_colleges } = ctx.request.body
  
  let preference = await UserPreference.findOne({ where: { user_id: userId } })
  
  if (!preference) {
    preference = await UserPreference.create({
      user_id: userId,
      preferred_gender: preferred_gender || 'both',
      min_age: min_age || 18,
      max_age: max_age || 25,
      preferred_colleges: preferred_colleges || []
    })
  } else {
    await preference.update({
      preferred_gender: preferred_gender || preference.preferred_gender,
      min_age: min_age || preference.min_age,
      max_age: max_age || preference.max_age,
      preferred_colleges: preferred_colleges || preference.preferred_colleges
    })
  }
  
  ctx.body = {
    success: true,
    data: preference.toJSON(),
    message: '偏好设置更新成功'
  }
}

const getColleges = async (ctx) => {
  const colleges = await College.findAll({
    order: [['sort_order', 'ASC'], ['name', 'ASC']]
  })
  
  ctx.body = {
    success: true,
    data: { colleges }
  }
}

const getGrades = async (ctx) => {
  const grades = await Grade.findAll({
    order: [['sort_order', 'ASC']]
  })
  
  ctx.body = {
    success: true,
    data: { grades }
  }
}

export {
  getProfile,
  updateProfile,
  updatePreferences,
  getColleges,
  getGrades
}
