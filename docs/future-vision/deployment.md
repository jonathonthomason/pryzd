# Future Vision Archive Deployment

## Purpose
Deploy the preserved future-state MQI prototype and deck to a dedicated Netlify archive environment that stays separate from the production MVP.

## Archive deployment intent
This deployment is for:
- internal strategy reference
- investor/reference storytelling
- rollback-safe future-state review

This deployment is not the production MVP.

## Recommended site naming
Preferred archive targets:
1. `future-mqi.netlify.app`
2. `vision.pryzd.com`
3. `future.pryzd.com`

## Repo-side deployment configuration
- build command: `npm run build`
- publish directory: `dist`
- config file: `netlify.toml`

## Preserved archive content available in build output
- `/` → current React prototype shell
- `/stakeholder-case-study.html` → preserved deck HTML
- `/prototype/*` → archived static prototype screens
- `/architecture.png` → architecture reference

## Deployment constraints
- do not connect this archive site to the production domain
- do not replace the current/primary production site with this archive
- keep archive naming explicit so the environment is not confused with live MVP

## Current blocker
Netlify CLI/config/auth is not present in the repo environment yet, so final deployment creation still requires:
- Netlify site selection or creation
- authenticated deploy access
- optional custom domain mapping if using `future.pryzd.com` or `vision.pryzd.com`

## Verification checklist
- archive URL loads successfully
- prototype routes render correctly
- static prototype pages open from `/prototype/`
- stakeholder deck HTML opens
- archive is visibly distinct from production positioning
- production deployment remains untouched