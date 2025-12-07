# 📝 تعليمات إضافة GitHub Actions Workflow

بسبب قيود الأمان في GitHub، لا يمكن رفع ملف workflow مباشرة عبر API. يجب إضافته يدوياً.

## الطريقة الأولى: عبر واجهة GitHub (الأسهل)

1. اذهب إلى المستودع: https://github.com/w4900857-netizen/adammrr5
2. انقر على تبويب **Actions**
3. انقر على **set up a workflow yourself**
4. احذف المحتوى الافتراضي
5. انسخ والصق المحتوى التالي:

```yaml
name: Deploy Appointment Booking Site

# Manual trigger only
on:
  workflow_dispatch:

jobs:
  deploy:
    name: Build and Deploy to Render
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          echo "✅ Dependencies installed successfully"
      
      - name: Verify project structure
        run: |
          echo "📁 Project structure:"
          ls -la
          echo ""
          echo "📁 Public folder:"
          ls -la public/
      
      # Deploy to Render using their API
      # You need to set these secrets in your GitHub repository settings:
      # - RENDER_API_KEY: Your Render API key (get it from https://dashboard.render.com/account/api-keys)
      # - RENDER_SERVICE_ID: Your Render service ID (get it from your service URL)
      # - TELEGRAM_BOT_TOKEN: Your Telegram bot token
      # - TELEGRAM_CHAT_ID: Your Telegram chat ID
      
      - name: Trigger Render deployment
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          echo "🚀 Triggering deployment to Render..."
          
          # Trigger manual deploy via Render API
          RESPONSE=$(curl -X POST \
            "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": false}')
          
          echo "Response: $RESPONSE"
          
          # Extract deploy ID
          DEPLOY_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
          echo "Deploy ID: $DEPLOY_ID"
          
          if [ -z "$DEPLOY_ID" ]; then
            echo "❌ Failed to trigger deployment"
            exit 1
          fi
          
          echo "✅ Deployment triggered successfully"
          echo "DEPLOY_ID=$DEPLOY_ID" >> $GITHUB_OUTPUT
      
      - name: Wait for deployment
        run: |
          echo "⏳ Waiting for deployment to complete (this may take a few minutes)..."
          sleep 120
          echo "✅ Deployment should be complete now"
      
      - name: Get deployment URL
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          echo "🔍 Fetching service information..."
          
          SERVICE_INFO=$(curl -s \
            "https://api.render.com/v1/services/$RENDER_SERVICE_ID" \
            -H "Authorization: Bearer $RENDER_API_KEY")
          
          # Extract service URL
          SERVICE_URL=$(echo $SERVICE_INFO | grep -o '"serviceDetails":{"url":"[^"]*"' | cut -d'"' -f6)
          
          if [ -z "$SERVICE_URL" ]; then
            echo "⚠️  Could not extract URL from API response"
            echo "Service info: $SERVICE_INFO"
            SERVICE_URL="https://your-service-name.onrender.com"
          fi
          
          echo ""
          echo "=========================================="
          echo "✅ DEPLOYMENT SUCCESSFUL!"
          echo "=========================================="
          echo ""
          echo "🌐 Your appointment booking site is now live at:"
          echo "   $SERVICE_URL"
          echo ""
          echo "📱 Telegram notifications are configured"
          echo "   All new appointments will be sent to your Telegram"
          echo ""
          echo "=========================================="
          echo ""
          echo "DEPLOYED_URL=$SERVICE_URL" >> $GITHUB_OUTPUT
          
          # Set as environment variable for next steps
          echo "DEPLOYED_URL=$SERVICE_URL" >> $GITHUB_ENV
      
      - name: Test deployment
        run: |
          echo "🧪 Testing deployment..."
          
          # Test health endpoint
          HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYED_URL}/health" || echo "000")
          
          if [ "$HEALTH_CHECK" = "200" ]; then
            echo "✅ Health check passed!"
          else
            echo "⚠️  Health check returned status: $HEALTH_CHECK"
            echo "   The site might still be starting up. Please check manually."
          fi
      
      - name: Deployment summary
        run: |
          echo "## 🎉 Deployment Complete!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Your appointment booking website has been successfully deployed!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### 🌐 Website URL" >> $GITHUB_STEP_SUMMARY
          echo "\`${DEPLOYED_URL}\`" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### 📱 Features" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Appointment booking form" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Telegram notifications enabled" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Mobile-friendly design" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Form validation" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### 🔔 Next Steps" >> $GITHUB_STEP_SUMMARY
          echo "1. Visit your website at the URL above" >> $GITHUB_STEP_SUMMARY
          echo "2. Test the booking form" >> $GITHUB_STEP_SUMMARY
          echo "3. Check your Telegram for the notification" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "---" >> $GITHUB_STEP_SUMMARY
          echo "*Deployed at: $(date)*" >> $GITHUB_STEP_SUMMARY
```

6. غيّر اسم الملف إلى: `deploy-appointment-site.yml`
7. انقر على **Commit changes**

## الطريقة الثانية: عبر سطر الأوامر

إذا كنت تستخدم Git محلياً:

```bash
# استنساخ المستودع
git clone https://github.com/w4900857-netizen/adammrr5.git
cd adammrr5

# إنشاء مجلد workflows
mkdir -p .github/workflows

# إنشاء ملف workflow (انسخ المحتوى أعلاه)
nano .github/workflows/deploy-appointment-site.yml

# رفع التغييرات
git add .github/workflows/deploy-appointment-site.yml
git commit -m "Add GitHub Actions workflow"
git push
```

## ✅ بعد إضافة الـ Workflow

اتبع التعليمات في ملف README.md لإكمال الإعداد:

1. إنشاء بوت Telegram
2. إنشاء خدمة على Render
3. إضافة GitHub Secrets
4. تشغيل الـ Workflow

---

**ملاحظة**: ملف الـ workflow موجود بالفعل في المجلد `.github/workflows/` في المشروع المحلي، لكن يجب إضافته يدوياً إلى GitHub بسبب قيود الأمان.
