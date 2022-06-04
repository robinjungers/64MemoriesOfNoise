build_wasm :
	emcc -Wall -Os --closure 1 \
		wasm/main.cpp \
		wasm/lap.cpp \
		-std=c++17 \
		-o wasm/main.js \
		-s WASM=1 \
		-s EXPORT_ES6=1 \
		-s MODULARIZE=1 \
		-s EXPORTED_RUNTIME_METHODS='["cwrap"]'
