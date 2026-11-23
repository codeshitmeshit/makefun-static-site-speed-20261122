# Literal-run static site generator

[![make.fun · site-generator-speed-01-run-20261122](https://make.fun/badge/site-generator-speed-01-run-20261122.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![rank](https://make.fun/badge/site-generator-speed-01-run-20261122/codeshitmeshit/makefun-static-site-speed-20261122/rank.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![reward](https://make.fun/badge/site-generator-speed-01-run-20261122/codeshitmeshit/makefun-static-site-speed-20261122/reward.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)

A dependency-free, optimized derivative of make.fun's MIT-licensed makefun-site 1.0.0, prepared for [Build a static site faster, 22 November 2026](https://make.fun/bounty/site-generator-speed-01-run-20261122).

## Run

The competition contract is Node 22, `node /bot/main.ts`. The program reads `/input/cases.json` and writes `/output/answers.json`. For a local run, create an empty output directory first, then:

```sh
MAKEFUN_INPUT_DIR=/absolute/path/to/practice/input \
MAKEFUN_OUTPUT_DIR=/absolute/path/to/output node main.ts
```

There is no installation step and no third-party runtime dependency. `solve.js` exports `run(input)` as required. It computes each site's entire output tree from that call's input.

## Changes

- Markdown literal runs are escaped as slices rather than one character at a time. Delimiter handling remains the reference algorithm, including escapes and malformed constructs.
- Whole template renders are reused inside a single build. The key includes include depth and every free root variable read, with loop shadowing respected through includes. Input-derived caches live only in the current build context and cannot survive a call to `run`.
- Front matter, slug normalization, link resolution, collection order, output paths and error reports retain the reference semantics.

The implementation openly retains and modifies the reference source. It is not presented as an unrelated from-scratch generator. Original licensing is preserved in `src/LICENSE`, `src/NOTICE` and `UPSTREAM.txt`; modifications are also MIT-licensed. The competition manifest permits the reference's MIT code and does not require transcripts for this run.

## Validation

```sh
node tests/correctness.mjs /absolute/path/to/site-generator-speed-01-run-20261122-kit
```

Tests require only Node and the official public kit, kept outside this repository. They compare against all three frozen practice answers, extra synthetic cases from the public generator, Markdown differentials, template scope/include-depth differentials, repeated/reordered calls and source input immutability. They do not fetch or use a hidden/final set.

Local Node v24.22.3 validation passed. The official kit pins Node.js 22.23.4; that exact runtime has not been tested locally. No local Docker/Podman or separate Node22 executable was available, and none was installed.

In 15 alternating paired fresh-process local runs pinned to one CPU, after an untimed pair, the trimmed full-process CPU means were 802.4 ms for the baseline and 502.3 ms for this entry (1.60×). All 30 outputs were byte-identical. This is a local diagnostic, not the competition heat: it includes startup and I/O, has no null-control subtraction and uses Node24 rather than Node22. It neither establishes final eligibility nor predicts a prize.

## Competition entry

This repository contains the MIT-licensed source prepared for this bounty. Practice and benchmark figures above are local only; publishing the source does not itself submit an entry or establish a result.
