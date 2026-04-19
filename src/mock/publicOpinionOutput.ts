export type OutputTone = '正向' | '中性' | '负向'
export type OutputFormat = '短帖' | '长文导语' | '问答口径' | '短视频脚本' | '标题方案' | '图文卡片'
export type SampleType = '标准样本' | '风险样本' | '回应样本'
export type RiskLevel = '低' | '中' | '高'

export interface OutputItem {
  id: number
  tone: OutputTone
  format: OutputFormat
  sampleType: SampleType
  riskLevel: RiskLevel
  title: string
  content: string
  tags: string[]
  scenario: string
}

export interface PublicOpinionTopicPackage {
  keyword: string
  aliases: string[]
  summary: string
  notice: string
  availableTones: OutputTone[]
  availableFormats: OutputFormat[]
  items: OutputItem[]
}

const availableTones: OutputTone[] = ['正向', '中性', '负向']
const availableFormats: OutputFormat[] = ['短帖', '长文导语', '问答口径', '短视频脚本', '标题方案', '图文卡片']

export const concertOutputPackage: PublicOpinionTopicPackage = {
  keyword: '明星演唱会官宣',
  aliases: ['巡演官宣', '演唱会开票', '舞台路透'],
  summary: '围绕明星演唱会官宣、预售抢票、舞美路透和粉丝扩散链路构建的娱乐舆情样本，用于展示不同情绪与内容形式下的传播素材。',
  notice: '内容库已完成整理，可直接用于专题浏览与内容检索。',
  availableTones,
  availableFormats,
  items: [
    { id: 1, tone: '正向', format: '短帖', sampleType: '回应样本', riskLevel: '低', title: '终于等到巡演官宣了', content: '【虚构演示】主视觉一出就把期待值拉满，城市站点和舞台概念都比预期更有诚意，粉丝情绪明显转暖。', tags: ['演唱会', '官宣', '期待值'], scenario: '微博短帖' },
    { id: 2, tone: '正向', format: '短帖', sampleType: '回应样本', riskLevel: '低', title: '这次舞台概念真的很敢做', content: '【虚构演示】从预热海报到舞美设定都带着强烈的个人风格，如果现场执行到位，这轮讨论会持续很久。', tags: ['舞美', '风格', '热议'], scenario: '超话发帖' },
    { id: 3, tone: '中性', format: '短帖', sampleType: '虚构演示样本', riskLevel: '低', title: '真正的讨论点是票务和场次', content: '【虚构演示】官宣只是第一步，后续热度能不能稳住，关键要看票价设置、场次安排和抢票体验。', tags: ['票务', '场次', '抢票'], scenario: '资讯配文' },
    { id: 4, tone: '负向', format: '短帖', sampleType: '风险样本', riskLevel: '中', title: '如果票务系统崩了，口碑会瞬间反转', content: '娱乐舆情往往不是输在官宣，而是输在开票体验。一旦系统拥堵，正向讨论很快会变成吐槽潮。', tags: ['票务系统', '反转', '吐槽'], scenario: '风险模拟贴' },
    { id: 5, tone: '正向', format: '长文导语', sampleType: '回应样本', riskLevel: '低', title: '官宣之后，为什么粉丝情绪会快速升温', content: '【虚构演示】娱乐项目的情绪点往往集中在“等到了”和“值不值”之间。真正拉动舆情上扬的，不只是官宣本身，而是内容完成度与情绪回报感。', tags: ['情绪回报', '娱乐舆情', '升温'], scenario: '专题导语' },
    { id: 6, tone: '中性', format: '长文导语', sampleType: '虚构演示样本', riskLevel: '低', title: '从官宣到开票，舆情会经历哪几段', content: '【虚构演示】娱乐项目通常会经历官宣兴奋、抢票焦虑、路透争议和现场口碑四个阶段，每一段都对应不同的传播触发点。', tags: ['阶段传播', '路透', '现场口碑'], scenario: '观察文章开头' },
    { id: 7, tone: '负向', format: '问答口径', sampleType: '风险样本', riskLevel: '高', title: '问：为什么明明热度高，评论却开始转负？', content: '答：因为娱乐项目的情绪阈值很低，只要票价、座位图或黄牛问题被放大，用户就会从期待切换到质疑。', tags: ['问答', '票价', '黄牛'], scenario: '评论区口径' },
    { id: 8, tone: '正向', format: '短视频脚本', sampleType: '回应样本', riskLevel: '低', title: '30秒讲清为什么这轮官宣出圈', content: '【虚构演示】开场：一张海报为什么能引爆全网？主体：因为它同时满足了情绪回归、视觉记忆点和站点悬念。结尾：这就是娱乐舆情最强的出圈组合。', tags: ['短视频', '出圈', '海报'], scenario: '口播脚本' },
    { id: 9, tone: '中性', format: '标题方案', sampleType: '虚构演示样本', riskLevel: '低', title: '标题：演唱会官宣之后，真正决定口碑的是哪一步？', content: '适合用于票务观察和舆情解析类内容。', tags: ['标题', '口碑', '票务'], scenario: '文章标题' },
    { id: 10, tone: '正向', format: '图文卡片', sampleType: '回应样本', riskLevel: '低', title: '卡片：这次官宣为什么让人愿意等', content: '【虚构演示】主文案：视觉概念在线，站点悬念拉满；副文案：娱乐舆情最重要的是“值回等待”。', tags: ['图文卡片', '视觉概念', '等待感'], scenario: '卡片海报' },
  ],
}

