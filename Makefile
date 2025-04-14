build-app:
	cd app && bun run build && mv dist ../backend/app-dist 

compile:
	bun build build.ts --compile --outfile dist/myapp