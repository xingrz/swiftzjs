NODE_MODULES=./node_modules
NODE_BIN=$(NODE_MODULES)/.bin

default:
	@echo "Run 'make install' to install."

install:
	@npm install

test: install
	@npm test

gh-pages: clean
	@mkdir -p gh-pages
	@$(NODE_BIN)/marked -i ./README.md -o ./gh-pages/_index.html --gfm
	@cat misc/docs-header.html gh-pages/_index.html misc/docs-footer.html > gh-pages/index.html
	@rm -f gh-pages/_index.html
	@git subtree push --prefix gh-pages origin gh-pages

clean:
	@rm -rf gh-pages

.PHONY: default install docs deploy clean
