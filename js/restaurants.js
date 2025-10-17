// チェーン店メニュー管理システム

let restaurantsData = [];
let menusData = [];
let filteredMenus = [];
let currentMenu = null;
let favoritesMenus = JSON.parse(localStorage.getItem('favoriteMenus') || '[]');

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadRestaurantData();
    setupEventListeners();
    setupViewToggle();
});

// レストランデータの読み込み
async function loadRestaurantData() {
    console.log('レストランデータ読み込み開始');
    const grid = document.getElementById('menusGrid');

    if (!grid) {
        console.error('menusGrid要素が見つかりません');
        return;
    }

    // ローディング表示
    grid.innerHTML = '<div class="loading">データを読み込み中</div>';

    try {
        // 埋め込みデータを使用（確実な動作のため）
        console.log('埋め込みデータを使用中...');

        if (!RESTAURANT_DATA || !RESTAURANT_DATA.restaurants || !RESTAURANT_DATA.menus) {
            throw new Error('埋め込みデータが見つかりません');
        }

        restaurantsData = RESTAURANT_DATA.restaurants;
        menusData = RESTAURANT_DATA.menus;

        // データをlocalStorageに保存
        saveRestaurantData();

        console.log('データ取得成功:', menusData.length, '件のメニュー');
        console.log('レストランデータ:', restaurantsData);
        console.log('メニューデータ:', menusData);
        filteredMenus = [...menusData];

        // UI更新
        populateRestaurantFilter();
        displayMenus();
        updateStatistics();
        createNutritionChart();

    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        showError(`データの読み込みに失敗しました: ${error.message}`);
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // 検索とフィルター
    document.getElementById('searchMenu').addEventListener('input', filterMenus);
    document.getElementById('restaurantFilter').addEventListener('change', filterMenus);
    document.getElementById('categoryFilter').addEventListener('change', filterMenus);
    document.getElementById('proteinFilter').addEventListener('change', filterMenus);
    document.getElementById('calorieFilter').addEventListener('change', filterMenus);
    document.getElementById('dietaryFilter').addEventListener('change', filterMenus);
    document.getElementById('sortBy').addEventListener('change', sortAndDisplayMenus);
}

// 表示切り替えの設定
function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridView');
    const tableViewBtn = document.getElementById('tableView');
    const menusGrid = document.getElementById('menusGrid');
    const menusTable = document.getElementById('menusTable');

    gridViewBtn.addEventListener('click', function() {
        gridViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        menusGrid.style.display = 'grid';
        menusTable.style.display = 'none';
    });

    tableViewBtn.addEventListener('click', function() {
        tableViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        menusGrid.style.display = 'none';
        menusTable.style.display = 'block';
        displayMenusTable();
    });
}

// レストランフィルターの設定
function populateRestaurantFilter() {
    const select = document.getElementById('restaurantFilter');

    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    restaurantsData.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.id;
        option.textContent = restaurant.name;
        select.appendChild(option);
    });
}

