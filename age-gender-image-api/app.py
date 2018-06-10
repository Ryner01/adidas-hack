import json
import base64
import re
import requests
import uuid
import sqlite3
import datetime
from os import path
from io import BytesIO
from PIL import Image
from flask import Flask, request, Response, render_template, abort
import image_processor

app = Flask(__name__, template_folder='./templates')
db = sqlite3.connect('saved_images.db')

@app.route('/process_image', methods=['POST',])
def process_image():
	if 'image' in request.json:
		img_b64 = re.sub('^data:image/.+;base64,', '', request.json['image'])
		img = Image.open(BytesIO(base64.b64decode(img_b64)))
	elif 'image_url' in request.json:
		resp = requests.get(request.json['image_url']).content
		img = Image.open(BytesIO(resp))
	else:
		abort(400)
		
	result = image_processor.process_image(img)

	if request.json.get('save', False):
		image_uuid = uuid.uuid4().hex
		img.save(path.join("./saved_images", image_uuid + ".jpg"), "JPEG")
		meta = json.dumps(request.json.get('meta', ''))
		res = json.dumps(result)
		dt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
		try:
			db.execute("INSERT INTO saved_images VALUES (NULL, '{}', '{}', '{}', '{}')".format(
				image_uuid,
				res,
				meta,
				dt
			))
			db.commit()
		except sqlite3.OperationalError:
			pass
	resp = Response(json.dumps(result))
	resp.headers['Access-Control-Allow-Origin'] = '*'
	return resp


@app.route('/', methods=['GET',])
def example():
	return render_template('example.html')


