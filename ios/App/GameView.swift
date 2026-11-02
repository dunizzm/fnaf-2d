import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct GameView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.setURLSchemeHandler(GameAssets(), forURLScheme: "fnaf")
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        let mobileStyle = """
        const style = document.createElement('style');
        style.textContent = '#game{min-height:0!important}#scene{touch-action:none}body{-webkit-user-select:none;user-select:none}.tools #full{display:none}';
        document.head.appendChild(style);
        """
        configuration.userContentController.addUserScript(WKUserScript(source: mobileStyle, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        UIApplication.shared.isIdleTimerDisabled = true
        webView.navigationDelegate = context.coordinator
        context.coordinator.webView = webView
        webView.load(URLRequest(url: URL(string: "fnaf://game/index.html")!))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        weak var webView: WKWebView?
        private var backgroundObserver: NSObjectProtocol?
        private let smoke = ProcessInfo.processInfo.arguments.contains("--smoke-test")

        override init() {
            super.init()
            backgroundObserver = NotificationCenter.default.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main) { [weak self] _ in
                self?.webView?.evaluateJavaScript("if(typeof active==='function'&&active())pause();", completionHandler: nil)
            }
        }
        deinit { if let observer = backgroundObserver { NotificationCenter.default.removeObserver(observer) } }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
            if url.scheme == "fnaf", url.host == "game" { decisionHandler(.allow); return }
            if navigationAction.navigationType == .linkActivated, url.scheme == "https", url.host == "github.com" {
                UIApplication.shared.open(url)
            }
            decisionHandler(.cancel)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            guard smoke else { return }
            let check = """
            await loading;
            if(loadFailed)throw Error('A texture did not load');
            await Sound.init();
            Sound.master.gain.value=0;
            for(const name of AUDIO_NAMES)if(!Sound.buffers[name]?.length)throw Error('Sound did not decode: '+name);
            Sound.walk(0,1);Sound.walk(1,1);Sound.play('jumpscare',0);Sound.music(true);Sound.stopAll();
            await document.fonts.ready;
            if(!document.fonts.check('16px GameConsolas'))throw Error('Font missing');
            if(document.querySelectorAll('#mapButtons button').length!==11)throw Error('Camera map incomplete');
            localStorage.setItem('__ios_smoke','ok');
            if(localStorage.getItem('__ios_smoke')!=='ok')throw Error('Save storage unavailable');
            localStorage.removeItem('__ios_smoke');
            const h=document.getElementById('game').getBoundingClientRect().height;
            if(h>innerHeight+1)throw Error('Game exceeds iPhone viewport');
            return {ok:true,textures:Object.keys(assets).length,sounds:AUDIO_NAMES.length,cameras:11,width:innerWidth,height:innerHeight};
            """
            webView.callAsyncJavaScript(check, arguments: [:], in: nil, contentWorld: .page) { result in
                switch result {
                case .success(let value): self.writeSmoke(value as? [String: Any] ?? ["ok": false, "error": "Invalid report"])
                case .failure(let error): self.writeSmoke(["ok": false, "error": error.localizedDescription])
                }
            }
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            if smoke { writeSmoke(["ok": false, "error": error.localizedDescription]) }
        }
        private func writeSmoke(_ report: [String: Any]) {
            do {
                let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let data = try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
                try data.write(to: directory.appendingPathComponent("ios-smoke.json"), options: .atomic)
                print("IOS_SMOKE_REPORT", String(data: data, encoding: .utf8) ?? "")
            } catch { print("IOS_SMOKE_REPORT_ERROR", error) }
        }
    }
}

final class GameAssets: NSObject, WKURLSchemeHandler {
    private let root = Bundle.main.url(forResource: "WebGame", withExtension: nil)!.standardizedFileURL

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        do {
            guard let url = urlSchemeTask.request.url, url.scheme == "fnaf", url.host == "game", url.user == nil, url.password == nil, url.port == nil else { throw URLError(.badURL) }
            let path = url.path.removingPercentEncoding ?? url.path
            guard !path.contains("\\"), !path.contains("\0") else { throw URLError(.badURL) }
            let relative = path == "/" ? "index.html" : String(path.drop(while: { $0 == "/" }))
            let file = root.appendingPathComponent(relative).standardizedFileURL
            guard file.path.hasPrefix(root.path + "/") else { throw URLError(.noPermissionsToReadFile) }
            let data = try Data(contentsOf: file)
            let mime = UTType(filenameExtension: file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
            let headers = ["Content-Type": mime, "Content-Length": String(data.count), "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache"]
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
        } catch { urlSchemeTask.didFailWithError(error) }
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}
