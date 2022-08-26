install:
	yarn install & python3 -m pip install -r requirements.txt

start:
	yarn webpack --mode production & python3 app.py $(RESOURCES)