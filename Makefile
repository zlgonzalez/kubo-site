.PHONY: all install dev build preview clean help

# Default target
all: help

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build the project
build:
	npm run build

# Preview the built project
preview:
	npm run preview

# Clean build artifacts
clean:
	rm -rf dist

# Show help
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Run development server"
	@echo "  make build    - Build the project"
	@echo "  make preview  - Preview the built project"
	@echo "  make clean    - Clean build artifacts"