// メニューのフィルタリング
function filterMenus() {
    const searchTerm = document.getElementById('searchMenu').value.toLowerCase();
    const restaurantFilter = document.getElementById('restaurantFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const proteinFilter = document.getElementById('proteinFilter').value;
    const calorieFilter = document.getElementById('calorieFilter').value;
    const dietaryFilter = document.getElementById('dietaryFilter').value;

    filteredMenus = menusData.filter(menu => {
        // 検索フィルター
        const matchesSearch = !searchTerm ||
            menu.name.toLowerCase().includes(searchTerm) ||
            menu.description.toLowerCase().includes(searchTerm);

        // レストランフィルター
        const matchesRestaurant = !restaurantFilter || menu.restaurant_id === restaurantFilter;

        // カテゴリーフィルター
        const matchesCategory = !categoryFilter || menu.category === categoryFilter;

        // タンパク質フィルター
        let matchesProtein = true;
        if (proteinFilter === 'high') {
            matchesProtein = menu.nutrition.protein >= 20;
        } else if (proteinFilter === 'medium') {
            matchesProtein = menu.nutrition.protein >= 10 && menu.nutrition.protein < 20;
        } else if (proteinFilter === 'low') {
            matchesProtein = menu.nutrition.protein < 10;
        }

        // カロリーフィルター
        let matchesCalorie = true;
        if (calorieFilter === 'low') {
            matchesCalorie = menu.nutrition.calories < 300;
        } else if (calorieFilter === 'medium') {
            matchesCalorie = menu.nutrition.calories >= 300 && menu.nutrition.calories < 500;
        } else if (calorieFilter === 'high') {
            matchesCalorie = menu.nutrition.calories >= 500;
        }

        // 食事制限フィルター
        let matchesDietary = true;
        if (dietaryFilter === 'vegetarian') {
            matchesDietary = menu.is_vegetarian;
        } else if (dietaryFilter === 'vegan') {
            matchesDietary = menu.is_vegan;
        } else if (dietaryFilter === 'gluten_free') {
            matchesDietary = menu.is_gluten_free;
        }

        return matchesSearch && matchesRestaurant && matchesCategory &&
               matchesProtein && matchesCalorie && matchesDietary;
    });

    sortAndDisplayMenus();
}

// ソートして表示
function sortAndDisplayMenus() {
    const sortBy = document.getElementById('sortBy').value;

    filteredMenus.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'protein_desc':
                return b.nutrition.protein - a.nutrition.protein;
            case 'protein_asc':
                return a.nutrition.protein - b.nutrition.protein;
            case 'calories_desc':
                return b.nutrition.calories - a.nutrition.calories;
            case 'calories_asc':
                return a.nutrition.calories - b.nutrition.calories;
            case 'price_desc':
                return b.price - a.price;
            case 'price_asc':
                return a.price - b.price;
            case 'updated':
                return new Date(b.last_updated) - new Date(a.last_updated);
            default:
                return 0;
        }
    });

    displayMenus();
}

// メニューの表示（グリッド）
function displayMenus() {
    console.log('displayMenus called with', filteredMenus.length, 'menus');
    const grid = document.getElementById('menusGrid');

    if (!grid) {
        console.error('menusGrid element not found');
        return;
    }

    grid.innerHTML = '';

    if (filteredMenus.length === 0) {
        console.log('No filtered menus to display');
        grid.innerHTML = `
            <div class="empty-state">
                <h3>🔍 該当するメニューが見つかりません</h3>
                <p>検索条件を変更してお試しください</p>
            </div>
        `;
        return;
    }

    filteredMenus.forEach(menu => {
        console.log('Creating card for menu:', menu.name);
        const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);
        if (!restaurant) {
            console.error('Restaurant not found for menu:', menu.restaurant_id);
            return;
        }
        const card = createMenuCard(menu, restaurant);
        grid.appendChild(card);
    });
    console.log('Finished displaying menus');
}

