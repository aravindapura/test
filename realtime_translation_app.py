#!/usr/bin/env python3
"""CLI-приложение для синхронного перевода RU<->EN в реальном времени.

Как это работает:
- Пользователь вставляет фрагменты речи (транскрипт лекции) построчно.
- Скрипт определяет язык входа (русский или английский).
- Отправляет фрагмент в OpenAI с инструкцией на максимально качественный перевод.
- Возвращает перевод сразу после получения ответа от модели.

Важно:
- API-ключ НЕ хранится в коде. Используйте переменную окружения OPENAI_API_KEY.
"""

from __future__ import annotations

import os
import re
import sys
from dataclasses import dataclass

from openai import OpenAI

MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1")

TRANSLATION_SYSTEM_PROMPT = """
You are a professional real-time interpreter for live lectures.

Your job:
- Translate bidirectionally between Russian and English with maximum quality.
- Detect source language automatically (Russian or English).
- Translate only the current input segment; do not add commentary.
- Preserve meaning, tone, technical terms, formulas, names, and numbers.
- If a term is ambiguous, prefer the lecture-appropriate technical meaning.
- Keep output concise and naturally spoken.
- Do not censor harmless educational content.

Output rules:
- Return only the translated text.
- Keep paragraph breaks when they improve readability.
""".strip()


@dataclass
class TranslationResult:
    source_lang: str
    target_lang: str
    text: str


def detect_ru_or_en(text: str) -> str:
    """Грубая эвристика определения языка: ru/en."""
    cyrillic = len(re.findall(r"[А-Яа-яЁё]", text))
    latin = len(re.findall(r"[A-Za-z]", text))

    if cyrillic > latin:
        return "ru"
    return "en"


def target_language(source_language: str) -> str:
    return "en" if source_language == "ru" else "ru"


def build_user_prompt(text: str, source: str, target: str) -> str:
    return (
        f"Source language: {source}\n"
        f"Target language: {target}\n\n"
        "Translate this live lecture segment now:\n"
        f"{text}"
    )


def translate_segment(client: OpenAI, text: str) -> TranslationResult:
    source = detect_ru_or_en(text)
    target = target_language(source)

    response = client.responses.create(
        model=MODEL,
        input=[
            {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(text, source, target)},
        ],
        temperature=0.2,
    )

    translated = (response.output_text or "").strip()
    if not translated:
        translated = "[Пустой ответ модели — попробуйте отправить сегмент повторно]"

    return TranslationResult(source_lang=source, target_lang=target, text=translated)


def print_header() -> None:
    print("=" * 72)
    print("Синхронный переводчик лекций RU <-> EN (OpenAI)")
    print("Вставляйте реплики построчно. Enter — перевод. /exit — выход.")
    print(f"Модель: {MODEL}")
    print("=" * 72)


def main() -> int:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print(
            "Ошибка: не задан OPENAI_API_KEY.\n"
            "Пример:\n"
            "  export OPENAI_API_KEY='your_api_key'\n"
            "  python realtime_translation_app.py",
            file=sys.stderr,
        )
        return 1

    client = OpenAI(api_key=api_key)
    print_header()

    while True:
        try:
            raw = input("\nВы: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nЗавершение.")
            return 0

        if not raw:
            continue
        if raw.lower() in {"/exit", "exit", "quit", "/quit"}:
            print("Выход.")
            return 0

        try:
            result = translate_segment(client, raw)
        except Exception as exc:  # noqa: BLE001
            print(f"Ошибка перевода: {exc}", file=sys.stderr)
            continue

        direction = f"{result.source_lang.upper()} -> {result.target_lang.upper()}"
        print(f"\n[{direction}] {result.text}")


if __name__ == "__main__":
    raise SystemExit(main())