export const phoneOutputPackage: PublicOpinionTopicPackage = {
  keyword: '手机新品发布',
  aliases: ['新机发布', '旗舰手机', '发布会'],
  summary: '围绕手机新品发布、外观设计、价格讨论、测评扩散与开售反馈构建的商品舆情样本，更贴近品牌传播与消费讨论场景。',
  notice: '内容库已完成整理，可直接用于专题浏览与内容检索。',
  availableTones,
  availableFormats,
  items: [
    { id: 101, tone: '正向', format: '短帖', sampleType: '回应样本', riskLevel: '低', title: '这代外观真的一眼记住了', content: '【虚构演示】新机这次终于不只是参数堆料，外观语言和配色辨识度都很高，社交平台天然更容易出图。', tags: ['外观', '配色', '辨识度'], scenario: '种草短帖' },
    { id: 102, tone: '正向', format: '短帖', sampleType: '回应样本', riskLevel: '低', title: '价格如果真是这个区间，会很能打', content: '【虚构演示】当产品力和定价预期同时在线时，舆情会出现明显的自来水扩散，讨论重点也会转向“值不值”。', tags: ['价格带', '产品力', '值不值'], scenario: '开售前讨论' },
    { id: 103, tone: '中性', format: '短帖', sampleType: '虚构演示样本', riskLevel: '低', title: '发布会之后会进入测评接力阶段', content: '【虚构演示】科技产品的热度真正分水岭不在发布会当天，而在首批测评、续航反馈和真实影像样张出来之后。', tags: ['测评', '续航', '影像'], scenario: '测评预告' },
    { id: 104, tone: '负向', format: '短帖', sampleType: '风险样本', riskLevel: '中', title: '如果价格超预期，争议会压过亮点', content: '消费电子舆情对价格极其敏感，一旦“超预期贵”形成统一认知，正向卖点很容易被淹没。', tags: ['价格争议', '卖点淹没', '风险'], scenario: '风险观察' },
    { id: 105, tone: '正向', format: '长文导语', sampleType: '回应样本', riskLevel: '低', title: '为什么新品发布容易形成二次传播', content: '【虚构演示】当产品拥有明确的记忆点，社交平台上的二创、测评切片和对比图就会形成二次扩散，让“发布会热度”变成“持续讨论热度”。', tags: ['二次传播', '二创', '持续讨论'], scenario: '品牌观察导语' },
    { id: 106, tone: '中性', format: '问答口径', sampleType: '虚构演示样本', riskLevel: '低', title: '问：为什么商品舆情常围绕价格打转？', content: '【虚构演示】答：因为对大多数消费者来说，价格不仅代表成本，也代表品牌是否理解用户的心理预期。', tags: ['问答', '价格心智', '消费心理'], scenario: '产品问答' },
    { id: 107, tone: '负向', format: '问答口径', sampleType: '风险样本', riskLevel: '高', title: '问：为什么一条差评能带偏整场讨论？', content: '答：因为商品类内容更依赖真实体验背书，续航、发热或售后争议一旦出现，很容易被放大成信任问题。', tags: ['差评', '续航', '售后'], scenario: '风险问答' },
    { id: 108, tone: '正向', format: '短视频脚本', sampleType: '回应样本', riskLevel: '低', title: '一分钟讲新机为什么值得聊', content: '【虚构演示】开场：为什么这次新品一出就冲上热搜？主体：外观记忆点强、配置升级明确、价格预期有讨论空间。结尾：商品舆情最怕没亮点，这次显然不是。', tags: ['热搜', '配置升级', '短视频'], scenario: '种草视频脚本' },
    { id: 109, tone: '中性', format: '标题方案', sampleType: '虚构演示样本', riskLevel: '低', title: '标题：一场手机发布会，真正被讨论的其实只有三件事', content: '适合用于消费电子趋势分析内容。', tags: ['标题', '消费电子', '三件事'], scenario: '资讯标题' },
    { id: 110, tone: '负向', format: '图文卡片', sampleType: '风险样本', riskLevel: '中', title: '卡片：新品热度高，但为什么口碑还不稳？', content: '主文案：热搜不等于稳口碑；副文案：开售后的真实体验才是商品类舆情的分水岭。', tags: ['图文卡片', '口碑分水岭', '开售反馈'], scenario: '风向卡片' },
  ],
}

