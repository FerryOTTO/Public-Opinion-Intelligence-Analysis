<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import PieChart from '@/components/Charts/PieChart.vue'
import LineChart from '@/components/Charts/LineChart.vue'
import SecurityMap from './SecurityMap.vue'
import { getSecurityOverview } from '@/api/security'

// 黄金四步法：数据源状态与本地 mock 数据
const dataSourceStatus = ref<'real' | 'mock' | 'timeout' | 'empty'>('real')
const dataSourceStatusText = computed(() => {
  switch (dataSourceStatus.value) {
    case 'real': return '实时数据';
    case 'mock': return '本地演示';
    case 'timeout': return '超时演示';
    case 'empty': return '空数据演示';
    default: return '';
  }
})

const securityScore = ref(82)
const scoreColor = ref('#ffd700')
const scoreLevel = ref('良好')
const mapMode = ref<'china'|'world'>('china')
const expandedThreat = ref<number|null>(null)
const expandedRumor = ref<number|null>(null)
const activeSecTab = ref<'overview'|'threat'|'rumor'|'map'>('overview')

// --- 修复后的地图数据结构 ---
const chinaMapData = [
  {name:'北京',value:85,level:'high' as const},{name:'广东',value:91,level:'high' as const},
  {name:'新疆',value:78,level:'high' as const},{name:'上海',value:72,level:'mid' as const},
  {name:'浙江',value:63,level:'mid' as const},{name:'内蒙古',value:67,level:'mid' as const},
  {name:'江苏',value:55,level:'mid' as const},{name:'四川',value:42,level:'low' as const},
  {name:'湖北',value:35,level:'low' as const},{name:'山东',value:48,level:'low' as const},
]

// 严格按照 WorldMap 组件要求，将 name 改为 region，value 改为 sources
const worldMapData = [
  {region:'Russia',sources:88,level:'high' as const},{region:'North Korea',sources:95,level:'high' as const},
  {region:'Iran',sources:82,level:'high' as const},{region:'Myanmar',sources:76,level:'high' as const},
  {region:'Pakistan',sources:73,level:'high' as const},{region:'Philippines',sources:67,level:'mid' as const},
  {region:'Vietnam',sources:51,level:'mid' as const},{region:'Indonesia',sources:58,level:'mid' as const},
  {region:'China',sources:30,level:'low' as const},{region:'Japan',sources:28,level:'low' as const},
  {region:'United States',sources:45,level:'low' as const},{region:'Germany',sources:22,level:'low' as const},
]

// 组装成 SecurityMap 子组件期待的“大包裹”数据格式
const securityMapPayload = computed(() => {
  return {
    chinaRisk: chinaMapData,
    worldRisk: worldMapData,
    attackFlows: [
      { from: 'United States', to: '北京', value: 120 },
      { from: 'Japan', to: '上海', value: 85 },
      { from: 'Philippines', to: '广东', value: 65 },
      { from: 'India', to: '新疆', value: 45 }
    ] 
  }
})

// 当前显示的下方表格数据
const currentMapData = ref(chinaMapData) 

const switchMap = (m: 'china'|'world') => {
  mapMode.value = m
  // 为了兼容下方表格的 name 和 value 字段，这里做个简单映射
  currentMapData.value = m === 'china' 
    ? chinaMapData 
    : worldMapData.map(item => ({ name: item.region, value: item.sources, level: item.level })) as any
}

