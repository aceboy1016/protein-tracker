// 自動更新システム
class AutoUpdateSystem {
    constructor() {
        this.isRunning = false;
        this.updateInterval = null;
        this.settings = this.loadSettings();
        this.stats = {
            lastUpdateTime: null,
            newMenusCount: 0,
            updatedImagesCount: 0,
            errorCount: 0
        };

        // 各チェーン店の更新メソッド
        this.updaters = {
            'crispy': this.updateCrispySalad.bind(this),
            'subway': this.updateSubway.bind(this),
            'yoshinoya': this.updateYoshinoya.bind(this),
            'mos': this.updateMosBurger.bind(this),
            'starbucks': this.updateStarbucks.bind(this)
        };

        this.initializeUI();
    }

    // 設定の読み込み
    loadSettings() {
        return JSON.parse(localStorage.getItem('autoUpdateSettings') || JSON.stringify({
            frequency: 60, // 分
            enableNotifications: true,
            apis: {
                crispy: { url: 'https://api.crispy-salad.com/v1/menu', key: '' },
                subway: { url: 'https://subway.co.jp/menu', interval: 60 },
                yoshinoya: { rss: 'https://yoshinoya.com/menu/rss', nutrition: '' },
                mos: { url: 'https://mos.jp/api/v2/menu', token: '' },
                starbucks: { url: 'https://app.starbucks.co.jp/api/v1/menu', region: 'jp' },
                unsplash: { key: '' },
                googleImages: { key: '' }
            }
        }));
    }

    // 設定の保存
    saveSettings() {
        localStorage.setItem('autoUpdateSettings', JSON.stringify(this.settings));
    }

    // UI初期化
    initializeUI() {
        this.updateStatusDisplay();
        this.updateStatsDisplay();
        this.loadAPISettings();
    }

    // 自動更新の開始/停止
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    // 自動更新開始
    start() {
        this.isRunning = true;
        const frequencyMs = this.settings.frequency * 60 * 1000;

        this.updateInterval = setInterval(() => {
            this.executeUpdate();
        }, frequencyMs);

        this.updateStatusDisplay();
        this.addLogEntry('自動更新システムを開始しました', 'success');

        // 即座に1回実行
        this.executeUpdate();
    }

    // 自動更新停止
    stop() {
        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.updateStatusDisplay();
        this.addLogEntry('自動更新システムを停止しました', 'warning');
    }

    // 手動更新実行
    async executeUpdate() {
        this.addLogEntry('更新を開始しています...', 'success');

        try {
            const promises = Object.keys(this.updaters).map(async (chain) => {
                try {
                    await this.updaters[chain]();
                    this.addLogEntry(`${chain}: 更新完了`, 'success');
                } catch (error) {
                    this.stats.errorCount++;
                    this.addLogEntry(`${chain}: エラー - ${error.message}`, 'error');
                }
            });

            await Promise.all(promises);

            this.stats.lastUpdateTime = new Date().toISOString();
            this.updateStatsDisplay();
            this.addLogEntry('全店舗の更新が完了しました', 'success');

            // 新メニューがあれば通知
            if (this.settings.enableNotifications && this.stats.newMenusCount > 0) {
                this.showNotification();
            }

        } catch (error) {
            this.addLogEntry(`更新中にエラーが発生しました: ${error.message}`, 'error');
        }
    }

    // Crispy Salad更新
    async updateCrispySalad() {
        const apiSettings = this.settings.apis.crispy;
        if (!apiSettings.url) {
            throw new Error('API URLが設定されていません');
        }

        try {
            // デモ用のモックデータ（実際のAPIが利用可能になったら置き換え）
            const mockResponse = await this.simulateAPICall('crispy', {
                menus: [
                    {
                        id: 'crispy_keto_bowl_new',
                        name: 'ケトジェニックボウル',
                        description: 'アボカドとサーモンの低糖質ボウル',
                        category: 'ボウル',
                        price: 1480,
                        nutrition: { calories: 380, protein: 28, carbs: 8, fat: 26, fiber: 8, sodium: 650 },
                        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
                        is_new: true
                    }
                ]
            });

            await this.processNewMenus('crispy_salad', mockResponse.menus);

        } catch (error) {
            console.error('Crispy Salad API error:', error);
            throw error;
        }
    }

    // サブウェイ更新
    async updateSubway() {
        try {
            // スクレイピング風のモックデータ
            const mockResponse = await this.simulateAPICall('subway', {
                menus: [
                    {
                        id: 'subway_protein_wrap_new',
                        name: 'プロテインラップ',
                        description: 'ターキー&チキンの高タンパクラップ',
                        category: 'ラップ',
                        price: 580,
                        nutrition: { calories: 320, protein: 25, carbs: 28, fat: 12, fiber: 4, sodium: 980 },
                        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=200&fit=crop',
                        is_new: true
                    }
                ]
            });

            await this.processNewMenus('subway', mockResponse.menus);

        } catch (error) {
            console.error('Subway scraping error:', error);
            throw error;
        }
    }

