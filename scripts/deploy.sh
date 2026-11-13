#!/usr/bin/env bash
set -euo pipefail

# Deploy built site (./dist) to FTP using lftp.
# Suitable for local execution and GitHub Actions (non-interactive, fails on error).
#
# Usage:
#   ./scripts/deploy.sh <password>
#   ./scripts/deploy.sh --password <password> [--local-dir ./dist] [--remote-dir /] [--dry-run]
#   FTP_PASSWORD=<password> ./scripts/deploy.sh

FTP_HOST="${FTP_HOST:-ftp.kubomontessori.com}"
FTP_PORT="${FTP_PORT:-21}"
FTP_USER="${FTP_USER:-zlgonzalez@kubomontessori.com}"
LOCAL_DIR="${LOCAL_DIR:-./dist}"
REMOTE_DIR="${REMOTE_DIR:-public_html}"
DRY_RUN=false
FTP_PASSWORD="${FTP_PASSWORD:-${KUBO_FTP_PASSWORD:-}}"

usage() {
  cat <<'EOF'
Usage: deploy.sh [OPTIONS] [PASSWORD]

Deploy the built static site to FTP using lftp.

Arguments:
  PASSWORD                FTP password (can also be passed via --password or FTP_PASSWORD env var)

Options:
  -p, --password PASS     FTP password
  -l, --local-dir DIR     Local build directory to upload (default: ./dist)
  -r, --remote-dir DIR    Remote FTP target directory (default: public_html)
      --dry-run           Simulate mirror without transferring or deleting files
  -h, --help              Show this help message

Environment overrides:
  FTP_HOST                FTP server host (default: ftp.kubomontessori.com)
  FTP_PORT                FTP server port (default: 21)
  FTP_USER                FTP username (default: zlgonzalez@kubomontessori.com)
  FTP_PASSWORD            FTP password (fallback if not passed as argument)

GitHub Actions example:
  - name: Install lftp
    run: sudo apt-get update && sudo apt-get install -y lftp
  - name: Deploy via lftp
    run: ./scripts/deploy.sh "${{ secrets.KUBO_FTP_PASSWORD }}"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--password)
      if [[ $# -lt 2 || -z "$2" ]]; then
        echo "Error: $1 requires a non-empty password value." >&2
        exit 1
      fi
      FTP_PASSWORD="$2"
      shift 2
      ;;
    -l|--local-dir)
      if [[ $# -lt 2 || -z "$2" ]]; then
        echo "Error: $1 requires a directory path." >&2
        exit 1
      fi
      LOCAL_DIR="$2"
      shift 2
      ;;
    -r|--remote-dir)
      if [[ $# -lt 2 || -z "$2" ]]; then
        echo "Error: $1 requires a directory path." >&2
        exit 1
      fi
      REMOTE_DIR="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Error: Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -z "$FTP_PASSWORD" ]]; then
        FTP_PASSWORD="$1"
      else
        echo "Error: Unexpected positional argument: $1" >&2
        usage >&2
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$FTP_PASSWORD" ]]; then
  echo "Error: FTP password is required." >&2
  usage >&2
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "Error: 'lftp' is not installed or not in PATH." >&2
  echo "Install it on Ubuntu/GitHub Actions with: sudo apt-get update && sudo apt-get install -y lftp" >&2
  echo "Install it on macOS with: brew install lftp" >&2
  exit 1
fi

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Error: Local directory '$LOCAL_DIR' does not exist. Run 'npm run build' or 'make build' first." >&2
  exit 1
fi

if [[ -z "$(ls -A "$LOCAL_DIR")" ]]; then
  echo "Error: Local directory '$LOCAL_DIR' is empty. Refusing to mirror an empty directory." >&2
  exit 1
fi

escape_lftp_arg() {
  local val="$1"
  val="${val//\\/\\\\}"
  val="${val//\"/\\\"}"
  printf '"%s"' "$val"
}

MIRROR_FLAGS="--reverse --delete --verbose --parallel=4 --no-perms --exclude-glob .DS_Store"
if [[ "$DRY_RUN" == true ]]; then
  MIRROR_FLAGS="$MIRROR_FLAGS --dry-run"
fi

ESCAPED_USER=$(escape_lftp_arg "$FTP_USER")
ESCAPED_PASS=$(escape_lftp_arg "$FTP_PASSWORD")
ESCAPED_HOST=$(escape_lftp_arg "$FTP_HOST")
ESCAPED_PORT=$(escape_lftp_arg "$FTP_PORT")
ESCAPED_LOCAL=$(escape_lftp_arg "$LOCAL_DIR")
ESCAPED_REMOTE=$(escape_lftp_arg "$REMOTE_DIR")

echo "Deploying '$LOCAL_DIR' to ftp://${FTP_USER}@${FTP_HOST}:${FTP_PORT}/${REMOTE_DIR#/} (dry-run: ${DRY_RUN})..."

# Pass credentials via stdin so the password never appears in process arguments (ps).
lftp --norc <<EOF
set cmd:fail-exit yes
set ftp:passive-mode true
set ftp:ssl-allow true
set ssl:verify-certificate false
set net:max-retries 3
set net:timeout 30
open -u ${ESCAPED_USER},${ESCAPED_PASS} -p ${ESCAPED_PORT} ${ESCAPED_HOST}
cd ${ESCAPED_REMOTE}
mirror ${MIRROR_FLAGS} ${ESCAPED_LOCAL} .
bye
EOF

echo "Deploy complete."
