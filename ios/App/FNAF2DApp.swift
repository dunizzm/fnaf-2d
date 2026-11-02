import SwiftUI

@main
struct FNAF2DApp: App {
    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.black.ignoresSafeArea()
                GameView()
            }
            .preferredColorScheme(.dark)
            .statusBarHidden(true)
        }
    }
}
