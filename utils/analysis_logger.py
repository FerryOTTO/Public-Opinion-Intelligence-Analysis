"""
分析日志模块 - 记录多Agent协同分析的完整过程
"""
import json
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Optional

from config import ANALYSIS_LOG_DIR, ANALYSIS_LOG_ENABLED, ANALYSIS_LOG_FORMAT


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


@dataclass
class LogEntry:
    """单条分析日志条目"""

    timestamp: str
    level: LogLevel
    agent_name: str
    action: str
    message: str
    data: Optional[dict] = None
    duration_ms: Optional[float] = None

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "level": self.level.value,
            "agent": self.agent_name,
            "action": self.action,
            "message": self.message,
            "data": self.data,
            "duration_ms": self.duration_ms,
        }


class AnalysisLogger:
    """分析日志记录器 - 输出Agent执行过程"""

    def __init__(
        self,
        session_id: Optional[str] = None,
        log_dir: Optional[Path] = None,
        enabled: bool = True,
        log_format: str = "json",
    ):
        self.session_id = session_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_dir = Path(log_dir or ANALYSIS_LOG_DIR)
        self.enabled = enabled and ANALYSIS_LOG_ENABLED
        self.log_format = log_format or ANALYSIS_LOG_FORMAT
        self.entries: list[LogEntry] = []
        self._log_file: Optional[Path] = None

    def _get_log_file(self) -> Path:
        if self._log_file is None:
            ext = "jsonl" if self.log_format == "json" else "log"
            self._log_file = self.log_dir / f"analysis_{self.session_id}.{ext}"
        return self._log_file

    def _write_entry(self, entry: LogEntry):
        """写入单条日志到文件"""
        if not self.enabled:
            return
        log_file = self._get_log_file()
        try:
            with open(log_file, "a", encoding="utf-8") as f:
                if self.log_format == "json":
                    f.write(json.dumps(entry.to_dict(), ensure_ascii=False) + "\n")
                else:
                    line = (
                        f"[{entry.timestamp}] [{entry.level.value}] [{entry.agent_name}] "
                        f"{entry.action}: {entry.message}"
                    )
                    if entry.duration_ms is not None:
                        line += f" (耗时: {entry.duration_ms:.2f}ms)"
                    if entry.data:
                        line += f"\n  数据: {json.dumps(entry.data, ensure_ascii=False, default=str)}"
                    f.write(line + "\n")
        except Exception as e:
            print(f"写入分析日志失败: {e}")

    def log(
        self,
        agent_name: str,
        action: str,
        message: str,
        level: LogLevel = LogLevel.INFO,
        data: Optional[dict] = None,
        duration_ms: Optional[float] = None,
    ):
        """记录分析日志"""
        entry = LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level,
            agent_name=agent_name,
            action=action,
            message=message,
            data=data,
            duration_ms=duration_ms,
        )
        self.entries.append(entry)
        self._write_entry(entry)

    def debug(self, agent_name: str, action: str, message: str, **kwargs):
        self.log(agent_name, action, message, LogLevel.DEBUG, **kwargs)

    def info(self, agent_name: str, action: str, message: str, **kwargs):
        self.log(agent_name, action, message, LogLevel.INFO, **kwargs)

    def warning(self, agent_name: str, action: str, message: str, **kwargs):
        self.log(agent_name, action, message, LogLevel.WARNING, **kwargs)

    def error(self, agent_name: str, action: str, message: str, **kwargs):
        self.log(agent_name, action, message, LogLevel.ERROR, **kwargs)

    def export_summary(self) -> dict:
        """导出日志摘要"""
        return {
            "session_id": self.session_id,
            "total_entries": len(self.entries),
            "log_file": str(self._get_log_file()) if self._log_file else None,
            "agents_invoked": list(set(e.agent_name for e in self.entries)),
            "entries": [e.to_dict() for e in self.entries],
        }

    def save_full_report(self, filepath: Optional[Path] = None) -> Path:
        """保存完整分析报告到JSON文件"""
        path = filepath or self.log_dir / f"report_{self.session_id}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.export_summary(), f, ensure_ascii=False, indent=2)
        return path
