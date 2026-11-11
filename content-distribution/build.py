#!/usr/bin/env python3
"""Turn one evidence-backed story into platform-specific, non-publishing drafts.

Python 3.10+. No dependencies, network calls, API tokens, or side effects
outside the selected output directory. Publication is deliberately separate.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

CHANNELS = ('x', 'quora', 'indie_hackers', 'medium', 'devto')


def valid_url(url: str) -> bool:
    try:
        parsed = urlsplit(url)
        return parsed.scheme == 'https' and bool(parsed.netloc) and not parsed.username and not parsed.password
    except ValueError:
        return False


def validate(story: dict) -> None:
    for key in ('id', 'title', 'summary', 'source_url', 'facts', 'lesson'):
        if not story.get(key):
            raise ValueError(f'Missing {key}: publication cannot be based on empty evidence')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', story['id']):
        raise ValueError('id must be lowercase words separated by hyphens')
    if not isinstance(story['facts'], list) or len(story['facts']) < 2:
        raise ValueError('At least two verifiable facts are required')
    if any(not isinstance(f, str) or len(f.strip()) < 12 for f in story['facts']):
        raise ValueError('Facts must be nonempty specific statements')
    if not valid_url(story['source_url']):
        raise ValueError('source_url must be an HTTPS source link')
    if story.get('canonical_url') and not valid_url(story['canonical_url']):
        raise ValueError('canonical_url must be HTTPS')
    if bool(story.get('quora_question')) != bool(story.get('quora_url')):
        raise ValueError('Quora question and verified URL must be provided together')
    if story.get('quora_url') and not valid_url(story['quora_url']):
        raise ValueError('quora_url must be HTTPS')


def bullets(facts: list[str]) -> str:
    return '\n'.join(f'- {f.rstrip(".") }.' for f in facts)


def build_drafts(story: dict) -> tuple[dict[str, str], dict]:
    validate(story)
    source = story['source_url']
    title = story['title'].strip()
    summary = story['summary'].strip()
    lesson = story['lesson'].strip()
    proof = bullets(story['facts'])
    author = 'Vishwas Aithal'

    x_text = f'{summary}\n\n{source}'
    if len(x_text) > 280:
        budget = 280 - len(source) - 3
        if budget < 35:
            raise ValueError('source_url is too long for a useful X post')
        x_text = summary[:budget - 1].rsplit(' ', 1)[0].rstrip(' .,:;') + '…\n\n' + source
    if len(x_text) > 280:
        raise ValueError('X draft exceeds the 280-character text safety budget')

    drafts: dict[str, str] = {'x': x_text}
    if story.get('quora_question'):
        drafts['quora'] = (f'### Answering: {story["quora_question"]}\n\n'
            f'{summary}\n\nWhat matters in practice:\n\n{proof}\n\n'
            f'{lesson}\n\nSource: {source}\n\n'
            'Editorial status: DRAFT ONLY. Check the actual question and competing answers before sharing.\n')
    drafts['indie_hackers'] = (f'# What building {title} taught me\n\n'
        f'Hi, I am {author}. Here is one practical lesson from a project I have been working on.\n\n'
        f'{summary}\n\nWhat I can verify:\n\n{proof}\n\n'
        f'What I would improve next: {lesson}\n\nProject evidence: {source}\n\n'
        'For builders who have shipped something similar: which tradeoff would you prioritize first?\n')
    drafts['medium'] = (f'# {title}\n\n*By {author}*\n\n'
        f'{summary}\n\n## Evidence behind the idea\n\n{proof}\n\n'
        f'## Lessons from the work\n\n{lesson}\n\n'
        f'## Explore the source\n\n{source}\n\n'
        '*Draft for editorial review. Adapt wording and add examples before importing.*\n')
    tags = story.get('devto_tags') or ['opensource', 'security', 'python']
    if len(tags) > 4 or any(not re.fullmatch(r'[a-z0-9]+', x) for x in tags):
        raise ValueError('DEV tags must be lowercase alphanumeric and <=4')
    frontmatter = ('---\n' + 'title: ' + json.dumps(title, ensure_ascii=False) + '\n'
                   'published: false\n' + 'tags: ' + ', '.join(tags) + '\n')
    if story.get('canonical_url'):
        frontmatter += f'canonical_url: {story["canonical_url"]}\n'
    frontmatter += '---\n\n'
    drafts['devto'] = (frontmatter + f'{summary}\n\n## What the project demonstrates\n\n'
        f'{proof}\n\n## Practical takeaways\n\n{lesson}\n\n'
        f'## Source and reproducibility\n\n{source}\n\n'
        '*Verify any code examples locally before publication.*\n')
    manifest = {
        'story_id': story['id'], 'title': title, 'source_url': source,
        'author': author, 'publication': 'NOT_PUBLISHED',
        'channels': {
            channel: {'status': 'draft_ready' if channel in drafts else 'needs_question',
                      'file': f'{channel}.md' if channel != 'x' else 'x.txt',
                      'requires_official_connected_publisher': True}
            for channel in CHANNELS
        },
        'approval': 'weekly_review_or_platform_native_publisher',
        'notes': 'This package has no automatic publishing path. X publishing is separately managed via verified Buffer connection.'
    }
    return drafts, manifest


def render(story: dict, dest: Path) -> dict:
    drafts, manifest = build_drafts(story)
    dest.mkdir(parents=True, exist_ok=True)
    for channel, text in drafts.items():
        filename = dest / (f'{channel}.txt' if channel == 'x' else f'{channel}.md')
        filename.write_text(text, encoding='utf-8')
    (dest / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('story', type=Path, help='JSON evidence-backed story')
    parser.add_argument('--output', type=Path, default=Path('out'))
    args = parser.parse_args()
    story = json.loads(args.story.read_text(encoding='utf-8'))
    manifest = render(story, args.output / story['id'])
    print(json.dumps({'output': str(args.output / story['id']),
                      'status': manifest['publication'],
                      'channels': manifest['channels']}, indent=2))


if __name__ == '__main__':
    main()
