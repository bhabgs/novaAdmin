#!/bin/bash
# wechat_dual.sh - Mac微信双开自动化脚本

echo "开始创建微信双开应用..."

# 步骤1-2：复制应用并修改Bundle ID
cd /Applications
sudo cp -R WeChat.app WeChat2.app
cd WeChat2.app/Contents
sudo /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.tencent.WeChat2" Info.plist

# 步骤3：重新签名
sudo codesign --force --deep -s - --timestamp=none /Applications/WeChat2.app

# 步骤4：修改显示名称
sudo /usr/libexec/PlistBuddy -c "Set :CFBundleName WeChat2" /Applications/WeChat2.app/Contents/Info.plist
sudo /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 微信2" /Applications/WeChat2.app/Contents/Info.plist

# 步骤5：清除缓存
sudo /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# 步骤6：授予权限
sudo chmod +x /Applications/WeChat2.app/Contents/MacOS/WeChat

echo "✅ 微信双开应用创建完成！请在应用程序文件夹中找到'微信2'启动。"
