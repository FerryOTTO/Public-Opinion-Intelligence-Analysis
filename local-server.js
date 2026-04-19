import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3300;

app.use(cors());
app.use(express.json());

const USE_REAL_BACKEND = false;
const REAL_BACKEND_BASE_URL = 'http://10.0.0.88:8080/api';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-94081096dbf94a378e0a34f2d69792aa';
const DASHSCOPE_MODEL = process.env.DASHSCOPE_MODEL || 'qwen3.6-plus';

async function proxyToAgent(req, res, targetEndpoint) {
  if (!USE_REAL_BACKEND) {
    console.log(`[开发模式] ${req.path} -> 拦截请求，触发前端 LOCAL_MOCK_DATA`);
    return res.status(500).json({ status: 'mock', message: '本地开发模式：触发兜底' });
  }
  try {
    const targetUrl = `${REAL_BACKEND_BASE_URL}${targetEndpoint}`;
    console.log(`[网关转发] 请求真实 Agent: ${targetUrl}`);
    const response = await axios.post(targetUrl, req.body, { timeout: 15000 });

    const data = response.data;
    if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return res.status(500).json({ status: 'invalid', message: 'Agent 返回无效数据' });
    }
    return res.json({ status: 'ok', data: data });
  } catch (error) {
    console.error(`[转发失败] Agent 异常: ${targetEndpoint}`, error.message);
    return res.status(500).json({ status: 'error', message: `Agent 异常：${error.message}` });
  }
}

app.post('/monitor/search-events', (req, res) => {
  try {
    const keyword = req.body.keyword || req.body.q || '';
    if (!keyword) {
      return res.json({ status: 'ok', data: [] });
    }

    const dbPath = path.join(process.cwd(), 'src/mock/events.json');

    if (!fs.existsSync(dbPath)) {
      console.warn(`[本地搜索] 警告：找不到数据库文件 ${dbPath}`);
      return res.json({ status: 'ok', data: [] });
    }

    const events = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    const results = events.filter(e =>
      (e.title && e.title.includes(keyword)) ||
      (e.summary && e.summary.includes(keyword)) ||
      (e.content && e.content.includes(keyword))
    );

    console.log(`[本地搜索] 关键字 "${keyword}" 找到 ${results.length} 条结果`);
    return res.json({ status: 'ok', data: results });
  } catch (error) {
    console.error('[本地搜索] 代码执行异常:', error);
    return res.json({ status: 'error', data: [] });
  }
});

app.post('/public-opinion-output/generate', async (req, res) => {
  try {
    const { keyword, tone, format, scene, extraPrompt = '' } = req.body || {};

    if (!keyword || !tone || !format || !scene) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    const systemPrompt = [
      '你是一名舆情内容生成助手。',
      '请优先围绕娱乐、消费、商品、品牌、明星活动、联名营销、新品发布等主题生成内容。',
      '尽量避免政治、战争、国际冲突、意识形态类表述。',
      '输出内容要适合中文互联网传播场景，语言自然、清晰、具有传播感。',
      '请严格只返回 JSON，不要添加 Markdown 代码块。',
      'JSON 结构必须为：{"title":"","content":"","tags":[""],"scenario":"","riskLevel":"低"}'
    ].join(' ');

    const userPrompt = [
      `主题：${keyword}`,
      `倾向：${tone}`,
      `形式：${format}`,
      `场景：${scene}`,
      `附加要求：${extraPrompt || '突出娱乐或商品传播感，减少政治话题联想。'}`,
      '请生成一条适合该场景的舆情内容，title 要简洁，content 要完整，tags 返回 3 到 5 个，riskLevel 返回 低 / 中 / 高 中的一个。'
    ].join('\n');

    const response = await axios.post(
      `${DASHSCOPE_BASE_URL}/chat/completions`,
      {
        model: DASHSCOPE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.85,
        response_format: { type: 'json_object' },
      },
      {
        timeout: 60000,
        headers: {
          Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ message: '模型未返回内容' });
    }

    const parsed = JSON.parse(content);
    const safeData = {
      title: parsed.title || `${keyword} 内容生成`,
      content: parsed.content || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      scenario: parsed.scenario || scene,
      riskLevel: ['低', '中', '高'].includes(parsed.riskLevel) ? parsed.riskLevel : '低',
    };

    return res.json(safeData);
  } catch (error) {
    const detail = error?.response?.data || error.message;
    console.error('[舆情生成] 模型调用失败:', detail);

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ message: '模型响应超时，请稍后重试' });
    }

    return res.status(500).json({ message: typeof detail === 'string' ? detail : '模型调用失败，请检查 API Key、模型名或网络连接' });
  }
});

