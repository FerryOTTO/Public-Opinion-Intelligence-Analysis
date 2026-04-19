"""
网络抓取模块 - RSS 与 HTML 抓取
"""
import re
import xml.etree.ElementTree as ET
from typing import Any
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from config import SCRAPE_HEADERS, SCRAPE_TIMEOUT

try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False

try:
    import feedparser
    HAS_FEEDPARSER = True
except ImportError:
    HAS_FEEDPARSER = False


def fetch_url(url: str) -> str:
    """获取 URL 内容"""
    resp = requests.get(url, headers=SCRAPE_HEADERS, timeout=SCRAPE_TIMEOUT)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding or "utf-8"
    return resp.text


async def async_fetch_url(url: str) -> str:
    """异步获取 URL 内容，优先 aiohttp，fallback requests."""
    if HAS_AIOHTTP:
        timeout = aiohttp.ClientTimeout(total=SCRAPE_TIMEOUT)
        async with aiohttp.ClientSession(headers=SCRAPE_HEADERS, timeout=timeout) as session:
            async with session.get(url) as resp:
                resp.raise_for_status()
                text = await resp.text()
                return text
    else:
        import asyncio
        return await asyncio.to_thread(fetch_url, url)


async def async_scrape_rss(url: str, max_items: int = 20) -> list[dict]:
    """异步抓取 RSS 源，内部可能使用线程执行同步解析。"""
    import asyncio
    if HAS_FEEDPARSER:
        def parse_feed():
            items = []
            feed = feedparser.parse(url)
            for i, entry in enumerate(feed.entries[:max_items]):
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                if isinstance(summary, dict):
                    summary = summary.get("value", str(summary))
                link = entry.get("link", "")
                published = entry.get("published", entry.get("updated", ""))
                if summary:
                    try:
                        summary = BeautifulSoup(str(summary), "lxml").get_text(separator=" ", strip=True)
                    except Exception:
                        summary = str(summary)[:500]
                text = f"{title} {summary}".strip() or title
                if text:
                    items.append({"text": text[:500], "title": title, "link": link, "published": published, "source": url})
            return items

        return await asyncio.to_thread(parse_feed)

    # 兼容无 feedparser
    return await asyncio.to_thread(scrape_rss, url, max_items)


async def async_scrape_html(
    url: str,
    title_selector: str = "h1, h2, .title, .post-title",
    content_selector: str = "article, .content, .post-content, .article-body, p",
    max_items: int = 20,
) -> list[dict]:
    """异步抓取 HTML 页面文本。"""
    html = await async_fetch_url(url)
    soup = BeautifulSoup(html, "lxml")
    items = []

    for sel in [".item", ".list-item", "article", ".news-item", "li"]:
        blocks = soup.select(sel)
        if len(blocks) >= 2:
            for i, block in enumerate(blocks[:max_items]):
                title_el = block.select_one("a, .title, h3, h4")
                text_el = block.select_one("p, .summary, .desc")
                title = (title_el.get_text(strip=True) if title_el else "") or ""
                text = (text_el.get_text(strip=True) if text_el else "") or title
                if text and len(text) > 5:
                    items.append({"text": text[:500], "title": title[:200], "source": url})
            if items:
                return items

    for sel in content_selector.split(", "):
        el = soup.select_one(sel.strip())
        if el:
            text = el.get_text(separator=" ", strip=True)
            if len(text) > 20:
                items.append({"text": text[:2000], "source": url})
                return items

    for p in soup.find_all("p")[:max_items]:
        t = p.get_text(strip=True)
        if len(t) > 15:
            items.append({"text": t[:500], "source": url})

    return items


async def async_scrape_urls(urls: list[str], max_items_per: int = 20) -> list[dict]:
    """异步批量抓取 URL，支持 RSS/<code>html。</code>"""
    import asyncio
    all_items = []

    async def _scrape(url):
        try:
            if any(url.strip().lower().endswith(x) for x in [".rss", ".xml", "rss", "feed"]):
                items = await async_scrape_rss(url, max_items_per)
            else:
                items = await async_scrape_html(url, max_items=max_items_per)
            for it in items:
                it["source"] = url
            return items
        except Exception:
            return []

    tasks = [_scrape(url) for url in urls]
    chunks = await asyncio.gather(*tasks)
    for sub in chunks:
        all_items.extend(sub)
    return all_items


