# 📚 Windows Disk Cleanup Automation Builder - Documentation (English)

Welcome to the official English documentation for **Windows Disk Cleanup Automation Builder (`v1.5.0`)**, a high-performance Windows utility designed to automate `cleanmgr.exe` via Windows Registry (`VolumeCaches`) and safely purge locked `C:\Windows.old` directories, distributed as both a standalone portable executable (`.exe`) and an Inno Setup installer.

---

## 🌐 Multilingual & Localization Support (v1.5.0)

Starting with **v1.5.0**, Disk Cleanup Automation Builder includes **automatic system locale detection** (Korean `ko`, English `en`, and Japanese `ja`):
- **Desktop GUI (`disk_cleanup_gui.py`)**: Detects the Windows OS UI language via Win32 `GetUserDefaultUILanguage()` (with POSIX `locale` fallback) and dynamically localizes all labels, 5-stage cleanup logs, `Windows.old` purge status, and GitHub update dialogs. A manual language dropdown is also available at runtime.
- **Inno Setup Installer (`installer.iss`)**: Supports Korean (`Korean.isl`), English (`Default.isl`), and Japanese (`Japanese.isl`), including localized overwrite confirmation dialogs.
- **Web Preview Server (`server.js`)**: Automatically detects `navigator.language` and dynamically translates UI sections and generated `.bat` / `.ps1` script comments.

---

## ⚡ Quick Start

### 1. Installation & Silent Deployment
Download `WindowsDiskCleanup_Setup_v1.5.0.exe`, `DiskCleanupAuto_v1.5.0.exe`, or `WindowsDiskCleanup_Portable_v1.5.0.zip` from [GitHub Releases](https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases).

```cmd
:: Silent unattended installation (ideal for lab/enterprise deployment)
WindowsDiskCleanup_Setup_v1.5.0.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART

:: Silent uninstall
"C:\Program Files\Windows Disk Cleanup Automation Builder\unins000.exe" /VERYSILENT /SUPPRESSMSGBOXES
```

### 2. Core Safety & Cleanup Pipeline
1. **UAC Elevation**: Automatically requests Administrator elevation cleanly via `ShellExecuteW("runas")`.
2. **Registry Activation**: Configures `StateFlags0064 = 2` across 15 `VolumeCaches` items (including `Previous Installations` & `Update Cleanup`).
3. **Kernel-Synced `cleanmgr.exe`**: Monitors `cleanmgr.exe` via `WaitForSingleObject` & `EnumWindows` HWND hooking and automatically refreshes tray ghost icons.
4. **Windows.old Safe-Guard**: Scans `C:\Windows.old\Users` (`Desktop`, `Documents`, `Downloads`, `Pictures`) before running 3-step forced purge (`takeown` -> `icacls` -> `rd /s /q`). If personal files are detected, deletion is safely skipped.

### 3. Local Build (Windows)
```cmd
:: Build Portable EXE + Inno Setup Installer into Release\
build_exe.bat
```

---

## 📂 Documentation Directory

1. **[Installation Guide](./INSTALL.md)** — Inno Setup unpacked deployment, silent switches, and firewall rules.
2. **[Build & Packaging Guide](./BUILD.md)** — Local batch/Python compilation, PyInstaller + ISCC, and GitHub Actions CI/CD.
3. **[Patch Notes & Changelog](./PATCH_NOTES.md)** — Detailed release history (`v1.0.0` ~ `v1.5.0`).
4. **[Security & Privacy Policy](./SECURITY.md)** — UAC model, `.gitignore` rules, and personal data Safe-Guard.
5. **[Development Roadmap](./ROADMAP.md)** — Completed Phases 1–18 and future enhancements.
6. **[Blog Post Template](./BLOG_POST.md)** — Markdown draft for technical blogs.

---

## 🛠️ Project Metadata

- **Application Name**: Windows Disk Cleanup Automation Builder (`DiskCleanupAuto`)
- **Version**: `v1.5.0`
- **Developer**: `AhBiYout` (GitHub: `AhBiYout-all`)
- **Corporate Affiliation**: [(주)청운정보시스템](http://cisnet.co.kr) (`cisnet.co.kr`)
- **Official Blog**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **License**: MIT License ([`LICENSE`](../LICENSE))
- **Repository**: `https://github.com/AhBiYout-all/windows-disk-cleanup-builder`
