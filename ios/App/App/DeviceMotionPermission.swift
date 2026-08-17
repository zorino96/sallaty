import Capacitor
import WebKit

//  Why this file exists
//  --------------------
//  The qibla compass reads `deviceorientation` / `webkitCompassHeading` from
//  the web layer. In Safari that is enough. Inside a WKWebView it is not:
//  since iOS 15, WebKit refuses the request outright unless the *host app*
//  answers for it. If nothing implements the delegate callback below, there is
//  no prompt, `DeviceOrientationEvent.requestPermission()` resolves to
//  "denied", and no orientation event ever fires — which is exactly how a
//  compass that works in the browser arrives dead on a real iPhone.
//
//  Capacitor points the web view's uiDelegate at its own WebViewDelegationHandler
//  and gives no hook to supply a different one, so rather than replace that
//  handler — and lose alert/confirm/prompt with it — we add the one method it
//  is missing. WebKit finds it by `respondsToSelector:`, so an @objc extension
//  on the existing handler is enough.
//
//  Granting without a prompt is deliberate. iOS still gates the underlying
//  motion data behind its own permission, backed by NSMotionUsageDescription in
//  Info.plist; this only says the app does not object on the web layer's
//  behalf. The compass is the sole caller, and the user reached it by opening
//  the qibla screen.

@available(iOS 15.0, *)
extension WebViewDelegationHandler {
    @objc(webView:requestDeviceOrientationAndMotionPermissionForOrigin:initiatedByFrame:decisionHandler:)
    public func webView(
        _ webView: WKWebView,
        requestDeviceOrientationAndMotionPermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }
}
