"""
LLM 客户端 - 统一调用 OpenAI 兼容接口
"""
import asyncio
import json
import os
from typing import Any, Optional

from config import OPENAI_API_KEY, OPENAI_API_BASE, OPENAI_MODEL

try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


class LLMClient:
    """LLM 客户端，支持 OpenAI 及兼容 API"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.api_key = api_key or OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        self.base_url = base_url or OPENAI_API_BASE
        self.model = model or OPENAI_MODEL
        self._client: Optional[Any] = None

    def _get_client(self) -> Any:
        if not HAS_OPENAI:
            raise RuntimeError("未安装 openai 库，请运行 pip install openai")
        if not self.api_key:
            raise ValueError("未配置 OPENAI_API_KEY，请在 .env 中设置")
        if self._client is None:
            base = self.base_url.rstrip("/")
            self._client = OpenAI(api_key=self.api_key, base_url=base)
        return self._client

    def chat(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        """发送对话请求，返回模型回复文本"""
        client = self._get_client()
        resp = client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return resp.choices[0].message.content or ""

    def chat_json(
        self,
        messages: list[dict],
        temperature: float = 0.2,
    ) -> dict | list:
        """请求并解析为 JSON 返回"""
        content = self.chat(messages, temperature=temperature)
        # 尝试提取 ```json ... ``` 块
        if "```json" in content:
            start = content.find("```json") + 7
            end = content.find("```", start)
            content = content[start:end].strip()
        elif "```" in content:
            start = content.find("```") + 3
            end = content.find("```", start)
            content = content[start:end].strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"raw": content}

    async def achat(
        self,
        messages: list[dict],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        """异步聊天请求。"""
        # 如果 openai 库提供 async API 可调直接使用；否则线程池方式。
        if hasattr(self, 'achat') and False:
            # 这里是占位（若未来支持），当前执行兼容
            pass
        return await asyncio.to_thread(self.chat, messages, temperature, max_tokens)

    async def achat_json(
        self,
        messages: list[dict],
        temperature: float = 0.2,
    ) -> dict | list:
        """异步解析 JSON 返回。"""
        content = await self.achat(messages, temperature=temperature)
        if "```json" in content:
            start = content.find("```json") + 7
            end = content.find("```", start)
            content = content[start:end].strip()
        elif "```" in content:
            start = content.find("```") + 3
            end = content.find("```", start)
            content = content[start:end].strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"raw": content}