export const teaOutputPackage: PublicOpinionTopicPackage = {
  keyword: '茶饮联名上新',
  aliases: ['奶茶联名', '新品茶饮', '品牌联名'],
  summary: '围绕茶饮联名、新品口味、门店排队、周边抢购和社交分享构建的快消商品舆情样本，适合展示轻量级、高频传播场景。',
  notice: '内容库已完成整理，可直接用于专题浏览与内容检索。',
  availableTones,
  availableFormats,
  items: [
    { id: 201, tone: '正向', format: '短帖', sampleType: '回应样本', riskLevel: '低', title: '联名包装真的很适合拍照分享', content: '【虚构演示】快消新品最容易出圈的，不一定是口味，而是“愿不愿意发朋友圈”。这次包装和周边都踩中了社交分享点。', tags: ['联名包装', '社交分享', '出片'], scenario: '小红书种草' },
    { id: 202, tone: '中性', format: '短帖', sampleType: '虚构演示样本', riskLevel: '低', title: '新品会火多久，得看复购和门店体验', content: '【虚构演示】联名首波热度来自新鲜感，但真正决定后续舆情的，还是口味评价、排队体验和周边供应。', tags: ['复购', '排队', '门店体验'], scenario: '门店观察' },
    { id: 203, tone: '负向', format: '短帖', sampleType: '风险样本', riskLevel: '中', title: '周边断货比口味争议更容易炸评论区', content: '快消联名最怕“买不到”。一旦排队和断货同时出现，情绪会迅速从好奇切换成不满。', tags: ['断货', '评论区', '排队'], scenario: '风险短帖' },
    { id: 204, tone: '正向', format: '长文导语', sampleType: '回应样本', riskLevel: '低', title: '为什么茶饮联名特别容易刷屏', content: '【虚构演示】茶饮联名兼具低决策门槛和高分享意愿，既能满足即时消费，也能承接社交表达，因此很容易在短时间内形成集中扩散。', tags: ['茶饮联名', '刷屏', '即时消费'], scenario: '品牌稿导语' },
    { id: 205, tone: '中性', format: '问答口径', sampleType: '虚构演示样本', riskLevel: '低', title: '问：为什么新品口味不是唯一重点？', content: '【虚构演示】答：因为快消舆情同时看包装、排队、价格、联名对象和门店出杯稳定性，口味只是其中一环。', tags: ['问答', '新品口味', '价格'], scenario: 'FAQ口径' },
    { id: 206, tone: '负向', format: '问答口径', sampleType: '风险样本', riskLevel: '高', title: '问：为什么“限量”会变成负面词？', content: '答：当用户感受到的是“营销太猛但体验太差”，限量就不再代表稀缺，而会被理解成制造焦虑。', tags: ['限量', '营销焦虑', '体验'], scenario: '风险答疑' },
    { id: 207, tone: '正向', format: '短视频脚本', sampleType: '回应样本', riskLevel: '低', title: '45秒讲清这杯联名为什么火', content: '【虚构演示】开场：为什么大家都在晒这杯？主体：联名 IP 记忆点强、包装上镜、周边可收藏。结尾：快消舆情最重要的是“好喝之外还有分享理由”。', tags: ['短视频', 'IP联名', '收藏感'], scenario: '探店视频脚本' },
    { id: 208, tone: '中性', format: '标题方案', sampleType: '虚构演示样本', riskLevel: '低', title: '标题：一杯奶茶为什么能带动整周社交热度？', content: '适合用于品牌传播分析。', tags: ['标题', '社交热度', '品牌分析'], scenario: '专题标题' },
    { id: 209, tone: '负向', format: '图文卡片', sampleType: '风险样本', riskLevel: '中', title: '卡片：新品爆火之后，最容易翻车的是什么？', content: '主文案：不是没人买，而是买得太难；副文案：排队、断货和代购溢价会快速消耗好感。', tags: ['图文卡片', '断货', '代购'], scenario: '社媒图卡' },
    { id: 210, tone: '正向', format: '图文卡片', sampleType: '回应样本', riskLevel: '低', title: '卡片：这次联名为什么值得打卡', content: '【虚构演示】主文案：颜值在线、口味稳定、分享感强；副文案：这就是快消新品形成正向扩散的典型路径。', tags: ['打卡', '颜值', '正向扩散'], scenario: '活动图卡' },
  ],
}

export const publicOpinionOutputPackages: PublicOpinionTopicPackage[] = [
  concertOutputPackage,
  phoneOutputPackage,
  teaOutputPackage,
]
