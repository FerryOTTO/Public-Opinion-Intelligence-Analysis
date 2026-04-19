#!/bin/bash

# GitHub Pages部署脚本
# 作者：FerryOTTO
# 项目：Public Opinion Intelligence Analysis

set -e

echo "🚀 开始部署舆情智析系统到GitHub Pages"
echo "========================================"

# 检查git状态
echo "📊 检查Git状态..."
git status

# 询问用户GitHub仓库名称
read -p "📝 请输入GitHub仓库名称（建议：public-opinion-analysis）: " REPO_NAME

if [ -z "$REPO_NAME" ]; then
    REPO_NAME="public-opinion-analysis"
    echo "ℹ️ 使用默认仓库名称: $REPO_NAME"
fi

# 设置远程仓库
echo "🔗 设置GitHub远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/FerryOTTO/$REPO_NAME.git"

echo "📤 推送代码到GitHub..."
echo "ℹ️ 请确保您已经："
echo "   1. 登录GitHub账号 FerryOTTO"
echo "   2. 创建了名为 '$REPO_NAME' 的公开仓库"
echo ""
read -p "✅ 确认已创建仓库并准备好推送？(y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ 操作取消"
    echo ""
    echo "📋 请手动完成以下步骤："
    echo "   1. 访问 https://github.com/new"
    echo "   2. 创建仓库 '$REPO_NAME'"
    echo "   3. 返回并重新运行此脚本"
    exit 1
fi

# 尝试推送
echo "🔄 推送代码..."
if git push -u origin main; then
    echo "✅ 代码推送成功！"
else
    echo "❌ 推送失败，可能是仓库不存在或权限问题"
    echo ""
    echo "📋 请手动创建仓库后运行："
    echo "   git remote add origin https://github.com/FerryOTTO/$REPO_NAME.git"
    echo "   git push -u origin main"
    exit 1
fi

echo ""
echo "🎉 代码已推送到GitHub！"
echo ""
echo "📋 接下来需要手动完成的步骤："
echo ""
echo "1. 🔧 启用GitHub Pages"
echo "   访问: https://github.com/FerryOTTO/$REPO_NAME/settings/pages"
echo "   配置:"
echo "   - Source: Deploy from a branch"
echo "   - Branch: gh-pages (或 main)"
echo "   - Folder: / (根目录)"
echo ""
echo "2. ⏳ 等待自动部署"
echo "   GitHub Actions会自动构建和部署"
echo "   查看进度: https://github.com/FerryOTTO/$REPO_NAME/actions"
echo ""
echo "3. 🌐 访问您的网站"
echo "   部署成功后访问:"
echo "   https://ferryotto.github.io/$REPO_NAME/"
echo ""
echo "4. 📝 提交项目链接"
echo "   将上面的链接提交给计算机设计课程"
echo ""
echo "🛠️ 项目信息："
echo "   - 项目名称: Public Opinion Intelligence Analysis"
echo "   - 部署方式: GitHub Pages + GitHub Actions"
echo "   - 构建状态: 已配置自动化部署"
echo ""
echo "❓ 遇到问题？"
echo "   1. 检查GitHub Actions日志"
echo "   2. 确保仓库是公开的"
echo "   3. 确认GitHub Pages设置正确"
echo ""
echo "祝您部署顺利！🎯"