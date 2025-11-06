# OS1 project Makefile

.PHONY: docs test ci

docs:
	@npm run docs:progress

test:
	@python -m pytest -q integrations/archon/python/tests || true

ci:
	@npm run lint
	@npm run build
	@$(MAKE) test
