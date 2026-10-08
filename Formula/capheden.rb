# Homebrew Formula for capheden (macOS)

# TODO: Update `url` and `sha256` to point to the correct GitHub Release
# and its checksum for your architecture/tarball as needed. This formula
# assumes downloading the prebuilt macOS binary from GitHub Releases.

class Capheden < Formula
  desc "macOS terminal TUI to keep your Mac awake using caffeinate"
  homepage "https://github.com/Awilum/capheden"
  license "MIT"
  version "0.1.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/Awilum/capheden/releases/download/v#{version}/capheden-macos-arm64"
      sha256 "8ce106dab0ce453c23c11a9d10a40394165decf64c0ada1b30fa234c26db859a"
    else
      url "https://github.com/Awilum/capheden/releases/download/v#{version}/capheden-macos-x64"
      sha256 "8ce106dab0ce453c23c11a9d10a40394165decf64c0ada1b30fa234c26db859a"
    end
  end

  def install
    bin.install "capheden-macos-#{Hardware::CPU.arm? ? 'arm64' : 'x64'}" => "capheden"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/capheden --version")
    assert_match "Cà Phê Đen", shell_output("#{bin}/capheden --help")
  end
end
