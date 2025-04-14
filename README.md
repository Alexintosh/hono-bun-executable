# Bun/hono executable
This project demonstrates how to bundle a Hono web server and a React frontend into a distributable package using Bun's compilation feature.

## Concept
Sometimes, hosting a webapp on a server it's just not the best strategy (ie safe)
I wanted to use Hono as a web framework for his simplicity and bun to compile to binaries.

You could technically embed all files into the binary, by using Bun.file().
However this makes things much more complicated from a web app prospective and I want to keep things simple.

This simple solution compiled the server to a binary and builds the react app into /dist which is then server by the server.

To distribute the app correctly you need to give the entire dist folder, you can rename it as you want.


## How to use
1. Have bun installed
2. cd app && bun install
3. cd ../ && make build-app
4. make compile
5. ./dist/myapp

## How to build
Run make compile-open for to compile normally
Run make package-mac to make a .app executable for mac