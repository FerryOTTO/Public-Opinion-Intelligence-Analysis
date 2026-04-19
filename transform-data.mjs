import fs from 'fs';

const INPUT_FILE = './public-opinion-weekly-bundle.json';
const OUTPUT_FILE = './src/mock/dashboard-payload.sample.json';

// 用户指定的特定热搜榜数据
const FIXED_HOT_SEARCH = [
    { rank: 1, title: '美以袭击伊朗', emotion_type: '负面', platforms: ['微博', '新闻'], domain: '国际政治', keySummary: '热度: 27000, 占比: 18%' },
    { rank: 2, title: '张雪机车世界超级摩托车锦标赛夺冠', emotion_type: '正面', platforms: ['抖音', 'B站'], domain: '体育赛事', keySummary: '热度: 21750, 占比: 14.5%' },
    { rank: 3, title: '澳洲优思益被曝假进口', emotion_type: '负面', platforms: ['小红书', '新闻'], domain: '消费维权', keySummary: '热度: 18750, 占比: 12.5%' },
    { rank: 4, title: '电视剧《白日提灯》热播', emotion_type: '正面', platforms: ['腾讯视频', '微博'], domain: '影视娱乐', keySummary: '热度: 15750, 占比: 10.5%' },
    { rank: 5, title: '李荣浩指责单依纯侵权唱《李白》', emotion_type: '中性', platforms: ['网易云音乐', '知乎'], domain: '知识产权', keySummary: '热度: 13500, 占比: 9%' },
    { rank: 6, title: '电视剧《你好1983》播出', emotion_type: '正面', platforms: ['爱奇艺', '微博'], domain: '影视娱乐', keySummary: '热度: 11250, 占比: 7.5%' },
    { rank: 7, title: '美国载人绕月任务火箭发布', emotion_type: '正面', platforms: ['SpaceX', '新闻'], domain: '航天科技', keySummary: '热度: 9000, 占比: 6%' },
    { rank: 8, title: '张雪峰因心源性猝死去世', emotion_type: '负面', platforms: ['微博', '抖音'], domain: '社会新闻', keySummary: '热度: 7500, 占比: 5%' },
    { rank: 9, title: '小米2025年财报', emotion_type: '正面', platforms: ['雪球', '新闻'], domain: '财经金融', keySummary: '热度: 6000, 占比: 4%' },
    { rank: 10, title: '周杰伦新专辑《太阳之子》MV上线', emotion_type: '正面', platforms: ['咪咕音乐', 'B站'], domain: '影视娱乐', keySummary: '热度: 4500, 占比: 3.0%' }
];

async function processData() {
    console.log('正在开启流式读取端口 (注入特定热搜榜与下钻逻辑适配)...');
    
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('错误: 未找到 public-opinion-weekly-bundle.json');
        return;
    }

    const readStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf-8', highWaterMark: 1024 * 1024 });
    
    let items = [];
    let count = 0;
    let leftover = "";

    const stats = {
        total: 0,
        negative: 0,
        platforms: {},
        provinces: {},
        hourly: Array(24).fill(0).map(() => ({ total: 0, neg: 0, pos: 0 }))
    };

    for await (const chunk of readStream) {
        let content = leftover + chunk;
        const matches = content.match(/\{"message_id":.*?\}(?=,|$|\])/g);
        if (matches) {
            for (const m of matches) {
                try {
                    const item = JSON.parse(m);
                    items.push(item);
                    stats.total++;
                    const platform = item.platform_name || '其他';
                    stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
                    if (item.province) {
                        // 统一地理名称，去掉后缀方便组件处理
                        const cleanProvince = item.province.replace(/省|市|自治区|特别行政区/g, '');
                        stats.provinces[cleanProvince] = (stats.provinces[cleanProvince] || 0) + 1;
                    }
                    const isNeg = (item.like_count > 10000 && Math.random() > 0.7);
                    if (isNeg) stats.negative++;
                    if (item.published_at) {
                        const h = new Date(item.published_at).getHours();
                        if (h >=0 && h < 24) { stats.hourly[h].total++; if(isNeg) stats.hourly[h].neg++; }
                    }
                    count++;
                } catch (e) {}
                if (count >= 3000) break;
            }
        }
        if (count >= 3000) break;
        const lastIdx = content.lastIndexOf('}');
        leftover = lastIdx !== -1 ? content.substring(lastIdx + 1) : "";
    }

    // 将统计出的省份数据整理为 ECharts Map 识别的格式
    const chinaHeatData = Object.entries(stats.provinces).map(([name, value]) => ({ name, value }));

    const payload = {
        stats: [
            { label: '今日信息量', value: 153842, unit: '条' },
            { label: '舆情热度指数', value: 94 },
            { label: '负面倾向', value: 21.4, unit: '%' },
            { label: '活跃事件数', value: 15 },
            { label: '预警数量', value: 3, unit: '条' },
            { label: '传播裂变系数', value: 4.2 },
            { label: '谣言拦截', value: 156, unit: '条' },
            { label: 'KOL参与度', value: 88 }
        ],
        sentimentData: [
            { name: '正面', value: 45 },
            { name: '中性', value: 32 },
            { name: '负面', value: 23 }
        ],
        platformData: Object.entries(stats.platforms).map(([name, value]) => ({ name, value })),
        chinaHeatData: chinaHeatData, // 全省总热度
        worldHeatData: [
            { name: 'China', value: 92 },
            { name: 'United States', value: 85 },
            { name: 'Japan', value: 74 },
            { name: 'Russia', value: 62 }
        ],
        // 【下钻渲染核心】：首页地图点击 China 后，会去读取 countryHeatMapData.china
        countryHeatMapData: {
            china: chinaHeatData // 注入实时统计的省份热度
        },
        trendData: {
            xAxis: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`),
            series: [
                { name: '总体声量', data: stats.hourly.map((h, i) => ({ value: h.total, snapshotId: `t_${i}` })) }
            ]
        },
        hourlyHotSearchSnapshots: {}
    };

    for (let i = 0; i < 24; i++) {
        payload.hourlyHotSearchSnapshots[`t_${i}`] = FIXED_HOT_SEARCH;
    }

    if (!fs.existsSync('./src/mock')) fs.mkdirSync('./src/mock', { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`\n✅ 修复完成！地图下钻逻辑已关联至实时数据包。`);
}

processData();
