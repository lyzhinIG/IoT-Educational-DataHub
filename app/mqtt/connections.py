import logging

from app.initial import mqtt



def publish_message(topic, message):
    mqtt.publish(topic, message)


def handle_device_mqtt_connection(topic):
    mqtt.subscribe(topic)
