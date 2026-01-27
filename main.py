#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path
from typing import NoReturn


PROJECT_ROOT = Path(__file__).resolve().parent


class CommandError(RuntimeError):
    pass


def eprint(message: str) -> None:
    print(message, file=sys.stderr)


def die(message: str, *, code: int = 1) -> NoReturn:
    eprint(f"error: {message}")
    raise SystemExit(code)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        die(f"Missing required file: {path}")
    except json.JSONDecodeError as exc:
        die(f"Invalid JSON in {path}: {exc}")


def require_file(path: Path) -> None:
    if not path.is_file():
        die(f"Missing required file: {path}")


def which(executable: str) -> str | None:
    return shutil.which(executable)


def require_executable(executable: str) -> str:
    path = which(executable)
    if path is None:
        die(f"Required executable not found in PATH: {executable}")
    return path


def run(cmd: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> None:
    env_merged = os.environ.copy()
    if env:
        env_merged.update(env)

    display = shlex.join(cmd)
    print(f"+ {display}")

    try:
        subprocess.run(cmd, cwd=str(cwd), env=env_merged, check=True)
    except FileNotFoundError:
        raise CommandError(f"Command not found: {cmd[0]}")
    except subprocess.CalledProcessError as exc:
        raise CommandError(f"Command failed (exit {exc.returncode}): {display}") from exc


def run_capture(cmd: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> str:
    env_merged = os.environ.copy()
    if env:
        env_merged.update(env)

    display = shlex.join(cmd)
    print(f"+ {display}")

    try:
        result = subprocess.run(
            cmd,
            cwd=str(cwd),
            env=env_merged,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
    except FileNotFoundError:
        raise CommandError(f"Command not found: {cmd[0]}")

    if result.returncode != 0:
        output = (result.stderr or result.stdout).strip()
        suffix = f": {output}" if output else ""
        raise CommandError(f"Command failed (exit {result.returncode}): {display}{suffix}")

    return result.stdout


def ensure_project_layout() -> None:
    require_file(PROJECT_ROOT / "package.json")
    require_file(PROJECT_ROOT / "app.json")
    require_file(PROJECT_ROOT / "eas.json")


def get_expo_config() -> dict:
    app = load_json(PROJECT_ROOT / "app.json")
    expo = app.get("expo", {}) if isinstance(app, dict) else {}
    if not isinstance(expo, dict):
        die("app.json is missing a top-level \"expo\" object")
    return expo


def print_project_summary() -> None:
    expo = get_expo_config()
    name = expo.get("name")
    slug = expo.get("slug")
    owner = expo.get("owner")

    extra = expo.get("extra") if isinstance(expo.get("extra"), dict) else {}
    eas_extra = extra.get("eas") if isinstance(extra.get("eas"), dict) else {}
    project_id = eas_extra.get("projectId") if isinstance(eas_extra.get("projectId"), str) else None

    android_pkg = (expo.get("android", {}) or {}).get("package") if isinstance(expo.get("android"), dict) else None
    ios_bundle = (expo.get("ios", {}) or {}).get("bundleIdentifier") if isinstance(expo.get("ios"), dict) else None

    print("Project config:")
    print(f"- name: {name!r}")
    print(f"- slug: {slug!r}")
    print(f"- android.package: {android_pkg!r}")
    print(f"- ios.bundleIdentifier: {ios_bundle!r}")
    print(f"- owner: {owner!r}")
    print(f"- extra.eas.projectId: {project_id!r}")


def ensure_node_available() -> None:
    require_executable("node")
    require_executable("npm")


def ensure_js_deps_installed(*, force: bool) -> None:
    node_modules = PROJECT_ROOT / "node_modules"
    if node_modules.is_dir() and not force:
        print("JS deps: node_modules already present (skipping install).")
        return

    if (PROJECT_ROOT / "package-lock.json").is_file():
        run(["npm", "ci"], cwd=PROJECT_ROOT)
    else:
        run(["npm", "install"], cwd=PROJECT_ROOT)


def validate_eas_profile(profile: str) -> None:
    eas = load_json(PROJECT_ROOT / "eas.json")
    build = eas.get("build") if isinstance(eas, dict) else None
    if not isinstance(build, dict):
        die("eas.json is missing a top-level \"build\" object")
    if profile not in build:
        die(f"eas.json has no build profile named {profile!r}")


def eas_cli_prefix() -> list[str]:
    if which("eas") is not None:
        return ["eas"]

    require_executable("npx")
    return ["npx", "--yes", "eas-cli@latest"]


def run_eas(args: list[str], *, env: dict[str, str] | None = None) -> None:
    run(eas_cli_prefix() + args, cwd=PROJECT_ROOT, env=env)


def run_eas_capture(args: list[str], *, env: dict[str, str] | None = None) -> str:
    return run_capture(eas_cli_prefix() + args, cwd=PROJECT_ROOT, env=env)


def get_local_slug_and_project_id() -> tuple[str | None, str | None]:
    expo = get_expo_config()
    slug = expo.get("slug") if isinstance(expo.get("slug"), str) else None

    extra = expo.get("extra") if isinstance(expo.get("extra"), dict) else {}
    eas_extra = extra.get("eas") if isinstance(extra.get("eas"), dict) else {}
    project_id = eas_extra.get("projectId") if isinstance(eas_extra.get("projectId"), str) else None
    return slug, project_id


def write_app_json(app: dict) -> None:
    path = PROJECT_ROOT / "app.json"
    path.write_text(json.dumps(app, indent=2) + "\n", encoding="utf-8")


def reset_eas_project_id() -> None:
    path = PROJECT_ROOT / "app.json"
    app = load_json(path)
    expo = app.get("expo") if isinstance(app.get("expo"), dict) else None
    if expo is None:
        die("app.json is missing a top-level \"expo\" object")

    extra = expo.get("extra") if isinstance(expo.get("extra"), dict) else None
    if extra is None:
        return

    eas_extra = extra.get("eas") if isinstance(extra.get("eas"), dict) else None
    if eas_extra is None:
        return

    if "projectId" not in eas_extra:
        return

    eas_extra.pop("projectId", None)
    if not eas_extra:
        extra.pop("eas", None)
    if not extra:
        expo.pop("extra", None)

    write_app_json(app)


def parse_eas_project_info(output: str) -> tuple[str | None, str | None]:
    full_name: str | None = None
    project_id: str | None = None

    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("fullName"):
            # e.g. "fullName  @drc0de/sleepcaster"
            parts = line.split()
            full_name = parts[-1] if parts else None
        elif line.startswith("ID"):
            parts = line.split()
            project_id = parts[-1] if parts else None

    return full_name, project_id


def ensure_eas_logged_in(*, env: dict[str, str] | None = None) -> None:
    try:
        user = run_eas_capture(["whoami"], env=env).strip()
    except CommandError as exc:
        raise CommandError(
            "Not logged into Expo/EAS. Run `eas login` and try again."
        ) from exc

    if not user:
        raise CommandError("Unable to determine Expo username. Run `eas whoami` to debug.")


def ensure_eas_project_initialized(*, env: dict[str, str] | None = None) -> None:
    local_slug, local_project_id = get_local_slug_and_project_id()
    if local_slug is None:
        die("app.json expo.slug is missing or not a string")

    if local_project_id is None:
        print('EAS project: not linked (missing "extra.eas.projectId"); initializing…')
        run_eas(["init", "--force", "--non-interactive"], env=env)
        return

    try:
        info = run_eas_capture(["project:info"], env=env)
    except CommandError as exc:
        print(f"EAS project: unable to read project info ({exc}); re-initializing…")
        run_eas(["init", "--force", "--non-interactive"], env=env)
        return

    full_name, remote_project_id = parse_eas_project_info(info)
    remote_slug = None
    if isinstance(full_name, str) and "/" in full_name:
        remote_slug = full_name.rsplit("/", 1)[-1]

    if remote_project_id and remote_project_id != local_project_id:
        print(
            f"EAS project: app.json projectId ({local_project_id}) does not match EAS ({remote_project_id}); re-initializing…"
        )
        reset_eas_project_id()
        run_eas(["init", "--force", "--non-interactive"], env=env)
        return

    if remote_slug and remote_slug != local_slug:
        print(
            f"EAS project: linked to {full_name} but app.json slug is {local_slug!r}; resetting projectId and re-linking…"
        )
        reset_eas_project_id()
        run_eas(["init", "--force", "--non-interactive"], env=env)
        return

    print(f"EAS project: linked to {full_name} (ID: {remote_project_id}).")


def run_eas_build(
    platform: str,
    profile: str,
    extra_args: list[str],
    *,
    env: dict[str, str] | None = None,
    interactive: bool = False,
) -> None:
    if extra_args[:1] == ["--"]:
        extra_args = extra_args[1:]

    # Requested by the user (default): eas build -p android --profile preview
    base_args = ["build", "-p", platform, "--profile", profile]
    if not interactive and "--non-interactive" not in extra_args:
        base_args.append("--non-interactive")
    run_eas(base_args + extra_args, env=env)


def get_plain_env(args: argparse.Namespace) -> dict[str, str] | None:
    if args.interactive:
        return None

    return {"CI": "1", "FORCE_COLOR": "0"}


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="gtd-claude",
        description="Build the gtd-claude Expo app via EAS.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--platform",
        "-p",
        default="android",
        choices=["android", "ios"],
        help="Platform to build (default: android).",
    )
    parser.add_argument(
        "--profile",
        default="preview",
        help="EAS build profile from eas.json (default: preview).",
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help="Force reinstall JS dependencies before building.",
    )
    parser.add_argument(
        "--plain",
        action="store_true",
        help="Enable plain output (default behavior).",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Enable interactive output/spinners.",
    )
    parser.add_argument(
        "eas_args",
        nargs=argparse.REMAINDER,
        help="Extra args passed through to `eas build` (prefix with --).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)

    try:
        ensure_project_layout()
        print_project_summary()
        ensure_node_available()
        validate_eas_profile(args.profile)
        ensure_js_deps_installed(force=args.install)
        plain_env = get_plain_env(args)
        ensure_eas_logged_in(env=plain_env)
        ensure_eas_project_initialized(env=plain_env)
        run_eas_build(
            args.platform,
            args.profile,
            args.eas_args,
            env=plain_env,
            interactive=args.interactive,
        )
    except CommandError as exc:
        eprint(str(exc))
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