// メニューカードの作成
function createMenuCard(menu, restaurant) {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.onclick = () => showMenuDetail(menu.id);

    const tags = [];
    if (menu.is_vegetarian) tags.push('<span class="menu-tag vegetarian">ベジタリアン</span>');
    if (menu.is_vegan) tags.push('<span class="menu-tag vegan">ヴィーガン</span>');
    if (menu.is_gluten_free) tags.push('<span class="menu-tag gluten-free">グルテンフリー</span>');

    card.innerHTML = `
        <img src="${menu.image}" alt="${menu.name}" class="menu-card-image"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDM1MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNzUgNzBDMTg1IDcwIDE5NSA3NSAyMDAgODVDMjA1IDk1IDIwNSAxMDUgMjAwIDExNUMxOTUgMTI1IDE4NSAxMzAgMTc1IDEzMEMxNjUgMTMwIDE1NSAxMjUgMTUwIDExNUMxNDUgMTA1IDE0NSA5NSAxNTAgODVDMTU1IDc1IDE2NSA3MCAxNzUgNzBaIiBmaWxsPSIjOTk5OTk5Ii8+Cjx0ZXh0IHg9IjE3NSIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuODoeODi+ODpeODvOeUu+WDjzwvdGV4dD4KPC9zdmc+'"
            >
        <div class="menu-card-content">
            <div class="restaurant-badge">
                <img src="${restaurant.logo}" alt="${restaurant.name}" class="restaurant-logo-small"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+qPC90ZXh0Pgo8L3N2Zz4='"
                >
                <span>${restaurant.name}</span>
            </div>
            <h3>${menu.name}</h3>
            <p class="menu-description">${menu.description}</p>
            <div class="menu-price-category">
                <span class="menu-price">¥${menu.price.toLocaleString()}</span>
                <span class="menu-category">${menu.category}</span>
            </div>
            <div class="nutrition-summary">
                <div class="nutrition-item-card">
                    <span class="label">カロリー</span>
                    <span class="value">${menu.nutrition.calories}kcal</span>
                </div>
                <div class="nutrition-item-card">
                    <span class="label">タンパク質</span>
                    <span class="value">${menu.nutrition.protein}g</span>
                </div>
                <div class="nutrition-item-card">
                    <span class="label">炭水化物</span>
                    <span class="value">${menu.nutrition.carbs}g</span>
                </div>
            </div>
            <div class="menu-tags">
                ${tags.join('')}
            </div>
        </div>
    `;

    return card;
}

// メニュー表示（テーブル）
function displayMenusTable() {
    const tbody = document.getElementById('menusTableBody');
    tbody.innerHTML = '';

    filteredMenus.forEach(menu => {
        const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);
        const row = createMenuTableRow(menu, restaurant);
        tbody.appendChild(row);
    });
}

// テーブル行の作成
function createMenuTableRow(menu, restaurant) {
    const row = document.createElement('tr');
    row.onclick = () => showMenuDetail(menu.id);
    row.style.cursor = 'pointer';

    const dietary = [];
    if (menu.is_vegetarian) dietary.push('🌱');
    if (menu.is_vegan) dietary.push('🌿');
    if (menu.is_gluten_free) dietary.push('🌾');

    row.innerHTML = `
        <td class="restaurant-cell">
            <img src="${restaurant.logo}" alt="${restaurant.name}"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+qPC90ZXh0Pgo8L3N2Zz4='"
            >
            <span>${restaurant.name}</span>
        </td>
        <td>${menu.name}</td>
        <td>${menu.category}</td>
        <td>¥${menu.price.toLocaleString()}</td>
        <td>${menu.nutrition.calories}kcal</td>
        <td>${menu.nutrition.protein}g</td>
        <td>${menu.nutrition.carbs}g</td>
        <td>${menu.nutrition.fat}g</td>
        <td>${menu.nutrition.fiber}g</td>
        <td>${dietary.join(' ')}</td>
    `;

    return row;
}

// 統計情報の更新
function updateStatistics() {
    const restaurantCount = restaurantsData.length;
    const menuCount = menusData.length;
    const avgProtein = (menusData.reduce((sum, menu) => sum + menu.nutrition.protein, 0) / menuCount).toFixed(1);
    const avgCalories = Math.round(menusData.reduce((sum, menu) => sum + menu.nutrition.calories, 0) / menuCount);

    document.getElementById('restaurantCount').textContent = `${restaurantCount}店舗`;
    document.getElementById('menuCount').textContent = `${menuCount}品目`;
    document.getElementById('avgProtein').textContent = `${avgProtein}g`;
    document.getElementById('avgCalories').textContent = `${avgCalories}kcal`;
}

