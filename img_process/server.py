import os
import time
from imgprocess import get_group, img_pre_process, delete_info, get_dis_json, seg_groups
from flask import Flask, request, make_response
from flask_uploads import UploadSet, configure_uploads, IMAGES, patch_request_class
from flask_compress import Compress
from word_counter import get_text
import random
import json


app = Flask(__name__)
app.debug = False
app.config['UPLOADED_PHOTOS_DEST'] = os.getcwd() + "/uploads"

Compress(app)

photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)
patch_request_class(app)


@app.route('/get_text', methods=["POST"])
def get_text_json():
    try:
        text = request.values.get('text')
        json_str = get_text(text)
    except:
        return "[]"
    return json_str


@app.route('/upload_Shape', methods=['GET', 'POST'])
def get_shape():
    shape = request.args.get('shape')
    filename = shape
    colorful = False
    print(filename, colorful)
    json_str = img_pre_process(filename, colorful)
    return json_str


@app.route('/gltest/<dis_para_str>')
def gl_test(dis_para_str):
    dis_para = float(dis_para_str)
    time_now = request.cookies.get('time')
    json_str = get_group(time_now, dis_para)
    return json_str


@app.route('/get_seg_groups')
def get_seg_groups():
    time_now = request.cookies.get('time')
    json_str = seg_groups(time_now)

    return json_str


@app.route('/get_dis', methods=["POST"])
def get_dis():
    markers = request.values.get("marker")
    json_str = get_dis_json(markers)
    return json_str


@app.route('/gldelete')
def gl_del():
    try:
        time_now = request.cookies.get('time')
        if not (time_now is None):
            newpath = "./static/images/output/output_" + str(time_now) + ".png"
            os.remove(newpath)
            delete_info(time_now)
        response = make_response('Success')
        response.delete_cookie('time')
        return response
    except:
        response = make_response('Success')
        response.delete_cookie('time')
        return response
        print('删除出错')


def str_to_bool(str):
    return True if str.lower() == 'true' else False


if __name__ == '__main__':
    app.run(port=6002)
