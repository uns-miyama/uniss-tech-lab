import io
import picamera
import cv2
  
import numpy as np
 
stream = io.BytesIO()
  
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480
  
color = (255,255,255)
camera = picamera.PiCamera()
camera.resolution = (CAMERA_WIDTH, CAMERA_HEIGHT)
camera.hflip = True
camera.vflip = True
  
for i in xrange(50):
    camera.capture(stream, format='png')
    data = np.fromstring(stream.getvalue(), dtype=np.uint8)
    image = cv2.imdecode(data, 1)
  
    cv2.imshow('image',image)
    cv2.waitKey(16)

    stream.seek(0)

