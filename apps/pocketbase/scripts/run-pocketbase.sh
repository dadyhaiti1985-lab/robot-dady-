#!/usr/bin/env bash
set -euo pipefail

# Resolve this script's directory to make relative paths stable.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PB_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
WORKSPACE_ROOT="$(cd -- "${PB_DIR}/../.." && pwd)"

read_env_value() {
  local key="$1"
  local file="$2"
  [ -f "${file}" ] || return 1

  local line
  line="$(grep -E "^${key}=" "${file}" | tail -n 1 || true)"
  [ -n "${line}" ] || return 1

  local value="${line#${key}=}"

  # Strip surrounding single or double quotes if present.
  if [[ "${value}" =~ ^\".*\"$ ]]; then
    value="${value:1:-1}"
  elif [[ "${value}" =~ ^\'.*\'$ ]]; then
    value="${value:1:-1}"
  fi

  printf '%s' "${value}"
}

# Respect an already-exported key, else load only PB_ENCRYPTION_KEY from env files.
if [ -z "${PB_ENCRYPTION_KEY:-}" ]; then
  PB_ENCRYPTION_KEY="$(read_env_value PB_ENCRYPTION_KEY "${WORKSPACE_ROOT}/.env.local" || true)"
fi

if [ -z "${PB_ENCRYPTION_KEY:-}" ]; then
  PB_ENCRYPTION_KEY="$(read_env_value PB_ENCRYPTION_KEY "${WORKSPACE_ROOT}/.env" || true)"
fi

if [ -z "${PB_ENCRYPTION_KEY:-}" ]; then
  PB_ENCRYPTION_KEY="$(read_env_value PB_ENCRYPTION_KEY "${PB_DIR}/../api/.env" || true)"
fi

export PB_ENCRYPTION_KEY

if [ -z "${PB_ENCRYPTION_KEY:-}" ]; then
  echo "PB_ENCRYPTION_KEY not set — starting PocketBase without data encryption."
fi

# Use explicit macOS/local binary override if provided; otherwise prefer system binary,
# then fall back to project-bundled binary.
if [ -n "${POCKETBASE_BIN:-}" ]; then
  PB_BIN="${POCKETBASE_BIN}"
elif command -v pocketbase >/dev/null 2>&1; then
  PB_BIN="$(command -v pocketbase)"
else
  PB_BIN="${PB_DIR}/pocketbase"
fi

if [ ! -x "${PB_BIN}" ]; then
  echo "PocketBase binary is not executable: ${PB_BIN}"
  exit 1
fi

# Build args: include --encryptionEnv only when the key is actually set
EXTRA_ARGS=()
if [ -n "${PB_ENCRYPTION_KEY:-}" ]; then
  EXTRA_ARGS+=("--encryptionEnv=PB_ENCRYPTION_KEY")
fi

exec "${PB_BIN}" "$@" "${EXTRA_ARGS[@]}"
