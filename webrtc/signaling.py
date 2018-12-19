from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
import ssl
from optparse import OptionParser

clients = []

class SimpleEcho(WebSocket):

    def handleMessage(self):
        for client in clients:
            if client != self: #judge
                print('-----on----')
                client.sendMessage(self.data)
            else:
                print('----skip-----')

    def handleConnected(self):
        print(self.address, 'connected')
        clients.append(self) #add client

    def handleClose(self):
        print(self.address, 'closed')


parser = OptionParser(usage="usage: %prog [options]", version="%prog 1.0")
parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert", help="cert (./cert.pem)")
parser.add_option("--key", default='./cert.pem', type='string', action="store", dest="key", help="key (./key.pem)")
parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")
(options, args) = parser.parse_args()
server = SimpleSSLWebSocketServer('', 8000, SimpleEcho, options.cert, options.key, version=options.ver)

server.serveforever()