ifeq ($(OS),Windows_NT)
	PYTHON := python
else
	PYTHON := python3
endif

install:
	yarn install & $(PYTHON) -m pip install -r requirements.txt

start:
	yarn webpack --mode production & $(PYTHON) app.py $(RESOURCES)

clean:
	rm -rf ./node_modules & rm -rf ./static/dist & $(PYTHON) -m pip uninstall -y -r requirements.txt