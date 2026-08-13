#!/bin/sh
# Xcode Cloud post-clone hook.
#
# Xcode Cloud clones the repo and then goes straight to xcodebuild, which is no
# use to a Capacitor app: the Xcode project is a shell around a web build that
# does not exist yet. This script fills that gap — it builds the Next.js export,
# copies it into the iOS project, and installs the CocoaPods Capacitor needs.
#
# Xcode Cloud looks for ci_scripts/ next to the .xcodeproj, hence ios/App/.
# Codemagic does the same work from codemagic.yaml instead; the two are
# alternatives, and whichever runs, the resulting .ipa is identical.

set -e

cd "$CI_PRIMARY_REPOSITORY_PATH"

# The Xcode Cloud image may or may not ship Node; install it only if missing so
# we don't pay for a Homebrew download on every build.
if ! command -v node > /dev/null 2>&1; then
  echo "Node not found — installing node@20"
  brew install node@20
  export PATH="$(brew --prefix node@20)/bin:$PATH"
fi

echo "node $(node --version), npm $(npm --version)"

npm ci
npx next build
npx cap sync ios

# cap sync rewrites the Podfile with the current plugin list, so pods come last.
cd ios/App
pod install