app.post('/dashboard/index', (req, res) => proxyToAgent(req, res, '/agent/dashboard'));

app.post('/analysis/portrait', (req, res) => proxyToAgent(req, res, '/agent/portrait'));
app.post('/analysis/sentiment', (req, res) => proxyToAgent(req, res, '/agent/sentiment'));
app.post('/analysis/opinion', (req, res) => proxyToAgent(req, res, '/agent/opinion'));
app.post('/analysis/time-spatial', (req, res) => proxyToAgent(req, res, '/agent/time-spatial'));
app.post('/analysis/history-compare', (req, res) => proxyToAgent(req, res, '/agent/history-compare'));
app.post('/analysis/multi-modal', (req, res) => proxyToAgent(req, res, '/agent/multi-modal'));
app.post('/analysis/policy', (req, res) => proxyToAgent(req, res, '/agent/policy'));

app.post('/monitor/event-overview', (req, res) => proxyToAgent(req, res, '/monitor/event-overview'));
app.post('/monitor/overview', (req, res) => proxyToAgent(req, res, '/monitor/overview'));
app.post('/monitor/hot-topics', (req, res) => proxyToAgent(req, res, '/monitor/hot-topics'));
app.post('/monitor/stream', (req, res) => proxyToAgent(req, res, '/monitor/stream'));
app.post('/monitor/topic-detail', (req, res) => proxyToAgent(req, res, '/monitor/topic-detail'));

app.post('/security/overview', (req, res) => proxyToAgent(req, res, '/security/overview'));
app.post('/security/threat-detect', (req, res) => proxyToAgent(req, res, '/agent/threat-detect'));
app.post('/security/rumor-detect', (req, res) => proxyToAgent(req, res, '/security/rumor-detect'));
app.post('/security/map', (req, res) => proxyToAgent(req, res, '/security/map'));

app.post('/trace/overview', (req, res) => proxyToAgent(req, res, '/trace/overview'));
app.post('/trace/spread-path', (req, res) => proxyToAgent(req, res, '/trace/spread-path'));
app.post('/trace/source-trace', (req, res) => proxyToAgent(req, res, '/trace/source-trace'));
app.post('/trace/spread-map', (req, res) => proxyToAgent(req, res, '/trace/spread-map'));

app.post('/warning/overview', (req, res) => proxyToAgent(req, res, '/warning/overview'));
app.post('/warning/alerts', (req, res) => proxyToAgent(req, res, '/warning/alerts'));
app.post('/warning/rules', (req, res) => proxyToAgent(req, res, '/warning/rules'));
app.post('/warning/rules/save', (req, res) => proxyToAgent(req, res, '/warning/rules/save'));
app.post('/warning/report-preview', (req, res) => proxyToAgent(req, res, '/warning/report-preview'));

app.post('/agent/overview', (req, res) => proxyToAgent(req, res, '/agent/overview'));
app.post('/agent/list', (req, res) => proxyToAgent(req, res, '/agent/list'));
app.post('/agent/logs', (req, res) => proxyToAgent(req, res, '/agent/logs'));

app.post('/data-collection/overview', (req, res) => proxyToAgent(req, res, '/data-collection/overview'));
app.post('/data-collection/tasks', (req, res) => proxyToAgent(req, res, '/data-collection/tasks'));
app.post('/data-collection/tasks/create', (req, res) => proxyToAgent(req, res, '/data-collection/tasks/create'));
app.post('/data-collection/distribution/time', (req, res) => proxyToAgent(req, res, '/data-collection/distribution/time'));
app.post('/data-collection/distribution/spatial', (req, res) => proxyToAgent(req, res, '/data-collection/distribution/spatial'));

app.listen(port, () => {
  console.log(`\n=== 极简网关已启动: http://localhost:${port} ===`);
  console.log(`状态: ${USE_REAL_BACKEND ? '🟢 转发真实 Agent' : '🟡 未连 Agent，部分页面依赖前端兜底 / 本地模型接口'}\n`);
});
