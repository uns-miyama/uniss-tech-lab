#!/usr/bin/env python

import RPi.GPIO as GPIO
import pygame.mixer
import time

SWT_PIN = 17
TIMEOUT = 60000

GPIO.setmode(GPIO.BCM)
GPIO.setup(SWT_PIN, GPIO.IN)

# initialize mixer module
pygame.mixer.init()

# load music file
pygame.mixer.music.load("tw084.mp3")

# play count
pygame.mixer.music.play(-1)

# wait
channel = GPIO.wait_for_edge(SWT_PIN, GPIO.RISING, timeout=TIMEOUT)

pygame.mixer.music.stop()

