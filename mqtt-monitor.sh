#! /bin/bash

set -ue
export GOTO_NUM_THREADS=1
export OMP_NUM_THREADS=1
export OPENBLAS_NUM_THREADS=1
export WHERE_FLASK=123

source /home/s809749/virtualenv/iot_lk/3.8/bin/activate
cd /home/s809749/iot_lk

touch "mqtt-monitor.pid"
# kill "$(cat mqtt-monitor.pid)" || true

if ! [ "$(cat mqtt-monitor.pid)" = "" ] && [ -d "/proc/$(cat mqtt-monitor.pid)" ]; then
	echo Already rubbubg >&2
	echo Already rubbubg
	exit 0
fi

set

flask --app app run --port 5000 -h 127.0.1.9 >> log-mqtt.log &
PID=$!
echo -n "$PID" > "mqtt-monitor.pid"
