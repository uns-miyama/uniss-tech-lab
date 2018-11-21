from http.server import HTTPServer, CGIHTTPRequestHandler
import ssl

def run(host, port, ctx, handler):
    server = HTTPServer((host, port), handler)
    server.socket = ctx.wrap_socket(server.socket)
    print('Server Starts - %s:%s' % (host, port))

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()
    print('Server Stops - %s:%s' % (host, port))

if __name__ == '__main__':
    host = 'localhost'
    port = 8001

    ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ctx.load_cert_chain('./cert.pem')
    ctx.options |= ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1

    handler = CGIHTTPRequestHandler
    handler.cgi_directories = ['/cgi-bin', '/htbin']
    # https://stackoverflow.com/a/27303995/531320
    handler.have_fork=False

    run(host, port, ctx, handler)
