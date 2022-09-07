SKETCH_JS   := $(wildcard sketches/*.js)
SKETCH_HTML := $(patsubst sketches/%.js, output/%.html, $(SKETCH_JS))

LIBS := smolcanvas.js
FLAGS := -O ADVANCED --assume_function_wrapper --use_types_for_optimization
FLAGS += --language_out ECMASCRIPT6
FLAGS += --output_wrapper "<body><script>%output%</script></body>"

COMPILER := java -jar $(CLOSURE)

all: $(SKETCH_HTML)
.PHONY: all

output/%.html: sketches/%.js
	@mkdir -p $(@D)
	$(COMPILER) $(FLAGS) $(LIBS) "$<" > "$@"

clean:
	@rm -rf output
.PHONY: clean
