const colleges = [
  { name: '土木工程学院', sort_order: 1 },
  { name: '交通运输工程学院', sort_order: 2 },
  { name: '水利工程学院', sort_order: 3 },
  { name: '电气与信息工程学院', sort_order: 4 },
  { name: '能源与动力工程学院', sort_order: 5 },
  { name: '机械工程学院', sort_order: 6 },
  { name: '材料科学与工程学院', sort_order: 7 },
  { name: '化学与食品工程学院', sort_order: 8 },
  { name: '经济与管理学院', sort_order: 9 },
  { name: '文学与新闻传播学院', sort_order: 10 },
  { name: '外国语学院', sort_order: 11 },
  { name: '数学与统计学院', sort_order: 12 },
  { name: '物理与电子科学学院', sort_order: 13 },
  { name: '计算机学院', sort_order: 14 },
  { name: '建筑学院', sort_order: 15 },
  { name: '设计艺术学院', sort_order: 16 },
  { name: '法学院', sort_order: 17 },
  { name: '马克思主义学院', sort_order: 18 },
  { name: '体育学院', sort_order: 19 },
  { name: '国际教育学院', sort_order: 20 }
]

const grades = [
  { name: '大一', sort_order: 1 },
  { name: '大二', sort_order: 2 },
  { name: '大三', sort_order: 3 },
  { name: '大四', sort_order: 4 },
  { name: '研一', sort_order: 5 },
  { name: '研二', sort_order: 6 },
  { name: '研三', sort_order: 7 },
  { name: '博士', sort_order: 8 }
]

const interests = [
  { name: '编程', category: '科技', sort_order: 1 },
  { name: '音乐', category: '艺术', sort_order: 2 },
  { name: '运动', category: '生活', sort_order: 3 },
  { name: '阅读', category: '文化', sort_order: 4 },
  { name: '旅行', category: '生活', sort_order: 5 },
  { name: '摄影', category: '艺术', sort_order: 6 },
  { name: '游戏', category: '娱乐', sort_order: 7 },
  { name: '电影', category: '娱乐', sort_order: 8 },
  { name: '美食', category: '生活', sort_order: 9 },
  { name: '绘画', category: '艺术', sort_order: 10 },
  { name: '健身', category: '运动', sort_order: 11 },
  { name: '羽毛球', category: '运动', sort_order: 12 }
]

const questionnaireQuestions = [
  {
    question_code: 'Q1',
    section: 'appearance',
    section_title: '外貌与生活方式',
    question_text: '你的作息更接近哪一种？',
    question_type: 'single',
    options: ['早睡早起', '规律', '偏夜猫子'],
    weight: 1.2,
    sort_order: 1
  },
  {
    question_code: 'Q2',
    section: 'personality',
    section_title: '性格特征',
    question_text: '你更偏向哪种社交方式？',
    question_type: 'single',
    options: ['安静独处', '小圈子相处', '主动社交'],
    weight: 1.4,
    sort_order: 2
  },
  {
    question_code: 'Q3',
    section: 'values',
    section_title: '价值观',
    question_text: '你对感情中的沟通频率期待是？',
    question_type: 'single',
    options: ['每天沟通', '2-3天一次', '顺其自然'],
    weight: 1.5,
    sort_order: 3
  },
  {
    question_code: 'Q4',
    section: 'interests',
    section_title: '兴趣爱好',
    question_text: '你常见的休闲活动有哪些？',
    question_type: 'multiple',
    options: ['运动', '追剧/电影', '阅读', '游戏', '户外'],
    weight: 1.3,
    sort_order: 4
  },
  {
    question_code: 'Q5',
    section: 'expectation',
    section_title: '关系期待',
    question_text: '你希望另一半更看重什么？',
    question_type: 'single',
    options: ['责任感', '沟通能力', '共同兴趣'],
    weight: 1.6,
    sort_order: 5
  },
  {
    question_code: 'Q6',
    section: 'additional',
    section_title: '附加问题',
    question_text: '请用一句话描述理想关系',
    question_type: 'text',
    options: null,
    weight: 1,
    sort_order: 6
  }
]

export {
  colleges,
  grades,
  interests,
  questionnaireQuestions
}
