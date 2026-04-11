const colleges = [
  { name: '交通学院', sort_order: 1 },
  { name: '土木与环境工程学院', sort_order: 2 },
  { name: '电气与信息工程学院', sort_order: 3 },
  { name: '经济与管理学院', sort_order: 4 },
  { name: '水利与海洋工程学院', sort_order: 5 },
  { name: '机械与运载工程学院', sort_order: 6 },
  { name: '能源与动力工程学院', sort_order: 7 },
  { name: '计算机学院', sort_order: 8 },
  { name: '航空工程学院', sort_order: 9 },
  { name: '人工智能学院', sort_order: 10 },
  { name: '建筑学院', sort_order: 11 },
  { name: '食品与生物工程学院', sort_order: 12 },
  { name: '数学与统计学院', sort_order: 13 },
  { name: '物理与电子科学学院', sort_order: 14 },
  { name: '化学与医药工程学院', sort_order: 15 },
  { name: '材料科学与工程学院', sort_order: 16 },
  { name: '马克思主义学院', sort_order: 17 },
  { name: '文学与新闻传播学院', sort_order: 18 },
  { name: '法学院', sort_order: 19 },
  { name: '外国语学院', sort_order: 20 },
  { name: '设计艺术学院', sort_order: 21 },
  { name: '体育学院', sort_order: 22 },
  { name: '国际工学院', sort_order: 23 },
  { name: '卓越工程师学院', sort_order: 24 },
  { name: '继续教育学院', sort_order: 25 },
  { name: '城南学院', sort_order: 26 }
]