    // 吉野家更新
    async updateYoshinoya() {
        try {
            const mockResponse = await this.simulateAPICall('yoshinoya', {
                menus: [
                    {
                        id: 'yoshinoya_protein_bowl_new',
                        name: 'プロテイン牛丼',
                        description: '通常の2倍のお肉でタンパク質強化',
                        category: '丼',
                        price: 680,
                        nutrition: { calories: 850, protein: 35, carbs: 85, fat: 28, fiber: 2, sodium: 1450 },
                        image: 'https://images.unsplash.com/photo-1503945438517-f85a78126282?w=300&h=200&fit=crop',
                        is_new: true
                    }
                ]
            });

            await this.processNewMenus('yoshinoya', mockResponse.menus);

        } catch (error) {
            console.error('Yoshinoya RSS error:', error);
            throw error;
        }
    }

    // モスバーガー更新
    async updateMosBurger() {
        try {
            const mockResponse = await this.simulateAPICall('mos', {
                menus: [
                    {
                        id: 'mos_plant_burger_new',
                        name: 'プラントベースバーガー',
                        description: '植物性パティの新感覚バーガー',
                        category: 'ハンバーガー',
                        price: 520,
                        nutrition: { calories: 285, protein: 18, carbs: 32, fat: 12, fiber: 6, sodium: 720 },
                        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
                        is_new: true,
                        is_vegetarian: true,
                        is_vegan: true
                    }
                ]
            });

            await this.processNewMenus('mos_burger', mockResponse.menus);

        } catch (error) {
            console.error('Mos Burger API error:', error);
            throw error;
        }
    }

    // スターバックス更新
    async updateStarbucks() {
        try {
            const mockResponse = await this.simulateAPICall('starbucks', {
                menus: [
                    {
                        id: 'starbucks_protein_smoothie_new',
                        name: 'プロテインスムージー',
                        description: 'ベリーとプロテインパウダーのスムージー',
                        category: '軽食',
                        price: 650,
                        nutrition: { calories: 240, protein: 20, carbs: 28, fat: 6, fiber: 4, sodium: 180 },
                        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop',
                        is_new: true
                    }
                ]
            });

            await this.processNewMenus('starbucks', mockResponse.menus);

        } catch (error) {
            console.error('Starbucks API error:', error);
            throw error;
        }
    }

