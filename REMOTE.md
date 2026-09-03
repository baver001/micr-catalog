# Git remotes (production catalog)

| Remote | URL | Назначение |
|--------|-----|------------|
| **origin** (push по умолчанию) | `git@github.com:baver001/micr-catalog.git` | Репозиторий каталога, с которым работает VPS |

На VPS: `/root/projects/micr.fun`, branch `main`.

Push в `origin/main` запускает quality gate и production deploy workflow после настройки GitHub environment secrets и переменной `DEPLOY_ENABLED=true`. Ручной запуск доступен через `workflow_dispatch`. Root control repo не деплоится.

Canonical engine upstream пока не подтверждён и remote для него не настроен.
