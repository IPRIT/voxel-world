#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="yandex-delta"
ARCHIVE_SHA256="b0c98431d56bc34201332b5505045e093cec9bbf35c56d0e0653eff075f686d3"

say() {
  printf '%s\n' "$*" >&2
}

fail() {
  say "Error: $*"
  exit 1
}

has_tty() {
  [[ -r /dev/tty && -w /dev/tty ]]
}

ask() {
  local prompt="$1"
  local answer
  has_tty || fail "interactive input is not available; set YANDEX_DELTA_INSTALL_TARGET and retry"
  printf '%s' "$prompt" > /dev/tty
  IFS= read -r answer < /dev/tty
  printf '%s' "$answer"
}

expand_path() {
  local value="$1"
  case "$value" in
    "~") printf '%s\n' "$HOME" ;;
    "~/"*) printf '%s/%s\n' "$HOME" "${value#~/}" ;;
    *) printf '%s\n' "$value" ;;
  esac
}

decode_base64() {
  if base64 --decode </dev/null >/dev/null 2>&1; then
    base64 --decode
  else
    base64 -D
  fi
}

sha256_file() {
  local path="$1"
  if command -v shasum >/dev/null 2>&1; then
    LC_ALL=C shasum -a 256 "$path" | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then
    LC_ALL=C sha256sum "$path" | awk '{print $1}'
  else
    return 1
  fi
}

choose_target_dir() {
  local target="${YANDEX_DELTA_INSTALL_TARGET:-}"
  local custom_dir="${YANDEX_DELTA_INSTALL_DIR:-}"
  local choice

  if [[ -z "$target" ]]; then
    say "Where should yandex-delta be installed?"
    say "  1) Codex       (~/.codex/skills)"
    say "  2) Claude Code (~/.claude/skills)"
    say "  3) Custom directory"
    choice="$(ask "Choose 1/2/3 [2]: ")"
    case "${choice:-2}" in
      1) target="codex" ;;
      2) target="claude-code" ;;
      3) target="custom" ;;
      *) fail "unknown choice: $choice" ;;
    esac
  fi

  case "$target" in
    codex)
      expand_path "${CODEX_HOME:-$HOME/.codex}/skills"
      ;;
    claude-code|claude)
      expand_path "$HOME/.claude/skills"
      ;;
    custom)
      if [[ -z "$custom_dir" ]]; then
        custom_dir="$(ask "Directory to install into: ")"
      fi
      [[ -n "$custom_dir" ]] || fail "custom directory is empty"
      expand_path "$custom_dir"
      ;;
    *)
      fail "unknown install target: $target"
      ;;
  esac
}

confirm_replace() {
  local install_dir="$1"
  local answer
  [[ -e "$install_dir" ]] || return 0
  if [[ "${YANDEX_DELTA_ASSUME_YES:-}" == "1" ]]; then
    return 0
  fi
  answer="$(ask "$install_dir already exists. Replace it? [y/N]: ")"
  case "$answer" in
    y|Y|yes|YES) return 0 ;;
    *) fail "installation cancelled" ;;
  esac
}

archive_payload() {
  cat <<'YDX_ARCHIVE_BASE64'
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
YDX_ARCHIVE_BASE64
}

main() {
  command -v tar >/dev/null 2>&1 || fail "tar is required"
  command -v base64 >/dev/null 2>&1 || fail "base64 is required"
  command -v mktemp >/dev/null 2>&1 || fail "mktemp is required"

  local target_parent install_dir tmp_dir archive_path actual_sha extracted_dir final_tmp
  target_parent="$(choose_target_dir)"
  target_parent="${target_parent%/}"

  if [[ "$(basename "$target_parent")" == "$SKILL_NAME" ]]; then
    install_dir="$target_parent"
    target_parent="$(dirname "$target_parent")"
  else
    install_dir="$target_parent/$SKILL_NAME"
  fi

  confirm_replace "$install_dir"

  tmp_dir="$(mktemp -d)"
  YDX_INSTALL_TMP_DIR="$tmp_dir"
  trap 'rm -rf "${YDX_INSTALL_TMP_DIR:-}"' EXIT
  archive_path="$tmp_dir/$SKILL_NAME.tar.gz"

  archive_payload | decode_base64 > "$archive_path"
  if actual_sha="$(sha256_file "$archive_path")"; then
    [[ "$actual_sha" == "$ARCHIVE_SHA256" ]] || fail "archive checksum mismatch"
  else
    say "Warning: shasum/sha256sum not found; skipping checksum verification"
  fi

  mkdir -p "$target_parent"
  LC_ALL=C tar -xzf "$archive_path" -C "$tmp_dir"
  extracted_dir="$tmp_dir/$SKILL_NAME"
  [[ -f "$extracted_dir/SKILL.md" ]] || fail "embedded archive is invalid"

  final_tmp="$target_parent/.$SKILL_NAME.installing.$$"
  rm -rf "$final_tmp"
  cp -R "$extracted_dir" "$final_tmp"
  rm -rf "$install_dir"
  mv "$final_tmp" "$install_dir"

  say "Installed $SKILL_NAME to $install_dir"
  say "First run may take longer: the skill can download portable Node.js, Playwright, and a browser."
}

main "$@"
