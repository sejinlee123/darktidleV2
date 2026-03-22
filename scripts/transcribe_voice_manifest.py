#!/usr/bin/env python3
"""
Fill `text` on each voice-manifest entry using local OpenAI Whisper (free, offline).

Setup (one time):
  python -m venv .venv-transcribe
  .venv-transcribe\\Scripts\\activate   # Windows
  pip install -r scripts/requirements-whisper.txt

Run:
  python scripts/transcribe_voice_manifest.py
  python scripts/transcribe_voice_manifest.py --limit 5
  python scripts/transcribe_voice_manifest.py --force
  python scripts/transcribe_voice_manifest.py --model base --device cpu

Requires:
  - src/data/voice-manifest.json (run: pnpm voices:manifest)
  - public/Darktide_Voices/**/*.mp3
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "src" / "data" / "voice-manifest.json"
VOICES_ROOT = ROOT / "public" / "Darktide_Voices"
PLACEHOLDER = "Placeholder"


def utc_iso_z() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def save_manifest(data: dict) -> None:
    data["generatedAt"] = utc_iso_z()
    data["count"] = len(data["entries"])
    MANIFEST_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Local Whisper: fill voice-manifest text")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-transcribe every clip (including ones that already have text)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Only first N clips that need transcription",
    )
    parser.add_argument(
        "--model",
        default="small",
        help="Whisper model id (e.g. tiny, base, small, medium, large, large-v3). Default: small.",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="cpu or cuda (default: cuda if available, else cpu)",
    )
    parser.add_argument(
        "--checkpoint-every",
        type=int,
        default=5,
        help="Write manifest to disk every N completed clips",
    )
    args = parser.parse_args()

    if not MANIFEST_PATH.is_file():
        print("Missing manifest - run: pnpm voices:manifest", file=sys.stderr)
        return 1
    if not VOICES_ROOT.is_dir():
        print("Missing voices folder:", VOICES_ROOT, file=sys.stderr)
        return 1

    try:
        import whisper
    except ImportError:
        print(
            "Whisper not installed. Run:\n"
            "  pip install -r scripts/requirements-whisper.txt",
            file=sys.stderr,
        )
        return 1

    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    entries = data.get("entries")
    if not isinstance(entries, list):
        print("Invalid manifest: expected entries array", file=sys.stderr)
        return 1

    if args.device:
        device = args.device
    else:
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"Loading Whisper model {args.model!r} on {device!r} (first run may download weights)...")
    model = whisper.load_model(args.model, device=device)
    use_fp16 = device == "cuda"

    indices: list[int] = []
    for i, e in enumerate(entries):
        t = e.get("text")
        needs = (
            args.force
            or not t
            or t == PLACEHOLDER
            or (isinstance(t, str) and not t.strip())
        )
        if needs:
            indices.append(i)

    if args.limit is not None:
        indices = indices[: max(0, args.limit)]

    print(f"Transcribing {len(indices)} of {len(entries)} clips")

    if not indices:
        print("Nothing to do.")
        return 0

    for done_idx, entry_index in enumerate(indices):
        e = entries[entry_index]
        rel = e["path"]
        audio_path = VOICES_ROOT / Path(rel)
        if not audio_path.is_file():
            print(f"  skip (missing file): {rel}")
            continue

        try:
            result = model.transcribe(
                str(audio_path),
                language="en",
                fp16=use_fp16,
                verbose=False,
            )
            text = (result.get("text") or "").strip()
            e["text"] = text if text else PLACEHOLDER
        except Exception as ex:  # noqa: BLE001
            print(f"  error {rel}: {ex}")
            e["text"] = e.get("text") or PLACEHOLDER

        n = done_idx + 1
        if n % args.checkpoint_every == 0 or n == len(indices):
            save_manifest(data)
            print(f"  checkpoint {n}/{len(indices)} - {rel}")

    save_manifest(data)
    print("Done.", MANIFEST_PATH)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
