# Variables (adjust paths if needed)
SRC = ./main.ts
OUT_DIR = dist
EXECUTABLE = $(OUT_DIR)/myapp
FRONTEND_DIR = app
FRONTEND_BUILD_DIR = $(OUT_DIR)/app
PACKAGED_APP = $(OUT_DIR)/MyApp.app # Match appName in script

build-app:
	cd app && bun run build && cp -R dist ../dist/app

compile:
	bun build bun-only-example.ts --compile --outfile dist/myapp

compile-hono:
	bun build backend/src/index.ts --compile --outfile dist/myapp
	@echo "Server compiled to $(EXECUTABLE)"

compile-open:
	bun build main.ts --compile --outfile dist/myapp
	@echo "Server compiled to $(EXECUTABLE)"
	open dist/myapp

# Compile the server specifically for packaging (injects environment variable)
compile-packaged: $(SRC) main.ts
	bun build $(SRC) --compile --outfile $(EXECUTABLE) --define 'process.env.IS_PACKAGED=\"true\"'
	@echo "Server compiled for packaging to $(EXECUTABLE) with IS_PACKAGED=true"

# Create the macOS .app bundle
#package-mac: compile-packaged build-app assets/AppIcon.icns # Depends on packaged compile, frontend build, and icon
package-mac: compile-packaged build-app # Depends on packaged compile, frontend build, and icon
	bun run scripts/package-mac.ts
	@echo "macOS app bundle created at $(PACKAGED_APP)"

# Clean build artifacts
clean:
	rm -rf $(OUT_DIR)
	cd $(FRONTEND_DIR) && rm -rf node_modules dist build .turbo