const collegeMajors = {
  交通学院: ['交通运输', '交通工程'],
  土木与环境工程学院: ['土木工程', '工程力学', '城市地下空间工程', '给排水科学与工程', '建筑环境与能源应用工程', '环境工程'],
  电气与信息工程学院: ['电气工程及其自动化', '电子信息工程', '通信工程', '自动化', '轨道交通信号与控制'],
  经济与管理学院: ['金融学', '国际经济与贸易', '会计学', '财务管理', '人力资源管理', '市场营销', '工商管理'],
  水利与海洋工程学院: ['水利水电工程', '港口航道与海岸工程', '船舶与海洋工程'],
  机械与运载工程学院: ['机械设计制造及其自动化', '车辆工程', '机械电子工程', '智能制造工程'],
  能源与动力工程学院: ['能源与动力工程', '新能源科学与工程'],
  计算机学院: ['计算机科学与技术', '软件工程', '网络工程', '数据科学与大数据技术', '信息安全'],
  航空工程学院: ['飞行器设计与工程', '飞行器制造工程'],
  人工智能学院: ['人工智能', '机器人工程', '智能科学与技术'],
  建筑学院: ['建筑学', '城乡规划', '风景园林'],
  食品与生物工程学院: ['食品科学与工程', '生物工程', '生物技术'],
  数学与统计学院: ['数学与应用数学', '信息与计算科学', '应用统计学'],
  物理与电子科学学院: ['应用物理学', '电子科学与技术'],
  化学与医药工程学院: ['化学工程与工艺', '应用化学', '制药工程'],
  材料科学与工程学院: ['材料科学与工程', '无机非金属材料工程', '金属材料工程', '高分子材料与工程'],
  马克思主义学院: [],
  文学与新闻传播学院: ['汉语言文学', '新闻学'],
  法学院: ['法学'],
  外国语学院: ['英语', '翻译'],
  设计艺术学院: ['视觉传达设计', '环境设计', '产品设计', '数字媒体艺术'],
  体育学院: ['社会体育指导与管理'],
  国际工学院: ['土木工程', '电气工程及其自动化', '机械设计制造及其自动化'],
  卓越工程师学院: [],
  继续教育学院: [],
  城南学院: []
}

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
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '当你的crush发来“我去洗澡了”时，应该怎么回？',
    question_type: 'single',
    options: ['我现在没空看', '有不会洗的问我', '会洗澡的男孩真的很加分', '我要验牌', '和我聊天很脏吗？', '那就不太方便打字了，咱俩视频吧'],
    weight: 1,
    sort_order: 1
  },
  {
    question_code: 'Q2',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '当你的crush说“感觉我长得好丑”时，应该怎么回？',
    question_type: 'single',
    options: ['谁长这样都不好受', '你超好看的，别瞎想', '还好我不是你', '身材就很好了吗？', '你在质疑我的眼光吗？'],
    weight: 1,
    sort_order: 2
  },
  {
    question_code: 'Q3',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '当你的crush发来“我要睡觉了”时，应该怎么回？',
    question_type: 'single',
    options: ['人民睡了吗？你就睡', '先说晚安的明早要先说早安', '是通知还是邀请？', '羡慕觉', '祝你尿床', '好吧，那就不打扰你玩手机了'],
    weight: 1,
    sort_order: 3
  },
  {
    question_code: 'Q4',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '对象突然发来一句“在吗”，你的第一反应是？',
    question_type: 'single',
    options: ['紧张，是不是要查岗', '开心，终于找我了', '完了，又要花钱了', '先回个表情包，绝不先说话'],
    weight: 1,
    sort_order: 4
  },
  {
    question_code: 'Q5',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '人生三大错觉不包括以下哪一个？',
    question_type: 'single',
    options: ['他喜欢我', '攒点钱其实不难', '这局能赢', '我明天一定早睡'],
    weight: 1,
    sort_order: 5
  },
  {
    question_code: 'Q6',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '项目终于上线/完成后，你最想做的是？',
    question_type: 'single',
    options: ['总结经验', '立刻躺平', '发朋友圈炫耀', '换个星球生活'],
    weight: 1,
    sort_order: 6
  },
  {
    question_code: 'Q7',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你穿衣风格更像？',
    question_type: 'single',
    options: ['简约干净', '潮流酷炫', '舒服就行', '能保暖遮丑就行'],
    weight: 1,
    sort_order: 7
  },
  {
    question_code: 'Q8',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '拍照时你最常用姿势？',
    question_type: 'single',
    options: ['微笑比耶', '高冷侧脸', '搞怪鬼脸', '挡脸不露脸'],
    weight: 1,
    sort_order: 8
  },
  {
    question_code: 'Q9',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '别人对你外貌评价最常说？',
    question_type: 'single',
    options: ['帅气/漂亮', '可爱', '有气质', '看着挺精神的'],
    weight: 1,
    sort_order: 9
  },
  {
    question_code: 'Q10',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你对自己形象最大自信来源？',
    question_type: 'single',
    options: ['五官', '身材', '衣品', '心态好，丑得坦然'],
    weight: 1,
    sort_order: 10
  },
  {
    question_code: 'Q11',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '突然要见重要的人，你会？',
    question_type: 'single',
    options: ['精心打扮', '简单收拾', '洗个头就行', '无所谓，爱看不看'],
    weight: 1,
    sort_order: 11
  },
  {
    question_code: 'Q12',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '吃饭时你习惯？',
    question_type: 'single',
    options: ['认真干饭不玩手机', '边吃边刷视频', '追剧下饭', '吃两口就饱了'],
    weight: 1,
    sort_order: 12
  },
  {
    question_code: 'Q13',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你的桌面/书桌通常状态是？',
    question_type: 'single',
    options: ['整齐干净', '偶尔乱但能找到东西', '乱中有序', '乱到自己都害怕'],
    weight: 1,
    sort_order: 13
  },
  {
    question_code: 'Q14',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你最不能接受对象哪一点？',
    question_type: 'single',
    options: ['不爱干净', '冷暴力', '太粘人', '吃饭吧唧嘴'],
    weight: 1,
    sort_order: 14
  },
  {
    question_code: 'Q15',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你能接受对方熬夜打游戏吗？',
    question_type: 'single',
    options: ['完全不行', '偶尔可以', '别影响我就行', '带我一起玩'],
    weight: 1,
    sort_order: 15
  },
  {
    question_code: 'Q16',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你理想中的相处模式是？',
    question_type: 'single',
    options: ['天天腻在一起', '有空间也有陪伴', '各玩各的互不打扰', '有事联系无事消失'],
    weight: 1,
    sort_order: 16
  },
  {
    question_code: 'Q17',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '对方厨艺重要吗？',
    question_type: 'single',
    options: ['必须会做饭', '会一点就行', '会点外卖就行', '我做给他吃'],
    weight: 1,
    sort_order: 17
  },
  {
    question_code: 'Q18',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '吵架时你希望对方？',
    question_type: 'single',
    options: ['立刻哄你', '冷静后沟通', '主动认错', '别跟我吵'],
    weight: 1,
    sort_order: 18
  },
  {
    question_code: 'Q19',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '身高长相和有趣灵魂，你选？',
    question_type: 'single',
    options: ['颜值身高', '有趣灵魂', '都要', '别太丑就行'],
    weight: 1,
    sort_order: 19
  },
  {
    question_code: 'Q20',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你找对象最核心要求是？',
    question_type: 'single',
    options: ['真心爱我', '对我好', '不渣', '是个人就行'],
    weight: 1,
    sort_order: 20
  },
  {
    question_code: 'Q21',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你觉得自己本质上更像？',
    question_type: 'single',
    options: ['精致人类', '情绪不稳定的小动物', '会走路的WiFi依赖机', '凑活活着的随机事件'],
    weight: 1,
    sort_order: 21
  },
  {
    question_code: 'Q22',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你觉得自己的社交天赋是？',
    question_type: 'single',
    options: ['社交天花板', '正常交流没问题', '线上社牛线下隐身', '人类阅读理解能力为零'],
    weight: 1,
    sort_order: 22
  },
  {
    question_code: 'Q23',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '被人误解、心里委屈时，你会？',
    question_type: 'single',
    options: ['我只是给了他们安稳的生活', '这也是一种修行', '没有那回事！', '绝境与极寒绝不是旅途的尽头', '不必向不懂你的人证明什么'],
    weight: 1,
    sort_order: 23
  },
  {
    question_code: 'Q24',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '你对自己情绪管理能力打分？',
    question_type: 'single',
    options: ['稳定成熟', '偶尔破防', '日常发疯但能装', '情绪像天气，预报都没用'],
    weight: 1,
    sort_order: 24
  },
  {
    question_code: 'Q25',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '如果只能选一句作为你的人生信条，你选？',
    question_type: 'single',
    options: ['愿此行，终抵群星', '为世界上所有的美好而战', '前面的区域以后再来探索吧', '生命因何而沉睡？因为我们终将从梦中醒来'],
    weight: 1,
    sort_order: 25
  },
  {
    question_code: 'Q26',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '当你捡到100块，周围没人，你会？',
    question_type: 'single',
    options: ['原地等失主', '买杯奶茶快乐一下', '对着钱拜三拜，祈求暴富', '塞给路过的小狗，让它替你保管'],
    weight: 1,
    sort_order: 26
  },
  {
    question_code: 'Q27',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '朋友借你钱很久没还，你会？',
    question_type: 'single',
    options: ['委婉提醒', '默默拉黑', '每天发财神爷表情包暗示', '算了，就当资助贫困朋友'],
    weight: 1,
    sort_order: 27
  },
  {
    question_code: 'Q28',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '朋友发消息问你在干嘛，你其实在发呆玩手机，你会？',
    question_type: 'single',
    options: ['如实说在发呆', '说在忙，晚点回', '拍一张窗外的云发过去，说在看云思考人生', '回一句“在等你找我”然后立刻撤回'],
    weight: 1,
    sort_order: 28
  },
  {
    question_code: 'Q29',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '外卖迟到20分钟，骑手打电话道歉，你会？',
    question_type: 'single',
    options: ['哭着说"你终于来了，我以为你出事了，遗书我都写好了"', '温柔安慰："没事，正好我的泡面也刚泡到第20分钟，你们很有默契"', '严肃质问："你知道这20分钟我经历了什么吗？我把《用户协议》从头到尾读了一遍"', '兴奋回应："太好了！根据平台规则，迟到30分钟才能赔红包，你能不能再兜两圈？"'],
    weight: 1,
    sort_order: 29
  },
  {
    question_code: 'Q30',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '电梯里蟑螂按了19层，你说"我也去19层"，它说"巧了，其实我按错了，我要去-18层。"',
    question_type: 'single',
    options: ['帮它按-18层——乐于助人', '沉默——不与蟑螂深交', '问-18层有什么——闲得慌', '自己爬楼梯——这电梯不对劲'],
    weight: 1,
    sort_order: 30
  },
  {
    question_code: 'Q31',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '宇宙毁灭前30分钟点了外卖，骑手说："送到时宇宙没了，你没法吃。"',
    question_type: 'single',
    options: ['取消——理性消费', '坚持——仪式感', '问能放门口吗——社恐最后的倔强', '给差评——宇宙毁灭不是超时理由'],
    weight: 1,
    sort_order: 31
  },
  {
    question_code: 'Q32',
    section: 'fun_questionnaire',
    section_title: '趣味问卷',
    question_text: '对于刘慈欣的名言，你会选',
    question_type: 'single',
    options: ['"消灭人类暴政，世界属于三体"', '"失去兽性，失去一切"', '"妈妈，哪个是爸爸？"', '"她像一颗星星，总是那么遥远"', '"美妙人生的关键在于你能迷上什么东西"', '"我爱你，与你有何相干"', '人类一思考，上帝就发笑', '鱼上了岸，也就不再是鱼', '不理睬是最大的轻蔑'],
    weight: 1,
    sort_order: 32
  }
]

export {
  colleges,
  collegeMajors,
  grades,
  interests,
  questionnaireQuestions
}
