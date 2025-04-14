build-app:
	cd app && bun run build && cp -R dist ../dist/app

compile:
	bun build bun-only-example.ts --compile --outfile dist/myapp

compile-hono:
	bun build backend/src/index.ts --compile --outfile dist/myapp

compile-open:
	bun build main.ts --compile --outfile dist/myapp
	open dist/myapp