def scrape_rss(url: str, max_items: int = 20) -> list[dict]:
    """从 RSS/Atom 源抓取条目"""
    items = []
    try:
        if HAS_FEEDPARSER:
            feed = feedparser.parse(url)
            for i, entry in enumerate(feed.entries[:max_items]):
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                if isinstance(summary, dict):
                    summary = summary.get("value", str(summary))
                link = entry.get("link", "")
                published = entry.get("published", entry.get("updated", ""))
                # 清理 HTML 标签
                if summary:
                    try:
                        summary = BeautifulSoup(str(summary), "lxml").get_text(separator=" ", strip=True)
                    except Exception:
                        summary = str(summary)[:500]
                text = f"{title} {summary}".strip() or title
                if text:
                    items.append({
                        "text": text[:500],
                        "title": title,
                        "link": link,
                        "published": published,
                        "source": url,
                    })
        else:
            # 备选：用 requests + ET 解析 RSS
            xml_text = fetch_url(url)
            root = ET.fromstring(xml_text)
            ns = {"atom": "http://www.w3.org/2005/Atom", "dc": "http://purl.org/dc/elements/1.1/"}
            for item in root.findall(".//item")[:max_items]:
                title_el = item.find("title")
                desc_el = item.find("description") or item.find("content")
                link_el = item.find("link")
                title = (title_el.text or "").strip() if title_el is not None else ""
                desc = (desc_el.text or "").strip() if desc_el is not None else ""
                link = (link_el.text or "").strip() if link_el is not None else ""
                desc = re.sub(r"<[^>]+>", " ", desc)
                text = f"{title} {desc}".strip() or title
                if text:
                    items.append({"text": text[:500], "title": title, "link": link, "source": url})
    except Exception as e:
        raise RuntimeError(f"RSS 抓取失败 {url}: {e}") from e
    return items


def scrape_html(
    url: str,
    title_selector: str = "h1, h2, .title, .post-title",
    content_selector: str = "article, .content, .post-content, .article-body, p",
    max_items: int = 20,
) -> list[dict]:
    """从 HTML 页面抓取文本（适用于单页或列表页）"""
    html = fetch_url(url)
    soup = BeautifulSoup(html, "lxml")
    items = []

    # 尝试按列表项抓取（如新闻列表）
    for sel in [".item", ".list-item", "article", ".news-item", "li"]:
        blocks = soup.select(sel)
        if len(blocks) >= 2:
            for i, block in enumerate(blocks[:max_items]):
                title_el = block.select_one("a, .title, h3, h4")
                text_el = block.select_one("p, .summary, .desc")
                title = (title_el.get_text(strip=True) if title_el else "") or ""
                text = (text_el.get_text(strip=True) if text_el else "") or title
                if text and len(text) > 5:
                    items.append({"text": text[:500], "title": title[:200], "source": url})
            if items:
                return items

    # 单页模式：整页主要内容
    for sel in content_selector.split(", "):
        el = soup.select_one(sel.strip())
        if el:
            text = el.get_text(separator=" ", strip=True)
            if len(text) > 20:
                items.append({"text": text[:2000], "source": url})
                return items

    # 兜底：取所有段落
    for p in soup.find_all("p")[:max_items]:
        t = p.get_text(strip=True)
        if len(t) > 15:
            items.append({"text": t[:500], "source": url})
    return items


def scrape_urls(urls: list[str], max_items_per: int = 20) -> list[dict]:
    """批量抓取多个 URL，自动识别 RSS 或 HTML"""
    all_items = []
    for url in urls:
        try:
            if any(url.strip().lower().endswith(x) for x in [".rss", ".xml", "rss", "feed"]):
                items = scrape_rss(url, max_items_per)
            else:
                items = scrape_html(url, max_items=max_items_per)
            for it in items:
                it["source"] = url
            all_items.extend(items)
        except Exception:
            continue
    return all_items
