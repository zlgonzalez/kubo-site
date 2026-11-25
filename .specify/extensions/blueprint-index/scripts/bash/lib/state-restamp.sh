#!/usr/bin/env bash
# lib/state-restamp.sh — `restamp`: the one deterministic remedy; refreshes
# code-marker baselines to the current git tree/blob SHAs. Exits when invoked.
# Expects: ROOT, BLUEPRINT, PATH_FILTER.
# ── restamp: refresh the git baseline for code markers (all, or one --path) ────
# Run as part of remap, after a section's prose has been re-derived from the code.
if [ "$CMD" = "restamp" ]; then
  is_git || { echo "not a git repository — cannot restamp"; exit 1; }
  [ -f "$BLUEPRINT" ] || { echo "no blueprint at: ${BLUEPRINT:-<none>}"; exit 1; }
  bp_dir="$(dirname "$BLUEPRINT")"
  lock_dir="$bp_dir/.blueprint.lock"
  if ! mkdir "$lock_dir" 2>/dev/null; then
    echo "error: another blueprint update is in progress ($lock_dir)" >&2
    exit 1
  fi
  RESTAMP_TMP=""
  trap 'rc=$?; rm -f "${RESTAMP_TMP:-}"; rmdir "$lock_dir" 2>/dev/null || true; exit "$rc"' EXIT INT TERM
  updated=0
  while IFS= read -r m; do
    [ -n "$m" ] || continue
    p="$(marker_path "$m")"
    [ -n "$PATH_FILTER" ] && [ "$PATH_FILTER" != "$p" ] && continue
    cur="$(current_sha "$p")"
    [ -z "$cur" ] && { echo "skip (missing in git): $p"; continue; }
    RESTAMP_TMP="$(mktemp "$bp_dir/.blueprint.XXXXXX")"
    # Preserve existing permissions before atomic same-FS rename.
    chmod --reference="$BLUEPRINT" "$RESTAMP_TMP" 2>/dev/null || chmod 0644 "$RESTAMP_TMP"
    # Literal substring replacement via awk (avoids sed ERE metacharacter injection on dots/brackets).
    awk -v prefix="<!-- blueprint:code path=${p} sha=" -v cur="$cur" '
      {
        idx = index($0, prefix)
        if (idx > 0) {
          before = substr($0, 1, idx + length(prefix) - 1)
          rest = substr($0, idx + length(prefix))
          sp = index(rest, " -->")
          if (sp > 0) {
            print before cur substr(rest, sp)
            next
          }
        }
        print
      }
    ' "$BLUEPRINT" > "$RESTAMP_TMP" && mv "$RESTAMP_TMP" "$BLUEPRINT"
    RESTAMP_TMP=""
    echo "stamped $p → $cur"; updated=$((updated+1))
  done < <(code_markers)
  echo "restamped $updated marker(s)"; exit 0
fi


# `source` returns the status of the last command above; a region whose final
# line is a legitimately-failing test must not kill the entry under set -e.
:
