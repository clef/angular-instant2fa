.PHONY: all clean minified gzipped

BASENAME=angular-instant2fa
MINIFIED=$(BASENAME).min.js
GZIPPED=$(MINIFIED).gz

all: minified

clean:
	rm -rf $(MINIFIED) $(GZIPPED)

minified:
	uglifyjs -m -- $(BASENAME).js > $(MINIFIED)

gzipped: minified
	gzip -9c $(MINIFIED) > $(GZIPPED)
