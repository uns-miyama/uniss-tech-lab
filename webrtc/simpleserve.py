import http.server

server_address = ("", 8001)
handler_class = http.server.SimpleHTTPRequestHandler
simple_server = http.server.HTTPServer(server_address, handler_class)
simple_server.serve_forever()