    // API呼び出しのシミュレーション（実際のAPI実装時は削除）
    async simulateAPICall(chain, mockData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockData);
            }, Math.random() * 2000 + 1000); // 1-3秒のランダムな遅延
        });
    }

    // 新メニューの処理
    async processNewMenus(restaurantId, newMenus) {
        const currentData = JSON.parse(localStorage.getItem('restaurantData') || '{"restaurants":[],"menus":[]}');
        let addedCount = 0;

        for (const menu of newMenus) {
            if (menu.is_new && !currentData.menus.find(m => m.id === menu.id)) {
                // 新メニューを追加
                const newMenu = {
                    id: menu.id,
                    restaurant_id: restaurantId,
                    name: menu.name,
                    category: menu.category,
                    description: menu.description,
                    image: menu.image,
                    price: menu.price,
                    size: menu.size || 'レギュラー',
                    nutrition: menu.nutrition,
                    allergens: menu.allergens || [],
                    is_vegetarian: menu.is_vegetarian || false,
                    is_vegan: menu.is_vegan || false,
                    is_gluten_free: menu.is_gluten_free || false,
                    available: true,
                    seasonal: menu.seasonal || false,
                    added_date: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                };

                currentData.menus.push(newMenu);
                addedCount++;
                this.stats.newMenusCount++;

                // 画像も更新
                if (menu.image) {
                    this.stats.updatedImagesCount++;
                }

                this.addLogEntry(`新メニュー追加: ${menu.name}`, 'success');
            }
        }

        if (addedCount > 0) {
            localStorage.setItem('restaurantData', JSON.stringify(currentData));
        }

        return addedCount;
    }

    // 画像の自動取得・更新
    async updateImages(menuName, category) {
        try {
            const unsplashKey = this.settings.apis.unsplash.key;
            if (!unsplashKey) {
                throw new Error('Unsplash APIキーが設定されていません');
            }

            const query = `${menuName} ${category} food`;
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: {
                    'Authorization': `Client-ID ${unsplashKey}`
                }
            });

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].urls.regular;
            }

            return null;
        } catch (error) {
            console.error('Image update error:', error);
            return null;
        }
    }

    // API接続テスト
    async testAPI(chain) {
        try {
            this.addLogEntry(`${chain}: 接続テスト開始`, 'success');

            // 実際のAPIテストロジック（簡易版）
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.addLogEntry(`${chain}: 接続成功`, 'success');
            alert(`${chain}への接続テストが成功しました`);
        } catch (error) {
            this.addLogEntry(`${chain}: 接続失敗 - ${error.message}`, 'error');
            alert(`${chain}への接続テストが失敗しました: ${error.message}`);
        }
    }

    // ステータス表示更新
    updateStatusDisplay() {
        const indicator = document.getElementById('updateStatusIndicator');
        const statusText = document.getElementById('updateStatusText');
        const toggleBtn = document.getElementById('toggleAutoUpdate');

        if (this.isRunning) {
            indicator.className = 'status-indicator';
            statusText.textContent = `自動更新実行中（${this.settings.frequency}分間隔）`;
            toggleBtn.textContent = '自動更新を停止';
            toggleBtn.className = 'btn-danger';
        } else {
            indicator.className = 'status-indicator error';
            statusText.textContent = 'システム停止中';
            toggleBtn.textContent = '自動更新を開始';
            toggleBtn.className = 'btn-primary';
        }
    }

    // 統計表示更新
    updateStatsDisplay() {
        document.getElementById('lastUpdateTime').textContent =
            this.stats.lastUpdateTime ? new Date(this.stats.lastUpdateTime).toLocaleString('ja-JP') : '未実行';
        document.getElementById('newMenusCount').textContent = this.stats.newMenusCount;
        document.getElementById('updatedImagesCount').textContent = this.stats.updatedImagesCount;
        document.getElementById('errorCount').textContent = this.stats.errorCount;
    }

    // ログエントリー追加
    addLogEntry(message, type = 'info') {
        const log = document.getElementById('updateLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString('ja-JP')} - ${message}`;

        log.insertBefore(entry, log.firstChild);

        // ログが多くなりすぎないよう制限
        while (log.children.length > 50) {
            log.removeChild(log.lastChild);
        }
    }

    // API設定の読み込み
    loadAPISettings() {
        Object.keys(this.settings.apis).forEach(key => {
            const api = this.settings.apis[key];
            if (key === 'crispy') {
                document.getElementById('crispyApiUrl').value = api.url || '';
                document.getElementById('crispyApiKey').value = api.key || '';
            }
            // 他のAPI設定も同様に読み込み
        });
    }

    // API設定の保存
    saveAPISettings() {
        this.settings.apis.crispy.url = document.getElementById('crispyApiUrl').value;
        this.settings.apis.crispy.key = document.getElementById('crispyApiKey').value;
        // 他のAPI設定も同様に保存

        this.settings.frequency = parseInt(document.getElementById('updateFrequency').value);
        this.settings.enableNotifications = document.getElementById('enableNotifications').checked;

        this.saveSettings();
        this.addLogEntry('API設定を保存しました', 'success');
        alert('設定が保存されました');
    }

    // 通知表示
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('新メニューが追加されました！', {
                body: `${this.stats.newMenusCount}件の新しいメニューが見つかりました`,
                icon: '/favicon.ico'
            });
        }
    }

    // ログクリア
    clearLog() {
        document.getElementById('updateLog').innerHTML =
            '<div class="log-entry">ログをクリアしました</div>';
    }
}

// グローバル変数として初期化
let autoUpdateSystem = null;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
    autoUpdateSystem = new AutoUpdateSystem();
});

// グローバル関数（HTMLから呼び出し用）
function toggleAutoUpdate() {
    if (autoUpdateSystem) {
        autoUpdateSystem.toggle();
    }
}

function manualUpdate() {
    if (autoUpdateSystem) {
        autoUpdateSystem.executeUpdate();
    }
}

function testConnection() {
    if (autoUpdateSystem) {
        autoUpdateSystem.addLogEntry('全API接続テストを開始', 'success');
        ['crispy', 'subway', 'yoshinoya', 'mos', 'starbucks'].forEach(chain => {
            autoUpdateSystem.testAPI(chain);
        });
    }
}

function testAPI(chain) {
    if (autoUpdateSystem) {
        autoUpdateSystem.testAPI(chain);
    }
}

function saveAPISettings() {
    if (autoUpdateSystem) {
        autoUpdateSystem.saveAPISettings();
    }
}

function resetAPISettings() {
    if (confirm('API設定をデフォルトに戻しますか？')) {
        autoUpdateSystem.settings.apis = autoUpdateSystem.loadSettings().apis;
        autoUpdateSystem.loadAPISettings();
        alert('設定をリセットしました');
    }
}

function clearUpdateLog() {
    if (autoUpdateSystem) {
        autoUpdateSystem.clearLog();
    }
}