// --- 其他业务数据 ---
const fiveDimMetrics = [
  {dim:'威胁态势',icon:'🛡️',score:78,desc:'综合跨境攻击、账号操纵、内容伪造的当前威胁烈度',
   indicators:[{name:'跨境信息攻击烈度',value:72,unit:'/100',alert:true},{name:'账号操纵检出率',value:94,unit:'%',alert:false},{name:'Deepfake识别准确率',value:91,unit:'%',alert:false},{name:'恶意转发拦截率',value:87,unit:'%',alert:false}]},
  {dim:'传播风险',icon:'📡',score:65,desc:'传播速度、裂变系数与病毒式扩散指数综合评估',
   indicators:[{name:'传播裂变系数(Rt)',value:3.72,unit:'',alert:true},{name:'跨平台扩散速度',value:68,unit:'/100',alert:true},{name:'情绪极化指数',value:42,unit:'/100',alert:false},{name:'KOL放大系数',value:2.34,unit:'×',alert:false}]},
  {dim:'情报质量',icon:'🔍',score:89,desc:'采集数据可信度、完整性与情报有效转化率',
   indicators:[{name:'数据采集覆盖率',value:94,unit:'%',alert:false},{name:'情感分析准确率',value:91,unit:'%',alert:false},{name:'谣言识别召回率',value:88,unit:'%',alert:false},{name:'情报有效转化率',value:83,unit:'%',alert:false}]},
  {dim:'响应效能',icon:'⚡',score:84,desc:'预警触发到处置完成的全链路时效性评估',
   indicators:[{name:'平均预警响应时间',value:4.2,unit:'min',alert:false},{name:'预警准确率',value:89,unit:'%',alert:false},{name:'事件处置完成率',value:76,unit:'%',alert:false},{name:'误报率',value:8.3,unit:'%',alert:false}]},
  {dim:'舆论生态',icon:'🌐',score:71,desc:'公众情绪健康度、信息多元性与公信力感知指数',
   indicators:[{name:'负面情感占比',value:23.4,unit:'%',alert:false},{name:'谣言流通密度',value:18,unit:'/万条',alert:false},{name:'官方信息触达率',value:67,unit:'%',alert:true},{name:'信息多元化指数',value:0.74,unit:'(H)',alert:false}]},
]

const threatEvents = ref([
  {id:1, time:'10:22',title:'AI监管谣言跨平台扩散',       level:'红',type:'内容伪造', source:'微博/抖音',ip:'国内',status:'待处理',detail:'疑似AI生成谣言文章在微博、抖音同步扩散，触达约120万用户，情绪倾向负面。'},
  {id:2, time:'09:58',title:'食品安全谣言传播速度超阈值', level:'橙',type:'恶意传播', source:'微信群',  ip:'国内',status:'处理中',detail:'某品牌奶粉谣言裂变系数Rt=4.2，超预警阈值3.0，已介入处置。'},
  {id:3, time:'09:11',title:'287个账号互刷网络被识别',   level:'橙',type:'账号操纵', source:'微博',   ip:'国内',status:'已处置',detail:'机器学习模型识别287个账号协同操纵行为，发帖时间高度规律，内容高度相似。'},
  {id:4, time:'08:30',title:'12账号接力转发同一谣言',    level:'黄',type:'恶意转发', source:'知乎',   ip:'国内',status:'已处置',detail:'12个账号在6分钟内按顺序转发同一谣言，呈现明显人工操纵特征。'},
  {id:5, time:'06:45',title:'深度伪造视频冒充政府官员',  level:'红',type:'Deepfake',source:'抖音',   ip:'境外',status:'已处置',detail:'深度伪造视频冒充省级官员发表不实言论，溯源IP指向东南亚节点，已通知平台下架。'},
  {id:6, time:'05:30',title:'境外媒体协调发布负面报道',  level:'橙',type:'跨境攻击', source:'Twitter',ip:'境外',status:'已处置',detail:'5家境外媒体在30分钟内协调发布涉华负面报道，话题标签相同，疑为有组织行动。'},
  {id:7, time:'04:15',title:'钓鱼网站仿冒政府平台',      level:'橙',type:'信息钓鱼', source:'短信',   ip:'境外',status:'已处置',detail:'仿冒国家政务服务平台的钓鱼网站，域名注册于境外，已申请DNS封锁。'},
  {id:8, time:'03:10',title:'342账号凌晨集中发帖异常',   level:'橙',type:'机器人',   source:'微博',   ip:'境外',status:'已处置',detail:'凌晨15分钟内342个新注册账号集中发布同类内容，已批量封禁。'},
  {id:9, time:'02:16',title:'东南亚IP段协调操纵行动',    level:'红',type:'跨境攻击', source:'多平台', ip:'境外',status:'已处置',detail:'东南亚某国67个IP协调操纵，已上报监管部门，触发跨境应急预案。'},
  {id:10,time:'01:33',title:'暗网涉华信息泄露情报预警',  level:'黄',type:'情报预警', source:'暗网监控',ip:'境外',status:'已处置',detail:'暗网发现涉华公民个人信息出售帖，约1.2万条数据，已启动核查程序。'},
  {id:11,time:'00:45',title:'AI伪造音频冒充知名学者',    level:'黄',type:'Deepfake',source:'微信',   ip:'国内',status:'已处置',detail:'AI合成音频冒充传播学学者发表虚假观点，声纹比对确认为伪造，已处置。'},
  {id:12,time:'昨日22:10',title:'VPN账号批量注册蓄积',   level:'蓝',type:'账号操纵', source:'多平台', ip:'境外',status:'已处置',detail:'境外IP批量注册国内平台账号189个，疑为后续操纵储备账号池。'},
])

