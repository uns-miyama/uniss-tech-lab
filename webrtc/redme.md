# WebRTC関連導入起動メモ
## 初回操作
- モジュールを追加する

  `pip install git+https://github.com/dpallot/simple-websocket-server.git`
  </br>
  または
  </br>
  `python -m pip install git+https://github.com/dpallot/simple-websocket-server.git`

- 証明書作成
</br>
  `openssl req -days 3650 -new -nodes -newkey rsa:4096 -x509 -keyout cert.pem -out cert.pem`


## 起動方法
- Webサーバー立ち上げ
  </br>
  `python3 httpsServer.py`

- WebRTCサーバー立ち上げ
  </br>`python3 signaling.py`