// 栄養分析チャートの作成
function createNutritionChart() {
    const ctx = document.getElementById('nutritionChart').getContext('2d');

    // カテゴリー別平均栄養素
    const categories = [...new Set(menusData.map(menu => menu.category))];
    const categoryData = categories.map(category => {
        const categoryMenus = menusData.filter(menu => menu.category === category);
        const avgProtein = categoryMenus.reduce((sum, menu) => sum + menu.nutrition.protein, 0) / categoryMenus.length;
        const avgCarbs = categoryMenus.reduce((sum, menu) => sum + menu.nutrition.carbs, 0) / categoryMenus.length;
        const avgFat = categoryMenus.reduce((sum, menu) => sum + menu.nutrition.fat, 0) / categoryMenus.length;

        return { category, avgProtein, avgCarbs, avgFat };
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'タンパク質 (g)',
                    data: categoryData.map(item => item.avgProtein.toFixed(1)),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '炭水化物 (g)',
                    data: categoryData.map(item => item.avgCarbs.toFixed(1)),
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: '脂質 (g)',
                    data: categoryData.map(item => item.avgFat.toFixed(1)),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '栄養素量 (g)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'メニューカテゴリー'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'カテゴリー別平均栄養素含有量'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// メニュー詳細モーダルの表示
function showMenuDetail(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);

    if (!menu || !restaurant) return;

    currentMenu = menu;

    // 基本情報の設定
    document.getElementById('menuModalTitle').textContent = menu.name;
    document.getElementById('menuDetailImage').src = menu.image;
    document.getElementById('restaurantLogo').src = restaurant.logo;
    document.getElementById('restaurantName').textContent = restaurant.name;
    document.getElementById('restaurantCategory').textContent = restaurant.category;
    document.getElementById('menuDetailName').textContent = menu.name;
    document.getElementById('menuDetailDescription').textContent = menu.description;
    document.getElementById('menuDetailPrice').textContent = `¥${menu.price.toLocaleString()}`;
    document.getElementById('menuDetailSize').textContent = menu.size;

    // 栄養情報の設定
    document.getElementById('detailCalories').textContent = `${menu.nutrition.calories}kcal`;
    document.getElementById('detailProtein').textContent = `${menu.nutrition.protein}g`;
    document.getElementById('detailCarbs').textContent = `${menu.nutrition.carbs}g`;
    document.getElementById('detailFat').textContent = `${menu.nutrition.fat}g`;

    // 詳細栄養情報の設定
    populateDetailedNutrition(menu);

    // 日本の食事摂取基準に基づく日次摂取量計算
    calculateDailyValues(menu);

    // 食事制限タグの設定
    const dietaryTags = document.getElementById('dietaryTags');
    dietaryTags.innerHTML = '';
    if (menu.is_vegetarian) {
        dietaryTags.innerHTML += '<span class="dietary-tag">ベジタリアン対応</span>';
    }
    if (menu.is_vegan) {
        dietaryTags.innerHTML += '<span class="dietary-tag">ヴィーガン対応</span>';
    }
    if (menu.is_gluten_free) {
        dietaryTags.innerHTML += '<span class="dietary-tag">グルテンフリー</span>';
    }

    // アレルギー情報の設定
    const allergenList = document.getElementById('allergenList');
    allergenList.innerHTML = '';
    if (menu.allergens && menu.allergens.length > 0) {
        menu.allergens.forEach(allergen => {
            allergenList.innerHTML += `<span class="allergen-tag">${allergen}</span>`;
        });
    } else {
        allergenList.innerHTML = '<span style="color: #666;">アレルギー情報なし</span>';
    }

    // 個別栄養チャートの作成
    createMenuNutritionChart(menu);

    // チャートは後でタイムアウトで作成

    // モーダル表示
    document.getElementById('menuModal').style.display = 'block';

    // モーダルが表示された後にチャートを作成（DOMが準備できてから）
    setTimeout(() => {
        createDetailedNutritionChart(menu);
        createDailyValueChart(menu);
    }, 100);
}

// 個別メニューの栄養チャート
function createMenuNutritionChart(menu) {
    const ctx = document.getElementById('menuNutritionChart').getContext('2d');

    // 既存のチャートがあれば破棄
    if (window.menuChart) {
        window.menuChart.destroy();
    }

    window.menuChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['タンパク質', '炭水化物', '脂質'],
            datasets: [{
                data: [
                    menu.nutrition.protein * 4, // タンパク質のカロリー
                    menu.nutrition.carbs * 4,   // 炭水化物のカロリー
                    menu.nutrition.fat * 9      // 脂質のカロリー
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'PFCバランス（カロリー比）'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

// メニュー詳細モーダルを閉じる
function closeMenuModal() {
    document.getElementById('menuModal').style.display = 'none';
    if (window.menuChart) {
        window.menuChart.destroy();
        window.menuChart = null;
    }
    if (window.detailedNutritionChart) {
        window.detailedNutritionChart.destroy();
        window.detailedNutritionChart = null;
    }
    if (window.dailyValueChart) {
        window.dailyValueChart.destroy();
        window.dailyValueChart = null;
    }
}

// お気に入りに追加
function addToFavorites() {
    if (!currentMenu) return;

    if (!favoritesMenus.includes(currentMenu.id)) {
        favoritesMenus.push(currentMenu.id);
        localStorage.setItem('favoriteMenus', JSON.stringify(favoritesMenus));
        alert('お気に入りに追加しました！');
    } else {
        alert('すでにお気に入りに追加されています');
    }
}

// プランに追加
function addToPlan() {
    if (!currentMenu) return;

    // プランナーページで使用するため、localStorageに保存
    const planItems = JSON.parse(localStorage.getItem('planItems') || '[]');
    const planItem = {
        id: currentMenu.id,
        name: currentMenu.name,
        type: 'restaurant_menu',
        restaurant: restaurantsData.find(r => r.id === currentMenu.restaurant_id).name,
        protein: currentMenu.nutrition.protein,
        calories: currentMenu.nutrition.calories,
        carbs: currentMenu.nutrition.carbs,
        fat: currentMenu.nutrition.fat,
        amount: 1
    };

    planItems.push(planItem);
    localStorage.setItem('planItems', JSON.stringify(planItems));
    alert('プランに追加しました！プラン作成ページでご確認ください。');
}

// データの保存
function saveRestaurantData() {
    const data = {
        restaurants: restaurantsData,
        menus: menusData,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('restaurantData', JSON.stringify(data));
}

// エラー表示
function showError(message) {
    const grid = document.getElementById('menusGrid');
    grid.innerHTML = `
        <div class="error">
            <h3>❌ エラーが発生しました</h3>
            <p>${message}</p>
        </div>
    `;
}

// 詳細栄養情報の設定
function populateDetailedNutrition(menu) {
    const nutrition = menu.nutrition;

    // 基本栄養素（既に設定済み）
    document.getElementById('detailFiber').textContent = `${nutrition.fiber || 0}g`;
    document.getElementById('detailSodium').textContent = `${nutrition.sodium || 0}mg`;

    // 糖分と脂質詳細
    document.getElementById('detailSugar').textContent = `${nutrition.sugar || 0}g`;
    document.getElementById('detailSaturatedFat').textContent = `${nutrition.saturated_fat || 0}g`;
    document.getElementById('detailTransFat').textContent = `${nutrition.trans_fat || 0}g`;
    document.getElementById('detailCholesterol').textContent = `${nutrition.cholesterol || 0}mg`;

    // ミネラル
    document.getElementById('detailCalcium').textContent = `${nutrition.calcium || 0}mg`;
    document.getElementById('detailIron').textContent = `${nutrition.iron || 0}mg`;
    document.getElementById('detailPotassium').textContent = `${nutrition.potassium || 0}mg`;
    document.getElementById('detailPhosphorus').textContent = `${nutrition.phosphorus || 0}mg`;
    document.getElementById('detailMagnesium').textContent = `${nutrition.magnesium || 0}mg`;
    document.getElementById('detailZinc').textContent = `${nutrition.zinc || 0}mg`;
    document.getElementById('detailSelenium').textContent = `${nutrition.selenium || 0}μg`;

    // ビタミン
    document.getElementById('detailVitaminA').textContent = `${nutrition.vitamin_a || 0}μg`;
    document.getElementById('detailVitaminC').textContent = `${nutrition.vitamin_c || 0}mg`;
    document.getElementById('detailVitaminD').textContent = `${nutrition.vitamin_d || 0}μg`;
    document.getElementById('detailVitaminE').textContent = `${nutrition.vitamin_e || 0}mg`;
    document.getElementById('detailVitaminK').textContent = `${nutrition.vitamin_k || 0}μg`;
    document.getElementById('detailThiamin').textContent = `${nutrition.thiamin || 0}mg`;
    document.getElementById('detailRiboflavin').textContent = `${nutrition.riboflavin || 0}mg`;
    document.getElementById('detailNiacin').textContent = `${nutrition.niacin || 0}mg`;
    document.getElementById('detailVitaminB6').textContent = `${nutrition.vitamin_b6 || 0}mg`;
    document.getElementById('detailFolate').textContent = `${nutrition.folate || 0}μg`;
    document.getElementById('detailVitaminB12').textContent = `${nutrition.vitamin_b12 || 0}μg`;
}

// 日次摂取量の計算（日本の食事摂取基準に基づく）
function calculateDailyValues(menu) {
    const nutrition = menu.nutrition;

    // 成人男性（30-49歳）の推奨量を基準
    const dailyValues = {
        calories: 2650,
        protein: 65,
        fat: 74,
        carbs: 396,
        fiber: 21,
        sodium: 2700,
        calcium: 750,
        iron: 7.5,
        vitamin_c: 100,
        vitamin_a: 900
    };

    // パーセンテージ計算
    const percentages = {
        calories: (nutrition.calories / dailyValues.calories * 100).toFixed(1),
        protein: (nutrition.protein / dailyValues.protein * 100).toFixed(1),
        fat: (nutrition.fat / dailyValues.fat * 100).toFixed(1),
        carbs: (nutrition.carbs / dailyValues.carbs * 100).toFixed(1),
        fiber: ((nutrition.fiber || 0) / dailyValues.fiber * 100).toFixed(1),
        sodium: ((nutrition.sodium || 0) / dailyValues.sodium * 100).toFixed(1),
        calcium: ((nutrition.calcium || 0) / dailyValues.calcium * 100).toFixed(1),
        iron: ((nutrition.iron || 0) / dailyValues.iron * 100).toFixed(1),
        vitamin_c: ((nutrition.vitamin_c || 0) / dailyValues.vitamin_c * 100).toFixed(1),
        vitamin_a: ((nutrition.vitamin_a || 0) / dailyValues.vitamin_a * 100).toFixed(1)
    };

    // パーセンテージ表示
    const safeSetElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    safeSetElement('dvCalories', `${percentages.calories}%`);
    safeSetElement('dvProtein', `${percentages.protein}%`);
    safeSetElement('dvFat', `${percentages.fat}%`);
    safeSetElement('dvCarbs', `${percentages.carbs}%`);
    safeSetElement('dvFiber', `${percentages.fiber}%`);
    safeSetElement('dvSodium', `${percentages.sodium}%`);
    safeSetElement('calciumDV', `${percentages.calcium}%`);
    safeSetElement('ironDV', `${percentages.iron}%`);
    safeSetElement('vitaminCDV', `${percentages.vitamin_c}%`);
    safeSetElement('vitaminADV', `${percentages.vitamin_a}%`);

    // 追加のビタミン・ミネラルパーセンテージ
    safeSetElement('vitaminDDV', `${((nutrition.vitamin_d || 0) / 8.5 * 100).toFixed(1)}%`);
    safeSetElement('vitaminEDV', `${((nutrition.vitamin_e || 0) / 6.5 * 100).toFixed(1)}%`);
    safeSetElement('vitaminKDV', `${((nutrition.vitamin_k || 0) / 150 * 100).toFixed(1)}%`);
    safeSetElement('thiaminDV', `${((nutrition.thiamin || 0) / 1.4 * 100).toFixed(1)}%`);
    safeSetElement('riboflavinDV', `${((nutrition.riboflavin || 0) / 1.6 * 100).toFixed(1)}%`);
    safeSetElement('niacinDV', `${((nutrition.niacin || 0) / 15 * 100).toFixed(1)}%`);
    safeSetElement('vitaminB6DV', `${((nutrition.vitamin_b6 || 0) / 1.4 * 100).toFixed(1)}%`);
    safeSetElement('folateDV', `${((nutrition.folate || 0) / 240 * 100).toFixed(1)}%`);
    safeSetElement('vitaminB12DV', `${((nutrition.vitamin_b12 || 0) / 2.4 * 100).toFixed(1)}%`);
    safeSetElement('potassiumDV', `${((nutrition.potassium || 0) / 3000 * 100).toFixed(1)}%`);
    safeSetElement('phosphorusDV', `${((nutrition.phosphorus || 0) / 1000 * 100).toFixed(1)}%`);
    safeSetElement('magnesiumDV', `${((nutrition.magnesium || 0) / 370 * 100).toFixed(1)}%`);
    safeSetElement('zincDV', `${((nutrition.zinc || 0) / 11 * 100).toFixed(1)}%`);
    safeSetElement('seleniumDV', `${((nutrition.selenium || 0) / 30 * 100).toFixed(1)}%`);
}

// 詳細栄養チャート（ビタミン・ミネラル）
function createDetailedNutritionChart(menu) {
    console.log('Creating detailed nutrition chart for:', menu.name);
    const canvas = document.getElementById('detailedNutritionChart');
    if (!canvas) {
        console.error('detailedNutritionChart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');

    if (window.detailedNutritionChart) {
        window.detailedNutritionChart.destroy();
    }

    const nutrition = menu.nutrition;

    window.detailedNutritionChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['ビタミンA', 'ビタミンC', 'ビタミンE', 'カルシウム', '鉄', 'マグネシウム', '亜鉛'],
            datasets: [{
                label: '栄養素含有量（%DV）',
                data: [
                    ((nutrition.vitamin_a || 0) / 900 * 100),
                    ((nutrition.vitamin_c || 0) / 100 * 100),
                    ((nutrition.vitamin_e || 0) / 6.5 * 100),
                    ((nutrition.calcium || 0) / 750 * 100),
                    ((nutrition.iron || 0) / 7.5 * 100),
                    ((nutrition.magnesium || 0) / 370 * 100),
                    ((nutrition.zinc || 0) / 11 * 100)
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'ビタミン・ミネラル含有量（日次摂取基準比）'
                }
            }
        }
    });
}

// 日次摂取量比較チャート
function createDailyValueChart(menu) {
    console.log('Creating daily value chart for:', menu.name);
    const canvas = document.getElementById('dailyValueChart');
    if (!canvas) {
        console.error('dailyValueChart canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');

    if (window.dailyValueChart) {
        window.dailyValueChart.destroy();
    }

    const nutrition = menu.nutrition;

    // 主要栄養素の日次摂取量パーセンテージ
    const dailyPercentages = [
        (nutrition.calories / 2650 * 100),
        (nutrition.protein / 65 * 100),
        (nutrition.fat / 74 * 100),
        (nutrition.carbs / 396 * 100),
        ((nutrition.fiber || 0) / 21 * 100),
        ((nutrition.sodium || 0) / 2700 * 100)
    ];

    window.dailyValueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['カロリー', 'タンパク質', '脂質', '炭水化物', '食物繊維', 'ナトリウム'],
            datasets: [{
                label: '日次摂取基準に対する割合（%）',
                data: dailyPercentages,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: '日次摂取基準に対する割合（%）'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '主要栄養素の日次摂取基準比較'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// モーダルのクリックイベント（外側クリックで閉じる）
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeMenuModal();
    }
});