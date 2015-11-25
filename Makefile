.PHONY: run install all clean npm bower watch server build dist push_dev

run: watch server

install: npm bower build

all: clean install run

clean:
	rm -rf dist
	rm -rf node_modules
	rm -rf lib
	npm cache clean
	bower cache clean

npm:
	npm install

bower:
	./node_modules/bower/bin/bower install

watch:
	./node_modules/gulp/bin/gulp.js &

server:
	./node_modules/http-server/bin/http-server

build:
	./node_modules/gulp/bin/gulp.js build

dist: install
	rm -rf ./dist/styles

push_dev: build
	node_modules/lfcdn/cli.js -c package.json -f