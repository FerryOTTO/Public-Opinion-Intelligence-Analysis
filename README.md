# 多Agent协同舆情分析智能体

基于多Agent协作的舆情分析系统，支持**网络抓取**与 **LLM 智能分析**，具备完整分析日志输出。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator 编排器                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Collector    │→ │ Sentiment    │→ │ Topic        │       │
│  │ 网络抓取     │  │ LLM情感分析  │  │ LLM主题提取  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ↓                                 │
│                   ┌──────────────┐                           │
│                   │ Reporter     │                           │
│                   │ LLM报告生成  │                           │
│                   └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────────┐
              │   AnalysisLogger 分析日志    │
              └─────────────────────────────┘
```

## 功能特性

- **网络抓取**：RSS 订阅源、网页 URL 抓取
- **LLM 分析**：情感分析、主题提取、报告生成均使用大模型（OpenAI 兼容 API）
- **分析日志**：完整记录各 Agent 执行过程，支持 JSONL / JSON 导出

## 环境配置

### 1. 安装依赖

```bash
cd c:\agent
pip install -r requirements.txt
```

### 2. 配置 LLM API

复制 `.env.example` 为 `.env`，填入 API 配置。

**全局配置**（三个 Agent 共用）：
```bash
OPENAI_API_KEY=sk-xxx
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

**各 Agent 单独配置**（可选，不填则用全局）：
```bash
# 情感分析 - 可用小模型
SENTIMENT_API_BASE=http://localhost:11434/v1
SENTIMENT_MODEL=qwen2.5:7b

# 主题提取
TOPIC_API_BASE=http://localhost:11434/v1
TOPIC_MODEL=qwen2.5:7b

# 报告生成 - 可用大模型
REPORTER_API_BASE=https://api.deepseek.com/v1
REPORTER_MODEL=deepseek-chat
```

## 使用

### 从网络抓取 + 分析（默认）

```bash
python main.py --scrape
```

### 指定 RSS 源

```bash
python main.py --rss https://feeds.bbci.co.uk/news/rss.xml
```

### 指定网页 URL

```bash
python main.py --url https://example.com/news
```

### 手动输入文本 / 文件

```bash
python main.py -i "评论内容1" "评论内容2"
python main.py -i data.txt -o ./reports
```

### 仅控制台输出

```bash
python main.py --scrape --no-save
```

## 分析日志

- **实时日志**：`logs/analysis/analysis_<session_id>.jsonl`
- **完整报告**：`logs/舆情报告_<session_id>.md`、`logs/分析日志_<session_id>.json`

## 目录结构

```
c:\agent\
├── agents/
│   ├── base_agent.py
│   ├── collector_agent.py   # 网络抓取
│   ├── sentiment_agent.py   # LLM 情感分析
│   ├── topic_agent.py       # LLM 主题提取
│   └── reporter_agent.py    # LLM 报告生成
├── utils/
│   ├── analysis_logger.py
│   ├── llm_client.py
│   └── scraper.py
├── config.py
├── orchestrator.py
├── main.py
├── .env.example
└── requirements.txt
```

## License

MIT
