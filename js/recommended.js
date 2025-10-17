// おすすめ食材データ管理
let recommendedFoods = [];
let filteredFoods = [];

// 管理画面形式からrecommended形式への変換
function convertAdminToRecommended(adminFoods) {
    return adminFoods.map(food => ({
        id: food.id,
        name: food.name,
        category: food.category,
        description: food.description,
        protein_per_100g: food.proteinPer100g || 0,
        carbs_per_100g: food.carbsPer100g || 0,
        fat_per_100g: food.fatPer100g || 0,
        calories_per_100g: food.caloriesPer100g || 0,
        serving_size: food.servingSize || '',
        protein_per_serving: food.proteinPerServing || 0,
        rating: food.rating || 4,
        price_range: food.priceRange || 'やや高価',
        vitamins: food.vitamins || [],
        minerals: food.minerals || [],
        benefits: food.benefits || [],
        cooking_tips: food.cookingTips || []
    }));
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadRecommendedFoods();
    setupEventListeners();
});

// おすすめ食材データの読み込み
async function loadRecommendedFoods() {
    console.log('データ読み込み開始');
    const grid = document.getElementById('foodsGrid');

    if (!grid) {
        console.error('foodsGrid要素が見つかりません');
        return;
    }

    // ローディング表示
    grid.innerHTML = '<div class="loading">データを読み込み中...</div>';

    try {
        // まずlocalStorageから管理者が編集した食材データを確認
        const storedFoods = JSON.parse(localStorage.getItem('foodsData') || '{"foods": []}');

        if (storedFoods.foods && storedFoods.foods.length > 0) {
            // 管理者が編集したデータがある場合はそれを使用（recommended形式に変換）
            console.log('管理者編集データを使用:', storedFoods.foods.length, '件');
            recommendedFoods = convertAdminToRecommended(storedFoods.foods);
        } else {
            // 編集データがない場合は元のJSONファイルから読み込み
            console.log('元のJSONファイルを取得中...');
            const response = await fetch('data/recommended-foods.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('JSONを解析中...');
            const data = await response.json();

            if (!data || !data.recommended_foods) {
                throw new Error('データ形式が不正です');
            }

            console.log('データ取得成功:', data.recommended_foods.length, '件');
            recommendedFoods = data.recommended_foods;
        }

        filteredFoods = [...recommendedFoods];
        displayFoods();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        showError(`データの読み込みに失敗しました: ${error.message}`);
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    document.getElementById('categoryFilter').addEventListener('change', filterFoods);
    document.getElementById('priceFilter').addEventListener('change', filterFoods);
    document.getElementById('ratingFilter').addEventListener('change', filterFoods);
}

// 食材の表示
function displayFoods() {
    console.log('displayFoods実行開始');
    const grid = document.getElementById('foodsGrid');

    if (!grid) {
        console.error('foodsGrid要素が見つかりません');
        return;
    }

    console.log('表示する食材数:', filteredFoods.length);

    if (filteredFoods.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>😥 該当する食材が見つかりませんでした</h3>
                <p>フィルター条件を変更してみてください。</p>
            </div>
        `;
        return;
    }

    try {
        const foodCards = filteredFoods.map((food, index) => {
            console.log(`食材カード作成中 ${index + 1}/${filteredFoods.length}:`, food.name);
            return createFoodCard(food);
        });

        grid.innerHTML = foodCards.join('');
        console.log('食材カード表示完了');
    } catch (error) {
        console.error('食材カード作成エラー:', error);
        grid.innerHTML = `
            <div class="error-message">
                <h3>😞 表示エラーが発生しました</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 食材カードの作成（簡潔版）
function createFoodCard(food) {
    const stars = '⭐'.repeat(food.rating);
    const imageUrl = getImageUrl(food.id);

    return `
        <div class="food-card-simple" data-category="${food.category}" data-price="${food.price_range}" data-rating="${food.rating}">
            <div class="food-image">
                <img src="${imageUrl}" alt="${food.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE1MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik03NSA0MEM4NSA0MCA5NSA0NSAxMDAgNTVDMTA1IDY1IDEwNSA3NSAxMDAgODVDOTUgOTUgODUgMTAwIDc1IDEwMEM2NSAxMDAgNTUgOTUgNTAgODVDNDUgNzUgNDUgNjUgNTAgNTVDNTUgNDUgNjUgNDAgNzUgNDBaIiBmaWxsPSIjOTk5OTk5Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+44K344Op44OA55S75ZOBPC90ZXh0Pgo8L3N2Zz4='"
                >
            </div>

            <div class="food-content">
                <div class="food-header-simple">
                    <h3>${food.name}</h3>
                    <span class="rating-simple">${stars}</span>
                </div>

                <div class="food-description-simple">
                    <p>${food.description}</p>
                </div>

                <div class="food-meta-simple">
                    <span class="category-badge-simple">${food.category}</span>
                    <span class="price-badge-simple ${food.price_range}">${food.price_range}</span>
                </div>

                <div class="nutrition-simple">
                    <div class="nutrition-item">
                        <span class="nutrition-label">タンパク質</span>
                        <span class="nutrition-value">${food.protein_per_100g}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">カロリー</span>
                        <span class="nutrition-value">${food.calories_per_100g}kcal</span>
                    </div>
                </div>

                <div class="food-actions-simple">
                    <button class="btn-detail" onclick="showFoodDetail('${food.id}')">
                        詳細を見る
                    </button>
                    <button class="btn-add" onclick="addToPlanner('${food.id}')">
                        プランに追加
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 食材画像URLを取得
function getImageUrl(foodId) {
    const imageMap = {
        'chicken_breast_super': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
        'salmon_omega3': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop',
        'eggs_complete': 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=300&h=200&fit=crop',
        'greek_yogurt_pro': 'https://images.unsplash.com/photo-1571212515010-7ad32e4b6f67?w=300&h=200&fit=crop',
        'tuna_can_mercury_safe': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop',
        'tofu_isoflavone': 'https://images.unsplash.com/photo-1583164318096-56a22b5dd33f?w=300&h=200&fit=crop',
        'natto_vitamin_k2': 'https://images.unsplash.com/photo-1620196635673-635d5d47d9e4?w=300&h=200&fit=crop',
        'almonds_vitamin_e': 'https://images.unsplash.com/photo-1628437228851-7c82412e7c5a?w=300&h=200&fit=crop',
        'quinoa_complete_protein': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=200&fit=crop',
        'cottage_cheese_casein': 'https://images.unsplash.com/photo-1571212515010-7ad32e4b6f67?w=300&h=200&fit=crop',
        'shiitake_mushroom': 'https://images.unsplash.com/photo-1518864677427-d2e8c0e65ac6?w=300&h=200&fit=crop',
        'maitake_mushroom': 'https://images.unsplash.com/photo-1518864677427-d2e8c0e65ac6?w=300&h=200&fit=crop',
        'wakame_seaweed': 'https://images.unsplash.com/photo-1516484535921-eea47d2fa222?w=300&h=200&fit=crop',
        'kombu_seaweed': 'https://images.unsplash.com/photo-1516484535921-eea47d2fa222?w=300&h=200&fit=crop',
        'broccoli_super': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&h=200&fit=crop',
        'spinach_iron': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop',
        'kimchi_fermented': 'https://images.unsplash.com/photo-1580731876531-83dd05160dfe?w=300&h=200&fit=crop',
        'miso_fermented': 'https://images.unsplash.com/photo-1524593689594-aae2f26b75ab?w=300&h=200&fit=crop',
        'brown_rice': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop',
        'blueberry_antioxidant': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=200&fit=crop',
        'mackerel_omega3': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop',
        'ginger_metabolism': 'https://images.unsplash.com/photo-1565802922634-bb9aeb3b3c65?w=300&h=200&fit=crop',
        'garlic_allicin': 'https://images.unsplash.com/photo-1602962670532-0042ffa58bec?w=300&h=200&fit=crop',
        'sweet_potato_lowgi': 'https://images.unsplash.com/photo-1629132334083-cdfdf8ffe19b?w=300&h=200&fit=crop',
        'chia_seeds': 'https://images.unsplash.com/photo-1469181593087-e0d7c0b95cd0?w=300&h=200&fit=crop',
        'okra_mucilage': 'https://images.unsplash.com/photo-1594482123205-52cd7fb2fe58?w=300&h=200&fit=crop',
        'olive_oil_extra_virgin': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop'
    };

    return imageMap[foodId] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNTAgNzBDMTcwIDcwIDE5MCA4MCAyMDAgMTAwQzIxMCAxMjAgMjEwIDE0MCAyMDAgMTYwQzE5MCAxODAgMTcwIDE5MCAxNTAgMTkwQzEzMCAxOTAgMTEwIDE4MCAxMDAgMTYwQzkwIDE0MCA5MCAxMjAgMTAwIDEwMEMxMTAgODAgMTMwIDcwIDE1MCA3MFoiIGZpbGw9IiM5OTk5OTkiLz4KPHR1ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWjveadkOeUu+WDPC90ZXh0Pgo8L3N2Zz4=';
}

// 食材詳細表示
function showFoodDetail(foodId) {
    const food = recommendedFoods.find(f => f.id === foodId);
    if (!food) return;

    const vitaminsHtml = Object.entries(food.vitamins)
        .map(([vitamin, level]) => `<span class="nutrient-tag ${level}">${vitamin}</span>`)
        .join('');

    const mineralsHtml = Object.entries(food.minerals)
        .map(([mineral, level]) => `<span class="nutrient-tag ${level}">${mineral}</span>`)
        .join('');

    const benefitsHtml = food.benefits
        .map(benefit => `<li>✓ ${benefit}</li>`)
        .join('');

    const cookingTipsHtml = food.cooking_tips
        .map(tip => `<li>💡 ${tip}</li>`)
        .join('');

    const imageUrl = getImageUrl(food.id);
    const stars = '⭐'.repeat(food.rating);

    const modal = document.createElement('div');
    modal.className = 'food-detail-modal';
    modal.innerHTML = `
        <div class="modal-content-detail">
            <div class="modal-header-detail">
                <button class="close-btn-detail" onclick="closeFoodDetail()">&times;</button>
            </div>

            <div class="food-detail-content">
                <div class="food-detail-image">
                    <img src="${imageUrl}" alt="${food.name}">
                </div>

                <div class="food-detail-info">
                    <div class="food-detail-header">
                        <h2>${food.name}</h2>
                        <div class="food-detail-meta">
                            <span class="category-badge">${food.category}</span>
                            <span class="price-badge ${food.price_range}">${food.price_range}</span>
                            <span class="rating">${stars}</span>
                        </div>
                    </div>

                    <div class="food-detail-description">
                        <p>${food.description}</p>
                    </div>

                    <div class="nutrition-detail">
                        <h3>📊 栄養成分（100gあたり）</h3>
                        <div class="nutrition-grid">
                            <div class="nutrition-item-detail">
                                <span class="label">タンパク質</span>
                                <span class="value">${food.protein_per_100g}g</span>
                            </div>
                            <div class="nutrition-item-detail">
                                <span class="label">炭水化物</span>
                                <span class="value">${food.carbs_per_100g}g</span>
                            </div>
                            <div class="nutrition-item-detail">
                                <span class="label">脂質</span>
                                <span class="value">${food.fat_per_100g}g</span>
                            </div>
                            <div class="nutrition-item-detail">
                                <span class="label">カロリー</span>
                                <span class="value">${food.calories_per_100g}kcal</span>
                            </div>
                        </div>
                        <div class="serving-info-detail">
                            <p>📏 ${food.serving_size} : タンパク質 ${food.protein_per_serving}g</p>
                        </div>
                    </div>

                    <div class="nutrients-detail">
                        <div class="nutrients-group-detail">
                            <h4>🧪 ビタミン</h4>
                            <div class="nutrients-tags">${vitaminsHtml}</div>
                        </div>
                        <div class="nutrients-group-detail">
                            <h4>⚛️ ミネラル</h4>
                            <div class="nutrients-tags">${mineralsHtml}</div>
                        </div>
                    </div>

                    <div class="benefits-detail">
                        <h4>💪 健康効果</h4>
                        <ul class="benefits-list">${benefitsHtml}</ul>
                    </div>

                    <div class="cooking-detail">
                        <h4>👨‍🍳 調理のコツ</h4>
                        <ul class="cooking-tips">${cookingTipsHtml}</ul>
                    </div>

                    <div class="detail-actions">
                        <button class="btn-primary" onclick="addToPlanner('${food.id}')">
                            📊 プランナーに追加
                        </button>
                        <button class="btn-secondary" onclick="showNutritionChart('${food.id}')">
                            📈 栄養チャート
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// 詳細モーダルを閉じる
function closeFoodDetail() {
    const modal = document.querySelector('.food-detail-modal');
    if (modal) {
        modal.remove();
    }
}

// フィルタリング機能
function filterFoods() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;

    filteredFoods = recommendedFoods.filter(food => {
        const categoryMatch = !categoryFilter || food.category === categoryFilter;
        const priceMatch = !priceFilter || food.price_range === priceFilter;
        const ratingMatch = !ratingFilter || food.rating >= parseInt(ratingFilter);

        return categoryMatch && priceMatch && ratingMatch;
    });

    displayFoods();
}

// プランナーに追加（将来的にplanner.jsと連携）
function addToPlanner(foodId) {
    const food = recommendedFoods.find(f => f.id === foodId);
    if (food) {
        // LocalStorageに一時保存
        const savedFood = {
            id: food.id,
            name: food.name,
            protein_per_serving: food.protein_per_serving,
            serving_size: food.serving_size,
            emoji: food.emoji
        };

        let savedFoods = JSON.parse(localStorage.getItem('plannerFoods') || '[]');
        savedFoods.push(savedFood);
        localStorage.setItem('plannerFoods', JSON.stringify(savedFoods));

        showNotification(`${food.emoji} ${food.name}をプランナーに追加しました！`, 'success');
    }
}

// 栄養チャート表示
function showNutritionChart(foodId) {
    const food = recommendedFoods.find(f => f.id === foodId);
    if (!food) return;

    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'nutrition-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${food.emoji} ${food.name} の栄養チャート</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <canvas id="nutritionChart" width="400" height="400"></canvas>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color protein"></span>
                        <span>タンパク質: ${food.protein_per_100g}g</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color carbs"></span>
                        <span>炭水化物: ${food.carbs_per_100g}g</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color fat"></span>
                        <span>脂質: ${food.fat_per_100g}g</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // チャートを描画
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['タンパク質', '炭水化物', '脂質'],
            datasets: [{
                data: [
                    food.protein_per_100g * 4, // タンパク質のカロリー
                    food.carbs_per_100g * 4,   // 炭水化物のカロリー
                    food.fat_per_100g * 9      // 脂質のカロリー
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // タンパク質 - 青
                    'rgba(16, 185, 129, 0.8)',  // 炭水化物 - 緑
                    'rgba(245, 158, 11, 0.8)'   // 脂質 - 黄
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'カロリー構成比 (100gあたり)'
                }
            }
        }
    });
}

// モーダルを閉じる
function closeModal() {
    const modal = document.querySelector('.nutrition-modal');
    if (modal) {
        modal.remove();
    }
}

// 通知表示
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// エラー表示
function showError(message) {
    const grid = document.getElementById('foodsGrid');
    grid.innerHTML = `
        <div class="error-message">
            <h3>😞 エラーが発生しました</h3>
            <p>${message}</p>
            <button onclick="loadRecommendedFoods()" class="btn-primary">再読み込み</button>
        </div>
    `;
}