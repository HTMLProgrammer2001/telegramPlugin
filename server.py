from flask import Flask, Response, request
import os
from werkzeug.utils import secure_filename
import speech_recognition as sr
import ffmpeg


app = Flask(__name__)

UPLOAD_FOLDER = 'files'
ALLOWED_EXTENSIONS = ['wav']

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def recognize(path):
	print(path)

	r = sr.Recognizer()
	audioFile= sr.AudioFile(path)

	with audioFile as source:
		audio = r.record(source)
		return r.recognize_google(audio, language="RU_ru")

def convertFile(path):
	savePath = os.path.join(UPLOAD_FOLDER, 's_audio.wav')

	stream = ffmpeg.input(path)
	stream = ffmpeg.output(stream, savePath)
	stream = ffmpeg.overwrite_output(stream)

	ffmpeg.run(stream)

	return savePath


@app.route('/translate', methods=['POST'])
def translate():
	try:
		file = request.files.get('audio')

		print(file.filename)

		if not file or not allowed_file(file.filename):
			return "Not found audio file", 422

		path = os.path.join(UPLOAD_FOLDER, 'audio.wav')

		file.save(path)
		path = convertFile(path)

		resp = Response(recognize(path))
		resp.headers['Access-Control-Allow-Origin'] = '*'

		return resp

	except Exception as e:
		return "Error occure", 500

app.run(port=9000, debug=True)