const rumorList = ref([
  {id:1, title:'"AI将在2026年取代90%白领"',        credibility:12,status:'已辟谣',spread:234567,rumorType:'夸大事实',evidence:'查无此研究来源，原文为境外媒体断章取义，多位AI专家已公开辟谣。辟谣词条阅读量156万。'},
  {id:2, title:'"某品牌婴儿奶粉检出致癌物"',        credibility:8, status:'已辟谣',spread:189234,rumorType:'捏造事实',evidence:'市场监管总局官网公告：该品牌最新检测报告均合格，谣言源头账号已被封禁。'},
  {id:3, title:'"某城市自来水重金属超标"',          credibility:15,status:'核查中',spread:145678,rumorType:'夸大事实',evidence:'已联系当地水务部门获取最新检测报告，结果待确认，当前暂不能排除可能性。'},
  {id:4, title:'"政府将强制推行数字人民币"',        credibility:22,status:'已辟谣',spread:98765, rumorType:'误读政策',evidence:'央行官方声明：数字人民币坚持自愿原则，不存在强制推行。该博主已发更正声明。'},
  {id:5, title:'"某知名高校学生集体食物中毒"',      credibility:6, status:'已辟谣',spread:87654, rumorType:'捏造事实',evidence:'该高校官方辟谣：相关图片系旧图移花接木，学生均健康，已报警处理造谣账号。'},
  {id:6, title:'"某地地震预测科学家公开预警"',      credibility:5, status:'已辟谣',spread:76543, rumorType:'冒充专家',evidence:'中国地震台网官方：地震无法精准预测，视频中所谓专家为冒充，账号已封禁。'},
  {id:7, title:'"境外势力已渗透多家央企"',          credibility:18,status:'核查中',spread:67890, rumorType:'夸大事实',evidence:'相关部门正在调查核实，来源媒体有散布虚假信息前科，当前需谨慎对待。'},
  {id:8, title:'"某省高考题已泄露"',                credibility:3, status:'已辟谣',spread:45678, rumorType:'捏造事实',evidence:'教育部官方公告：高考命题严格保密，所谓泄题为诈骗机构招生噱头，已立案调查。'},
  {id:9, title:'"某头部互联网公司将裁员80%"',        credibility:21,status:'已辟谣',spread:43210, rumorType:'夸大事实',evidence:'该公司官方声明：裁员比例被严重夸大，已对传播账号发出律师函。'},
  {id:10,title:'"饮用水中检出微塑料致癌"',          credibility:35,status:'研究中',spread:38900, rumorType:'夸大研究',evidence:'该结论来源于预印本论文，尚未经同行评审，WHO目前未将其列为确证致癌因素。'},
])

const threatCategories = [
  {name:'跨境信息攻击',value:32},{name:'账号操纵刷量',value:26},
  {name:'内容伪造深伪',value:21},{name:'恶意转发扩散',value:14},{name:'信息钓鱼',value:7},
]
const scoreTrend = {
  xAxis:['03-17','03-18','03-19','03-20','03-21','03-22','03-23'],
  series:[{name:'安全评分',data:[88,85,87,83,86,84,82]},{name:'威胁指数',data:[45,52,48,58,51,55,60]}],
}
const ooda = [
  {phase:'观察(Observe)',desc:'多源异构数据采集，全平台实时监测',agent:'采集Agent群',color:'#409eff'},
  {phase:'判断(Orient)', desc:'情感分析 + 话题聚类 + 传播追踪',agent:'分析Agent群',  color:'#00f0ff'},
  {phase:'决策(Decide)', desc:'风险评分 + 威胁识别 + 预警触发',agent:'安全评估Agent',color:'#ffd700'},
  {phase:'行动(Act)',    desc:'应急响应 + 辟谣推送 + 平台协作',agent:'调度Agent',    color:'#00ff88'},
]

