import os
import cv2
import dlib
import numpy as np
import inception_resnet_v1
import tensorflow as tf
from imutils.face_utils import FaceAligner
from imutils.face_utils import rect_to_bb


def process_image(img):
	cv_img = np.asarray(img)
	input_img = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
	gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
	img_h, img_w, _ = np.shape(input_img)

	# detect faces using dlib detector
	detected = detector(input_img, 1)
	faces = np.empty((len(detected), img_size, img_size, 3))

	for i, d in enumerate(detected):
	    x1, y1, x2, y2, w, h = d.left(), d.top(), d.right() + 1, d.bottom() + 1, d.width(), d.height()
	    xw1 = max(int(x1 - 0.4 * w), 0)
	    yw1 = max(int(y1 - 0.4 * h), 0)
	    xw2 = min(int(x2 + 0.4 * w), img_w - 1)
	    yw2 = min(int(y2 + 0.4 * h), img_h - 1)
	    cv2.rectangle(cv_img, (x1, y1), (x2, y2), (255, 0, 0), 2)
	    faces[i, :, :, :] = fa.align(input_img, gray, detected[i])

	if len(detected) > 0:
	    # predict ages and genders of the detected faces
	    ages,genders = sess.run([age, gender], feed_dict={images_pl: faces, train_mode: False})

	results = []
	for i, d in enumerate(detected):
	    results.append({'age': int(ages[i]), 'gender': "F" if genders[i] == 0 else "M", 'position': {'x1': d.left(), 'y1': d.top(), 'x2': d.right() + 1, 'y2': d.bottom() + 1}})
	return results


def load_network(model_path):
	sess = tf.Session()
	images_pl = tf.placeholder(tf.float32, shape=[None, 160, 160, 3], name='input_image')
	images_norm = tf.map_fn(lambda frame: tf.image.per_image_standardization(frame), images_pl)
	train_mode = tf.placeholder(tf.bool)
	age_logits, gender_logits, _ = inception_resnet_v1.inference(images_norm, keep_probability=0.8,
			                                         phase_train=train_mode,
			                                         weight_decay=1e-5)
	gender = tf.argmax(tf.nn.softmax(gender_logits), 1)
	age_ = tf.cast(tf.constant([i for i in range(0, 101)]), tf.float32)
	age = tf.reduce_sum(tf.multiply(tf.nn.softmax(age_logits), age_), axis=1)
	init_op = tf.group(tf.global_variables_initializer(),
		       tf.local_variables_initializer())
	sess.run(init_op)
	saver = tf.train.Saver()
	ckpt = tf.train.get_checkpoint_state(model_path)
	if ckpt and ckpt.model_checkpoint_path:
		saver.restore(sess, ckpt.model_checkpoint_path)
		print("restore model!")
	else:
		pass
	return sess,age,gender,train_mode,images_pl


sess, age, gender, train_mode,images_pl = load_network('./models')
depth = 16
k = 8

# for face detection
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
fa = FaceAligner(predictor, desiredFaceWidth=160)

# load model and weights
img_size = 160

