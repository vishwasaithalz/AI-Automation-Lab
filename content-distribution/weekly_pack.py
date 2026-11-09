#!/usr/bin/env python3
"""Make an offline seven-day, cross-platform editorial approval board.

No login, network, scraping, publishing, or schedule write. Python 3.10+.
One factual source story becomes *adapted drafts* for appropriate audiences.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

from build import build_drafts, validate

PLATFORMS = ("instagram", "facebook", "x", "youtube", "quora", "medium", "devto", "hacker_news")
TECH_ONLY = ("quora", "medium", "devto", "hacker_news")
ALLOWED_AUDIENCES = ("nostalgia", "technical")
REQUIRES_MEDIA = {"instagram", "facebook", "youtube"}
MANUAL_ONLY = {"quora", "medium", "hacker_news"}


def check_week(data: dict) -> list[dict]:
    try:
        start = dt.date.fromisoformat(data["week_start"])
    except (ValueError, KeyError, TypeError) as exc:
        raise ValueError("week_start must be ISO YYYY-MM-DD") from exc
    stories = data.get("stories")
    if not isinstance(stories, list) or not 1 <= len(stories) <= 7:
        raise ValueError("Use 1 to 7 source stories in a weekly approval packet")
    seen = set()
    for i, story in enumerate(stories):
        validate(story)
        if story["id"] in seen:
            raise ValueError("Duplicate source story id")
        seen.add(story["id"])
        audience = story.get("audience", "technical")
        if audience not in ALLOWED_AUDIENCES:
            raise ValueError("audience must be nostalgia or technical")
        if "post_date" in story and story["post_date"] != (start + dt.timedelta(days=i)).isoformat():
            raise ValueError("post_date must match weekly sequence")
        if "hacker_news" in story.get("platforms", []) and audience != "technical":
            raise ValueError("Hacker News is reserved for qualified technical submissions")
        platforms = story.get("platforms")
        if platforms is not None:
            if not isinstance(platforms, list) or any(p not in PLATFORMS for p in platforms):
                raise ValueError("Unknown publishing destination")
            if len(set(platforms)) != len(platforms):
                raise ValueError("Duplicate platform in story")
        if not urlsplit(story["source_url"]).hostname:
            raise ValueError("Missing verifiable evidence URL")
    return stories


def chosen_platforms(story: dict) -> list[str]:
    if "platforms" in story:
        return story["platforms"]
    if story.get("audience", "technical") == "nostalgia":
        return ["instagram", "facebook", "x", "youtube"]
    return ["x", "quora", "medium", "devto", "hacker_news"]


def build_pack(data: dict) -> tuple[str, dict]:
    stories = check_week(data)
    output = {
        "week_start": data["week_start"],
        "status": "HUMAN_APPROVAL_REQUIRED",
        "publication_count": 0,
        "queue_count": 0,
        "disclaimer": "Source facts are supplied by the author; this offline tool does not verify them.",
        "stories": []
    }
    rows = [
        "# Seven-Day Omnichannel Approval Desk",
        "",
        "**NOT PUBLISHED OR SCHEDULED.** Approve each copy, media, rights and destination separately. This is a human review manifest, not an automated publisher.",
        "",
        "One original story can support multiple original adaptations. Hacker News is manual, human-written only. Quora needs a real question; Medium has no new API integration tokens; DEV.to accepts unpublished drafts only after a verified authenticated account.",
        ""
    ]
    for day, story in enumerate(stories):
        date = (dt.date.fromisoformat(data["week_start"]) + dt.timedelta(days=day)).isoformat()
        all_drafts, original = build_drafts(story)
        platforms = chosen_platforms(story)
        rec = {"date": date, "story_id": story["id"], "title": story["title"],
               "source": story["source_url"], "audience": story.get("audience", "technical"),
               "platforms": {}}
        rows += [f'## {date} | {story["title"]}', "", f'Original evidence: {story["source_url"]}', "", "Source assertions (not independently checked by generator):"]
        rows += [f'- {fact}' for fact in story["facts"]]
        rows += ["", "| Platform | Editorial state | Approval |", "| --- | --- | --- |"]
        for platform in platforms:
            if platform == "quora" and not story.get("quora_url"):
                state,copy = "NEEDS_REAL_QUESTION", "No draft without the verified matching question URL and wording."
            elif platform in REQUIRES_MEDIA:
                state = "MEDIA_PENDING"
                if platform == "instagram":
                    copy = (f'{story["summary"]}\n\n{story["lesson"]}\n\n'
                            'Which detail do you remember most? #NostalgiaEXE #RetroTech')
                elif platform == "facebook":
                    copy = (f'{story["title"]}\n\n{story["summary"]}\n\n'
                            f'{story["lesson"]}\n\nWhat was your experience?')
                else:
                    copy = (f'Title: {story["title"]} | #Shorts\n'
                            f'Hook: {story["summary"]}\n'
                            'Visual: original 9:16 period-inspired prop or rights-cleared archive.\n'
                            f'Payoff: {story["lesson"]}\n'
                            'RUNTIME: editorial target 25-40 s; media not rendered.\n'
                            'Subtitles and rights inventory REQUIRED.')
            elif platform == "x":
                state,copy = "EDITORIAL_REVIEW", all_drafts["x"]
            elif platform == "devto":
                state,copy = "NO_AUTHENTICATED_PUBLISHER", all_drafts["devto"]
            elif platform == "medium":
                state,copy = "MANUAL_IMPORT_ONLY", all_drafts["medium"]
            elif platform == "quora":
                state,copy = "MANUAL_QUESTION_REVIEW", all_drafts["quora"]
            elif platform == "hacker_news":
                state = "HUMAN_WRITTEN_SUBMISSION_ONLY"
                copy = ("Do not auto-post or publish generated HN content. Manually assess originality, "
                        "technical depth and relevance. Submit original source link, neutral title and "
                        "personally written context only when appropriate; no votes or engagement automation.")
            else:
                raise ValueError("Unknown platform")
            rec["platforms"][platform] = {
                "status": state, "approval": "PENDING", "media_verified": False,
                "posting_receipt": None, "draft": copy}
            rows.append(f'| {platform} | {state} | [ ] Approve / [ ] Revise / [ ] Reject |')
        rows += ["", "**Creative and release gate:** Original script and visuals; license/attribution record; captions and alt text; source citation; human review; stable public media URL where necessary; authenticated permitted publisher; deduplication by story ID and destination.", ""]
        output["stories"].append(rec)
    return "\n".join(rows), output


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input", type=Path)
    p.add_argument("--out", type=Path, default=Path("out/week-review"))
    args = p.parse_args()
    data = json.loads(args.input.read_text(encoding="utf8"))
    markdown, manifest = build_pack(data)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "APPROVAL.md").write_text(markdown + "\n", encoding="utf8")
    (args.out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"status": manifest["status"], "stories": len(manifest["stories"]), "published": 0}))


if __name__ == "__main__":
    main()