const levelColor: Record<string,string> = {'红':'#ff4757','橙':'#ff6b35','黄':'#ffd700','蓝':'#409eff'}
const statusType = (s: string) => s==='已处置'?'success':s==='处理中'||s==='核查中'?'warning':'danger'
const dimScoreColor = (s: number) => s>=85?'#00ff88':s>=70?'#ffd700':'#ff4757'
const credColor = (v: number) => v<=20?'#00ff88':v<=50?'#ffd700':'#ff4757'

onMounted(async () => {
  try {
    dataSourceStatus.value = 'real'
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    await Promise.race([getSecurityOverview(), timeoutPromise])
    scoreColor.value = dimScoreColor(securityScore.value)
    scoreLevel.value = securityScore.value >= 85 ? '优秀' : securityScore.value >= 70 ? '良好' : securityScore.value >= 55 ? '一般' : '危险'
  } catch (e: any) {
    if (e && e.message === 'timeout') {
      dataSourceStatus.value = 'timeout'
    } else {
      dataSourceStatus.value = 'mock'
    }
    console.warn('⚠️ 获取安全概览数据失败，已使用本地数据兜底：', e)
  }
})
</script>

<template>
  <div class="page-container">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 class="page-title">安全态势感知</h2>
      <el-tag :type="dataSourceStatus === 'real' ? 'success' : (dataSourceStatus === 'timeout' ? 'warning' : 'info')" size="small">
        {{ dataSourceStatusText }}
      </el-tag>
    </div>
    <div class="sec-tabs">
      <div v-for="t in [{k:'overview',l:'📊 态势总览'},{k:'threat',l:'🛡️ 威胁监测'},{k:'rumor',l:'🕵️ 谣言识别'},{k:'map',l:'🗺️ 安全地图'}]"
        :key="t.k" class="sec-tab" :class="{active:activeSecTab===t.k}" @click="activeSecTab=(t.k as any)">{{ t.l }}</div>
    </div>

    <div v-show="activeSecTab==='overview'">
      <div class="top-row">
        <div class="tech-card score-panel">
          <svg viewBox="0 0 120 120" width="120" height="120" style="flex-shrink:0">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(64,158,255,0.1)" stroke-width="10"/>
            <circle cx="60" cy="60" r="50" fill="none" :stroke="scoreColor" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="`${securityScore*3.14} ${314-securityScore*3.14}`" stroke-dashoffset="78.5"/>
            <text x="60" y="56" text-anchor="middle" :fill="scoreColor" font-size="28" font-weight="900">{{ securityScore }}</text>
            <text x="60" y="76" text-anchor="middle" fill="#7f97c7" font-size="12">{{ scoreLevel }}</text>
          </svg>
          <div class="score-info">
            <div class="si-title">综合安全态势评分</div>
            <div class="si-desc">基于威胁态势、传播风险、情报质量、响应效能、舆论生态五维指标综合评估</div>
            <div class="si-ref">参考：IAST态势感知框架 · 赵云泽（2019）· 方兴东（2021）</div>
          </div>
        </div>
        <div class="tech-card ooda-panel">
          <div class="panel-title">🔄 情报-安全联接：OODA循环框架</div>
          <div class="ooda-list">
            <div v-for="(o,idx) in ooda" :key="idx" class="ooda-item">
              <div class="ooda-num" :style="{background:o.color}">{{ idx+1 }}</div>
              <div><div class="ooda-phase" :style="{color:o.color}">{{ o.phase }}</div><div class="ooda-desc">{{ o.desc }}</div><div class="ooda-agent">{{ o.agent }}</div></div>
              <span v-if="idx<ooda.length-1" class="ooda-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dim-row">
        <div v-for="dim in fiveDimMetrics" :key="dim.dim" class="tech-card dim-card">
          <div class="dim-head"><span class="dim-icon">{{ dim.icon }}</span><div><div class="dim-name">{{ dim.dim }}</div><div class="dim-score" :style="{color:dimScoreColor(dim.score)}">{{ dim.score }}</div></div></div>
          <div class="dim-desc">{{ dim.desc }}</div>
          <div class="dim-indicators">
            <div v-for="ind in dim.indicators" :key="ind.name" class="ind-row">
              <span class="ind-name"><span v-if="ind.alert" class="alert-dot">●</span>{{ ind.name }}</span>
              <span class="ind-val" :class="{alert:ind.alert}">{{ ind.value }}{{ ind.unit }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="tech-card chart-panel"><div class="panel-title"><span class="dot dot-red"></span>威胁类型分布</div><PieChart :data="threatCategories"/></div>
        <div class="tech-card chart-panel"><div class="panel-title"><span class="dot dot-blue"></span>7日安全评分 vs 威胁指数</div><LineChart :x-axis="scoreTrend.xAxis" :series="scoreTrend.series"/></div>
      </div>
    </div>

    <div v-show="activeSecTab==='threat'" class="threat-section">
      <div class="threat-stats">
        <div v-for="s in [{l:'今日事件',v:threatEvents.length,c:'#eaf3ff'},{l:'待处理',v:threatEvents.filter(e=>e.status==='待处理').length,c:'#ff4757'},{l:'处理中',v:threatEvents.filter(e=>e.status==='处理中').length,c:'#ffa502'},{l:'已处置',v:threatEvents.filter(e=>e.status==='已处置').length,c:'#00ff88'}]" :key="s.l" class="ts-card tech-card">
          <div class="ts-val" :style="{color:s.c}">{{ s.v }}</div><div class="ts-label">{{ s.l }}</div>
        </div>
      </div>
      <div class="threat-list">
        <div v-for="ev in threatEvents" :key="ev.id" class="threat-row tech-card" :class="'lv-'+ev.level">
          <div class="tr-header" @click="expandedThreat=expandedThreat===ev.id?null:ev.id">
            <div class="tr-lv-dot" :style="{background:levelColor[ev.level]}"></div>
            <div class="tr-info">
              <div class="tr-title">{{ ev.title }}</div>
              <div class="tr-meta">
                <span class="tr-time">{{ ev.time }}</span>
                <span class="tr-type">{{ ev.type }}</span>
                <span class="tr-src">来源：{{ ev.source }}</span>
                <span class="tr-ip" :class="{foreign:ev.ip==='境外'}">{{ ev.ip }}</span>
                <el-tag :type="statusType(ev.status)" size="small">{{ ev.status }}</el-tag>
              </div>
            </div>
            <span class="tr-expand">{{ expandedThreat===ev.id?'▲':'▼' }}</span>
          </div>
          <Transition name="expand">
            <div v-if="expandedThreat===ev.id" class="tr-detail">{{ ev.detail }}</div>
          </Transition>
        </div>
      </div>
    </div>

    <div v-show="activeSecTab==='rumor'" class="rumor-section">
      <div class="rumor-list">
        <div v-for="r in rumorList" :key="r.id" class="rumor-row tech-card">
          <div class="rr-header" @click="expandedRumor=expandedRumor===r.id?null:r.id">
            <div class="rr-cred">
              <div class="cred-val" :style="{color:credColor(r.credibility)}">{{ r.credibility }}%</div>
              <div class="cred-label">可信度</div>
            </div>
            <div class="rr-body">
              <div class="rr-title">{{ r.title }}</div>
              <div class="rr-meta">
                <span class="rr-type">{{ r.rumorType }}</span>
                <span class="rr-spread">传播量：{{ r.spread.toLocaleString() }}</span>
                <el-tag :type="statusType(r.status)" size="small">{{ r.status }}</el-tag>
              </div>
            </div>
            <span class="rr-expand">{{ expandedRumor===r.id?'▲':'▼' }}</span>
          </div>
          <Transition name="expand">
            <div v-if="expandedRumor===r.id" class="rr-evidence"><b>辟谣依据：</b>{{ r.evidence }}</div>
          </Transition>
        </div>
      </div>
    </div>

    <div v-if="activeSecTab==='map'" class="map-section">
      <div class="map-controls">
        <span class="mc-label">切换视图：</span>
        <button class="mc-btn" :class="{active:mapMode==='china'}" @click="switchMap('china')">🇨🇳 中国地图</button>
        <button class="mc-btn" :class="{active:mapMode==='world'}" @click="switchMap('world')">🌍 世界地图</button>
        <div class="mc-legend">
          <span style="color:#ff4757">🔴 高风险</span>
          <span style="color:#ffd700">🟡 中风险</span>
          <span style="color:#00ff88">🟢 正常</span>
        </div>
      </div>
      <div class="tech-card map-card">
        <div class="panel-title">{{ mapMode==='china'?'🇨🇳 中国各省舆情威胁态势':'🌍 全球舆情威胁态势' }}</div>
        
        <SecurityMap :mode="mapMode" :data="securityMapPayload"/>
        
      </div>
      <div class="map-table">
        <div v-for="d in currentMapData.filter(x=>x.level!=='low')" :key="d.name" class="mt-row" :class="d.level">
          <span class="mt-name">{{ d.name }}</span>
          <span class="mt-tag" :style="{color:d.level==='high'?'#ff4757':'#ffd700'}">{{ d.level==='high'?'🔴 高风险':'🟡 中风险' }}</span>
          <div class="mt-bar-wrap"><div class="mt-bar" :style="{width:d.value+'%',background:d.level==='high'?'#ff4757':'#ffd700'}"></div></div>
          <span class="mt-val">{{ d.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sec-tabs { display:flex; gap:8px; margin-bottom:14px; }
.sec-tab { padding:7px 18px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; color:#4a5a7a; border:1px solid rgba(64,158,255,0.2); transition:all 0.2s;
  &.active { color:#00f0ff; border-color:#00f0ff; background:rgba(0,240,255,0.08); } }
.top-row { display:grid; grid-template-columns:1fr 2fr; gap:12px; margin-bottom:12px; }
.score-panel { padding:20px; display:flex; align-items:center; gap:20px; }
.score-info { flex:1; }
.si-title { font-size:15px; font-weight:700; color:#eaf3ff; margin-bottom:6px; }
.si-desc  { font-size:12px; color:#7f97c7; line-height:1.6; margin-bottom:6px; }
.si-ref   { font-size:11px; color:#4a5a7a; font-style:italic; }
.ooda-panel { padding:16px; }
.panel-title { font-size:13px; font-weight:700; color:#eaf3ff; display:flex; align-items:center; gap:7px; margin-bottom:12px; }
.dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; &.dot-red{background:#ff4757;box-shadow:0 0 6px #ff4757;} &.dot-blue{background:#409eff;box-shadow:0 0 6px #409eff;} }
.ooda-list { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.ooda-item { display:flex; align-items:center; gap:8px; }
.ooda-num { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; color:#000; flex-shrink:0; }
.ooda-phase { font-size:13px; font-weight:700; margin-bottom:3px; }
.ooda-desc  { font-size:11px; color:#7f97c7; }
.ooda-agent { font-size:11px; color:#4a5a7a; margin-top:2px; }
.ooda-arrow { font-size:18px; color:rgba(64,158,255,0.4); }
.dim-row { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:12px; }
.dim-card { padding:14px; }
.dim-head { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.dim-icon { font-size:24px; }
.dim-name { font-size:13px; font-weight:700; color:#eaf3ff; }
.dim-score { font-size:22px; font-weight:900; }
.dim-desc { font-size:11px; color:#4a5a7a; margin-bottom:8px; line-height:1.4; }
.dim-indicators { display:flex; flex-direction:column; gap:5px; }
.ind-row { display:flex; justify-content:space-between; align-items:center; font-size:12px; padding:3px 0; border-bottom:1px solid rgba(64,158,255,0.08); }
.ind-name { color:#7f97c7; display:flex; align-items:center; gap:4px; }
.alert-dot { color:#ff4757; font-size:8px; }
.ind-val { color:#eaf3ff; font-weight:700; &.alert{color:#ff4757;} }
.bottom-row { display:grid; grid-template-columns:1fr 1.4fr; gap:12px; }
.chart-panel { padding:14px; }

// 威胁监测
.threat-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:12px; }
.ts-card { padding:12px; text-align:center; }
.ts-val { font-size:26px; font-weight:900; margin-bottom:4px; }
.ts-label { font-size:12px; color:#4a5a7a; }
.threat-list { display:flex; flex-direction:column; gap:8px; }
.threat-row { overflow:hidden; border-left:3px solid transparent;
  &.lv-红{border-left-color:#ff4757;} &.lv-橙{border-left-color:#ff6b35;} &.lv-黄{border-left-color:#ffd700;} &.lv-蓝{border-left-color:#409eff;} }
.tr-header { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; &:hover{background:rgba(255,255,255,0.03);} }
.tr-lv-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.tr-info { flex:1; min-width:0; }
.tr-title { font-size:13px; font-weight:700; color:#eaf3ff; margin-bottom:4px; }
.tr-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.tr-time { font-size:11px; color:#4a5a7a; }
.tr-type { font-size:11px; color:#409eff; background:rgba(64,158,255,0.1); padding:1px 6px; border-radius:3px; }
.tr-src { font-size:11px; color:#7f97c7; }
.tr-ip { font-size:11px; color:#00ff88; &.foreign{color:#ff4757;} }
.tr-expand { font-size:10px; color:#4a5a7a; flex-shrink:0; }
.tr-detail { padding:10px 14px 12px; font-size:12px; color:#b7c7e8; line-height:1.6; background:rgba(0,0,0,0.15); border-top:1px solid rgba(255,255,255,0.06); }

// 谣言识别
.rumor-list { display:flex; flex-direction:column; gap:8px; }
.rumor-row { overflow:hidden; }
.rr-header { display:flex; align-items:center; gap:12px; padding:12px 14px; cursor:pointer; &:hover{background:rgba(255,255,255,0.03);} }
.rr-cred { flex-shrink:0; text-align:center; width:52px; }
.cred-val { font-size:18px; font-weight:900; }
.cred-label { font-size:10px; color:#4a5a7a; }
.rr-body { flex:1; min-width:0; }
.rr-title { font-size:13px; font-weight:700; color:#eaf3ff; margin-bottom:4px; }
.rr-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.rr-type { font-size:11px; color:#ffa502; background:rgba(255,165,2,0.1); padding:1px 6px; border-radius:3px; }
.rr-spread { font-size:11px; color:#7f97c7; }
.rr-expand { font-size:10px; color:#4a5a7a; flex-shrink:0; }
.rr-evidence { padding:10px 14px 12px; font-size:12px; color:#b7c7e8; line-height:1.6; background:rgba(0,0,0,0.15); border-top:1px solid rgba(255,255,255,0.06); b{color:#00f0ff;} }

// 地图
.map-controls { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
.mc-label { font-size:13px; color:#7f97c7; }
.mc-btn { padding:6px 16px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; color:#4a5a7a; background:transparent; border:1px solid rgba(64,158,255,0.2); transition:all 0.2s;
  &.active{color:#00f0ff;border-color:#00f0ff;background:rgba(0,240,255,0.08);} &:hover:not(.active){color:#b7c7e8;} }
.mc-legend { display:flex; gap:14px; font-size:12px; margin-left:auto; }
.map-card { padding:14px; margin-bottom:12px; }
.map-table { display:flex; flex-direction:column; gap:6px; }
.mt-row { display:flex; align-items:center; gap:10px; padding:6px 10px; border-radius:6px; background:rgba(64,158,255,0.05); }
.mt-name { font-size:13px; color:#eaf3ff; font-weight:600; width:80px; flex-shrink:0; }
.mt-tag  { font-size:12px; font-weight:700; width:70px; flex-shrink:0; }
.mt-bar-wrap { flex:1; height:6px; background:rgba(64,158,255,0.15); border-radius:3px; overflow:hidden; }
.mt-bar { height:100%; border-radius:3px; transition:width 0.5s; }
.mt-val { font-size:12px; color:#7f97c7; width:30px; text-align:right; flex-shrink:0; }
.expand-enter-active { transition:all 0.3s ease; }
.expand-leave-active { transition:all 0.2s ease; }
.expand-enter-from,.expand-leave-to { opacity:0; max-height:0; }
.expand-enter-to,.expand-leave-from { opacity:1; max-height:200px; }

@media (max-width:1400px) {
  .dim-row { grid-template-columns:repeat(3,1fr); }
  .top-row { grid-template-columns:1fr; }
  .bottom-row { grid-template-columns:1fr; }
}
</style>