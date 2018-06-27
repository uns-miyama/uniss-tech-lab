import subprocess
import time

p = subprocess.Popen("uv4l --auto-video_nr --driver raspicam --encoding mjpeg --server-option '--port=9000' --driver raspicam --rotation 180 --width 512 --height 384", shell=True)

time.sleep(100)

p = subprocess.Popen("sudo pkill uv4l", shell=True)

