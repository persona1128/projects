"""Serve this local game over HTTP so browser audio works reliably."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


GAME_DIR = Path(__file__).resolve().parent.parent


def main():
    handler = partial(SimpleHTTPRequestHandler, directory=str(GAME_DIR))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/index.html"
        print(f"游戏已启动：{url}", flush=True)
        print("关闭此终端窗口即可停止本机服务。", flush=True)
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
