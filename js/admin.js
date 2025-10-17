// 管理画面のJavaScript

// 現在編集中の食材ID
let editingFoodId = null;
let editingCategoryId = null;

// レストラン・メニューデータ
let restaurantsData = [];
let menusData = [];
let editingRestaurantId = null;
let editingMenuId = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // タブ切り替えの初期化
    initializeTabs();

    // 食材管理の初期化
    loadFoods();
    loadCategories();

    // レストラン・メニュー管理の初期化
    loadRestaurants();
    loadMenus();

    // フィルターイベントの設定
    setupFilters();

    // フォームイベントの設定
    setupForms();

    // ストレージ使用量の表示
    updateStorageUsage();

    // インポートファイルイベント
    document.getElementById('importFile').addEventListener('change', handleImportFile);
});

// タブ切り替えの初期化
function initializeTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // アクティブクラスの削除
            navLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // 新しいタブをアクティブに
            this.classList.add('active');
            const targetTab = document.getElementById('tab-' + this.dataset.tab);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// 食材データの読み込み
async function loadFoods() {
    try {
        // まずlocalStorageから管理者が追加・編集した食材を読み込み
        const storedFoods = JSON.parse(localStorage.getItem('foodsData') || '{"foods": []}');

        // 元のJSONファイルから基本データを読み込み
        const response = await fetch('data/recommended-foods.json');
        const originalData = await response.json();
        const originalFoods = originalData.recommended_foods || [];

        // ストレージにデータがある場合はそれを使用、なければ元データを使用
        if (storedFoods.foods && storedFoods.foods.length > 0) {
            window.foodsData = storedFoods.foods;
        } else {
            // 元データを管理画面用の形式に変換
            window.foodsData = convertToAdminFormat(originalFoods);
            // 初回読み込み時は変換したデータをlocalStorageに保存
            saveFoodsToStorage();
        }

        displayFoods(window.foodsData);
        populateCategoryFilter();
    } catch (error) {
        console.error('食材データの読み込みエラー:', error);
        // エラー時はlocalStorageから読み込みを試行
        const storedFoods = JSON.parse(localStorage.getItem('foodsData') || '{"foods": []}');
        window.foodsData = storedFoods.foods || [];
        displayFoods(window.foodsData);
        populateCategoryFilter();
    }
}

// カテゴリーデータの読み込み
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    window.categoriesData = categories;
    displayCategories(categories);
    populateCategorySelects();
}

// 食材の表示
function displayFoods(foods) {
    const tbody = document.getElementById('foodsTableBody');
    tbody.innerHTML = '';

    foods.forEach(food => {
        const row = createFoodRow(food);
        tbody.appendChild(row);
    });
}

// 食材行の作成
function createFoodRow(food) {
    const row = document.createElement('tr');
    const imageUrl = getImageUrl(food.id) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAxNUMyNyAxNSAyOSAxNiAzMCAxOEMzMSAyMCAzMSAyMyAzMCAyNUMyOSAyNyAyNyAyOCAyNSAyOEMyMyAyOCAyMSAyNyAyMCAyNUMxOSAyMyAxOSAyMCAyMCAxOEMyMSAxNiAyMyAxNSAyNSAxNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHR1ZXh0IHg9IjI1IiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWjveadkDwvdGV4dD4KPC9zdmc+';

    row.innerHTML = `
        <td><img src="${imageUrl}" alt="${food.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAxNUMyNyAxNSAyOSAxNiAzMCAxOEMzMSAyMCAzMSAyMyAzMCAyNUMyOSAyNyAyNyAyOCAyNSAyOEMyMyAyOCAyMSAyNyAyMCAyNUMxOSAyMyAxOSAyMCAyMCAxOEMyMSAxNiAyMyAxNSAyNSAxNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHR1ZXh0IHg9IjI1IiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWjveadkDwvdGV4dD4KPC9zdmc+'"></td>
        <td>${food.name}</td>
        <td>${food.category}</td>
        <td>${food.proteinPer100g}g</td>
        <td>${'⭐'.repeat(food.rating)}</td>
        <td>${food.priceRange}</td>
        <td>
            <button class="btn-small" onclick="editFood('${food.id}')">編集</button>
            <button class="btn-small" style="background: #dc3545; margin-left: 0.5rem;" onclick="deleteFood('${food.id}')">削除</button>
        </td>
    `;

    return row;
}

// カテゴリーの表示
function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    categories.forEach(category => {
        const card = createCategoryCard(category);
        grid.appendChild(card);
    });
}

// カテゴリーカードの作成
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';

    card.innerHTML = `
        <h3>${category.emoji} ${category.name}</h3>
        <p>${category.description || '説明なし'}</p>
        <div class="category-actions">
            <button class="btn-small" onclick="editCategory('${category.id}')">編集</button>
            <button class="btn-small" style="background: #dc3545;" onclick="deleteCategory('${category.id}')">削除</button>
        </div>
    `;

    return card;
}

// 画像URLの取得（recommended.jsから）
function getImageUrl(foodId) {
    const imageMap = {
        'chicken_breast_super': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
        'salmon_omega3': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop',
        'eggs_complete': 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300&h=200&fit=crop',
        'tuna_convenient': 'https://images.unsplash.com/photo-1547741487-abd2d0bb4930?w=300&h=200&fit=crop',
        'mackerel_can': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop',
        'greek_yogurt_casein': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop',
        'tofu_plant': 'https://images.unsplash.com/photo-1520365609972-7e83f7f18bee?w=300&h=200&fit=crop',
        'lentils_fiber': 'https://images.unsplash.com/photo-1509428467422-7fa4ac3c38fa?w=300&h=200&fit=crop',
        'quinoa_complete': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
        'cottage_cheese_low': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
        'almonds_healthy': 'https://images.unsplash.com/photo-1508897409711-d2830ba28c36?w=300&h=200&fit=crop',
        'pumpkin_seeds': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=200&fit=crop',
        'shiitake_umami': 'https://images.unsplash.com/photo-1565281042-ad299c69fe8b?w=300&h=200&fit=crop',
        'shimeji_texture': 'https://images.unsplash.com/photo-1565281042-ad299c69fe8b?w=300&h=200&fit=crop',
        'enoki_fiber': 'https://images.unsplash.com/photo-1565281042-ad299c69fe8b?w=300&h=200&fit=crop',
        'kombu_mineral': 'https://images.unsplash.com/photo-1516537431324-95c1250c5d39?w=300&h=200&fit=crop',
        'wakame_lowcal': 'https://images.unsplash.com/photo-1516537431324-95c1250c5d39?w=300&h=200&fit=crop',
        'nori_vitamin': 'https://images.unsplash.com/photo-1516537431324-95c1250c5d39?w=300&h=200&fit=crop',
        'spinach_iron': 'https://images.unsplash.com/photo-1515096788086-a50ae4d8da6d?w=300&h=200&fit=crop',
        'kale_superfood': 'https://images.unsplash.com/photo-1515095050815-6ca3f6113cb4?w=300&h=200&fit=crop',
        'broccoli_vitamin': 'https://images.unsplash.com/photo-1585238544920-d4c7a3c926c6?w=300&h=200&fit=crop',
        'miso_probiotic': 'https://images.unsplash.com/photo-1584308936808-07d2fb6c5e9e?w=300&h=200&fit=crop',
        'kimchi_lacto': 'https://images.unsplash.com/photo-1550151006-1dd942c95964?w=300&h=200&fit=crop',
        'natto_enzyme': 'https://images.unsplash.com/photo-1576273172464-1e7e8ad6b032?w=300&h=200&fit=crop',
        'brown_rice_fiber': 'https://images.unsplash.com/photo-1575394552071-ec009fc00abd?w=300&h=200&fit=crop',
        'oats_beta': 'https://images.unsplash.com/photo-1547190128-60c3dc5306eb?w=300&h=200&fit=crop',
        'buckwheat_rutin': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop'
    };

    return imageMap[foodId] || null;
}

// フィルターの設定
function setupFilters() {
    const searchInput = document.getElementById('searchFoods');
    const categoryFilter = document.getElementById('filterCategory');

    searchInput.addEventListener('input', filterFoods);
    categoryFilter.addEventListener('change', filterFoods);
}

// 食材のフィルタリング
function filterFoods() {
    const searchTerm = document.getElementById('searchFoods').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;

    let filteredFoods = window.foodsData || [];

    if (searchTerm) {
        filteredFoods = filteredFoods.filter(food =>
            food.name.toLowerCase().includes(searchTerm) ||
            food.description.toLowerCase().includes(searchTerm)
        );
    }

    if (categoryFilter) {
        filteredFoods = filteredFoods.filter(food => food.category === categoryFilter);
    }

    displayFoods(filteredFoods);
}

// カテゴリーフィルターの設定
function populateCategoryFilter() {
    const select = document.getElementById('filterCategory');
    const categories = [...new Set((window.foodsData || []).map(food => food.category))];

    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// カテゴリーセレクトの設定
function populateCategorySelects() {
    const selects = document.querySelectorAll('#foodCategory');
    const categories = window.categoriesData || [];

    selects.forEach(select => {
        // 既存のオプションをクリア（最初のオプションは残す）
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.emoji} ${category.name}`;
            select.appendChild(option);
        });
    });
}

// フォームの設定
function setupForms() {
    // 食材フォーム
    const foodForm = document.getElementById('foodForm');
    foodForm.addEventListener('submit', saveFoodForm);

    // カテゴリーフォーム
    const categoryForm = document.getElementById('categoryForm');
    categoryForm.addEventListener('submit', saveCategoryForm);

    // 画像プレビュー
    const imageInput = document.getElementById('foodImage');
    imageInput.addEventListener('change', previewImage);
}

// 食材追加モーダル表示
function showAddFoodModal() {
    editingFoodId = null;
    document.getElementById('foodModalTitle').textContent = '新しい食材を追加';
    document.getElementById('foodForm').reset();
    clearDynamicFields();
    document.getElementById('foodModal').style.display = 'block';
    populateCategorySelects();
}

// 食材編集モーダル表示
function editFood(foodId) {
    const food = window.foodsData.find(f => f.id === foodId);
    if (!food) return;

    editingFoodId = foodId;
    document.getElementById('foodModalTitle').textContent = '食材を編集';
    populateFoodForm(food);
    document.getElementById('foodModal').style.display = 'block';
    populateCategorySelects();
}

// 食材フォームへのデータ入力
function populateFoodForm(food) {
    document.getElementById('foodName').value = food.name;
    document.getElementById('foodCategory').value = food.category;
    document.getElementById('foodDescription').value = food.description;
    document.getElementById('proteinPer100g').value = food.proteinPer100g;
    document.getElementById('carbsPer100g').value = food.carbsPer100g || 0;
    document.getElementById('fatPer100g').value = food.fatPer100g || 0;
    document.getElementById('caloriesPer100g').value = food.caloriesPer100g || 0;
    document.getElementById('servingSize').value = food.servingSize || '';
    document.getElementById('proteinPerServing').value = food.proteinPerServing || 0;
    document.getElementById('rating').value = food.rating;
    document.getElementById('priceRange').value = food.priceRange;

    // 動的フィールドの設定
    populateDynamicFields(food.vitamins, 'vitamins');
    populateDynamicFields(food.minerals, 'minerals');
    populateBenefits(food.benefits);
    populateCookingTips(food.cookingTips);
}

// 食材フォームの保存
function saveFoodForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const food = {
        id: editingFoodId || generateId(),
        name: formData.get('foodName') || document.getElementById('foodName').value,
        category: formData.get('foodCategory') || document.getElementById('foodCategory').value,
        description: formData.get('foodDescription') || document.getElementById('foodDescription').value,
        proteinPer100g: parseFloat(document.getElementById('proteinPer100g').value) || 0,
        carbsPer100g: parseFloat(document.getElementById('carbsPer100g').value) || 0,
        fatPer100g: parseFloat(document.getElementById('fatPer100g').value) || 0,
        caloriesPer100g: parseInt(document.getElementById('caloriesPer100g').value) || 0,
        servingSize: document.getElementById('servingSize').value || '',
        proteinPerServing: parseFloat(document.getElementById('proteinPerServing').value) || 0,
        rating: parseInt(document.getElementById('rating').value) || 4,
        priceRange: document.getElementById('priceRange').value || 'やや高価',
        vitamins: collectNutrients('vitamins'),
        minerals: collectNutrients('minerals'),
        benefits: collectBenefits(),
        cookingTips: collectCookingTips()
    };

    if (editingFoodId) {
        // 編集
        const index = window.foodsData.findIndex(f => f.id === editingFoodId);
        if (index !== -1) {
            window.foodsData[index] = food;
        }
    } else {
        // 追加
        window.foodsData.push(food);
    }

    // データの保存とUIの更新
    saveFoodsToStorage();
    displayFoods(window.foodsData);
    populateCategoryFilter();
    closeFoodModal();

    alert(editingFoodId ? '食材を更新しました。おすすめ食材ページをリロードすると変更が反映されます。' : '食材を追加しました。おすすめ食材ページをリロードすると変更が反映されます。');
}

// 食材の削除
function deleteFood(foodId) {
    if (!confirm('この食材を削除しますか？')) return;

    const index = window.foodsData.findIndex(f => f.id === foodId);
    if (index !== -1) {
        window.foodsData.splice(index, 1);
        saveFoodsToStorage();
        displayFoods(window.foodsData);
        populateCategoryFilter();
        alert('食材を削除しました。おすすめ食材ページをリロードすると変更が反映されます。');
    }
}

// 食材モーダルを閉じる
function closeFoodModal() {
    document.getElementById('foodModal').style.display = 'none';
    editingFoodId = null;
}

// カテゴリー追加モーダル表示
function showAddCategoryModal() {
    editingCategoryId = null;
    document.getElementById('categoryModalTitle').textContent = '新しいカテゴリーを追加';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'block';
}

// カテゴリー編集モーダル表示
function editCategory(categoryId) {
    const category = window.categoriesData.find(c => c.id === categoryId);
    if (!category) return;

    editingCategoryId = categoryId;
    document.getElementById('categoryModalTitle').textContent = 'カテゴリーを編集';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryEmoji').value = category.emoji || '';
    document.getElementById('categoryModal').style.display = 'block';
}

// カテゴリーフォームの保存
function saveCategoryForm(e) {
    e.preventDefault();

    const category = {
        id: editingCategoryId || generateId(),
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        emoji: document.getElementById('categoryEmoji').value || '📄'
    };

    if (editingCategoryId) {
        // 編集
        const index = window.categoriesData.findIndex(c => c.id === editingCategoryId);
        if (index !== -1) {
            window.categoriesData[index] = category;
        }
    } else {
        // 追加
        window.categoriesData.push(category);
    }

    // データの保存とUIの更新
    saveCategoriesToStorage();
    displayCategories(window.categoriesData);
    populateCategorySelects();
    closeCategoryModal();

    alert(editingCategoryId ? 'カテゴリーを更新しました' : 'カテゴリーを追加しました');
}

// カテゴリーの削除
function deleteCategory(categoryId) {
    if (!confirm('このカテゴリーを削除しますか？')) return;

    const index = window.categoriesData.findIndex(c => c.id === categoryId);
    if (index !== -1) {
        window.categoriesData.splice(index, 1);
        saveCategoriesToStorage();
        displayCategories(window.categoriesData);
        populateCategorySelects();
        alert('カテゴリーを削除しました');
    }
}

// カテゴリーモーダルを閉じる
function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    editingCategoryId = null;
}

// 動的フィールドの管理
function addNutrient(type) {
    const container = document.getElementById(type + 'Form');
    const div = document.createElement('div');
    div.className = 'nutrient-item';
    div.innerHTML = `
        <input type="text" placeholder="名前" required>
        <input type="text" placeholder="量（例: 10mg）" required>
        <button type="button" onclick="removeNutrient(this)">削除</button>
    `;
    container.appendChild(div);
}

function removeNutrient(button) {
    button.parentElement.remove();
}

function addBenefit() {
    const container = document.getElementById('benefitsForm');
    const div = document.createElement('div');
    div.className = 'nutrient-item';
    div.innerHTML = `
        <input type="text" placeholder="健康効果" required>
        <button type="button" onclick="removeNutrient(this)">削除</button>
    `;
    container.appendChild(div);
}

function addCookingTip() {
    const container = document.getElementById('cookingTipsForm');
    const div = document.createElement('div');
    div.className = 'nutrient-item';
    div.innerHTML = `
        <input type="text" placeholder="調理のコツ" required>
        <button type="button" onclick="removeNutrient(this)">削除</button>
    `;
    container.appendChild(div);
}

// 動的フィールドのクリア
function clearDynamicFields() {
    document.getElementById('vitaminsForm').innerHTML = '';
    document.getElementById('mineralsForm').innerHTML = '';
    document.getElementById('benefitsForm').innerHTML = '';
    document.getElementById('cookingTipsForm').innerHTML = '';
}

// 動的フィールドへのデータ入力
function populateDynamicFields(data, type) {
    const container = document.getElementById(type + 'Form');
    container.innerHTML = '';

    if (data && data.length > 0) {
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'nutrient-item';
            div.innerHTML = `
                <input type="text" value="${item.name}" required>
                <input type="text" value="${item.amount}" required>
                <button type="button" onclick="removeNutrient(this)">削除</button>
            `;
            container.appendChild(div);
        });
    }
}

function populateBenefits(benefits) {
    const container = document.getElementById('benefitsForm');
    container.innerHTML = '';

    if (benefits && benefits.length > 0) {
        benefits.forEach(benefit => {
            const div = document.createElement('div');
            div.className = 'nutrient-item';
            div.innerHTML = `
                <input type="text" value="${benefit}" required>
                <button type="button" onclick="removeNutrient(this)">削除</button>
            `;
            container.appendChild(div);
        });
    }
}

function populateCookingTips(tips) {
    const container = document.getElementById('cookingTipsForm');
    container.innerHTML = '';

    if (tips && tips.length > 0) {
        tips.forEach(tip => {
            const div = document.createElement('div');
            div.className = 'nutrient-item';
            div.innerHTML = `
                <input type="text" value="${tip}" required>
                <button type="button" onclick="removeNutrient(this)">削除</button>
            `;
            container.appendChild(div);
        });
    }
}

// 動的フィールドからのデータ収集
function collectNutrients(type) {
    const container = document.getElementById(type + 'Form');
    const items = container.querySelectorAll('.nutrient-item');
    const nutrients = [];

    items.forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
            nutrients.push({
                name: inputs[0].value,
                amount: inputs[1].value
            });
        }
    });

    return nutrients;
}

function collectBenefits() {
    const container = document.getElementById('benefitsForm');
    const items = container.querySelectorAll('.nutrient-item input');
    const benefits = [];

    items.forEach(input => {
        if (input.value) {
            benefits.push(input.value);
        }
    });

    return benefits;
}

function collectCookingTips() {
    const container = document.getElementById('cookingTipsForm');
    const items = container.querySelectorAll('.nutrient-item input');
    const tips = [];

    items.forEach(input => {
        if (input.value) {
            tips.push(input.value);
        }
    });

    return tips;
}

// 画像プレビュー
function previewImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>画像をアップロード</span>';
    }
}

// データの永続化
function saveFoodsToStorage() {
    const data = {
        foods: window.foodsData,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('foodsData', JSON.stringify(data));
}

function saveCategoriesToStorage() {
    localStorage.setItem('categories', JSON.stringify(window.categoriesData));
}

// データ変換関数（recommended-foods.json形式 → 管理画面形式）
function convertToAdminFormat(originalFoods) {
    return originalFoods.map(food => ({
        id: food.id,
        name: food.name,
        category: food.category,
        description: food.description,
        proteinPer100g: food.protein_per_100g || 0,
        carbsPer100g: food.carbs_per_100g || 0,
        fatPer100g: food.fat_per_100g || 0,
        caloriesPer100g: food.calories_per_100g || 0,
        servingSize: food.serving_size || '',
        proteinPerServing: food.protein_per_serving || 0,
        rating: food.rating || 4,
        priceRange: food.price_range || 'やや高価',
        vitamins: food.vitamins || [],
        minerals: food.minerals || [],
        benefits: food.benefits || [],
        cookingTips: food.cooking_tips || []
    }));
}

// 管理画面形式 → recommended-foods.json形式への変換
function convertToRecommendedFormat(adminFoods) {
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

// ユーティリティ関数
function generateId() {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// エクスポート機能
function exportData() {
    const data = {
        foods: window.foodsData,
        categories: window.categoriesData,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `protein-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('データをエクスポートしました');
}

// インポート機能
function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.foods && Array.isArray(data.foods)) {
                window.foodsData = data.foods;
                saveFoodsToStorage();
                displayFoods(window.foodsData);
                populateCategoryFilter();
            }

            if (data.categories && Array.isArray(data.categories)) {
                window.categoriesData = data.categories;
                saveCategoriesToStorage();
                displayCategories(window.categoriesData);
                populateCategorySelects();
            }

            alert('データをインポートしました');
        } catch (error) {
            alert('ファイルの読み込みに失敗しました: ' + error.message);
        }
    };
    reader.readAsText(file);

    // ファイル選択をリセット
    e.target.value = '';
}

// ストレージ使用量の表示
function updateStorageUsage() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }

        const sizeInKB = (totalSize / 1024).toFixed(2);
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

        const usageText = sizeInMB > 1 ? `${sizeInMB} MB` : `${sizeInKB} KB`;
        document.getElementById('storageUsage').textContent = `使用量: ${usageText}`;
    } catch (error) {
        document.getElementById('storageUsage').textContent = '計算できません';
    }
}

// データリセット
function resetAllData() {
    if (!confirm('すべてのデータを削除しますか？この操作は取り消せません。')) return;

    if (confirm('本当にすべてのデータを削除しますか？')) {
        localStorage.clear();
        window.foodsData = [];
        window.categoriesData = [];

        displayFoods([]);
        displayCategories([]);
        populateCategoryFilter();
        populateCategorySelects();
        updateStorageUsage();

        alert('すべてのデータを削除しました');
    }
}

// レストラン管理関数
async function loadRestaurants() {
    try {
        // まずlocalStorageから管理者が編集したデータを確認
        const storedData = JSON.parse(localStorage.getItem('restaurantData') || '{}');

        if (storedData.restaurants && storedData.restaurants.length > 0) {
            restaurantsData = storedData.restaurants;
        } else {
            // 編集データがない場合は元のJSONファイルから読み込み
            const response = await fetch('data/restaurant-data.json');
            const data = await response.json();
            restaurantsData = data.restaurants || [];
        }

        displayRestaurants(restaurantsData);
        setupRestaurantFilters();
    } catch (error) {
        console.error('レストランデータの読み込みエラー:', error);
        restaurantsData = [];
    }
}

async function loadMenus() {
    try {
        // まずlocalStorageから管理者が編集したデータを確認
        const storedData = JSON.parse(localStorage.getItem('restaurantData') || '{}');

        if (storedData.menus && storedData.menus.length > 0) {
            menusData = storedData.menus;
        } else {
            // 編集データがない場合は元のJSONファイルから読み込み
            const response = await fetch('data/restaurant-data.json');
            const data = await response.json();
            menusData = data.menus || [];
        }

        displayMenus();
        populateMenuRestaurantFilter();
        setupMenuFilters();
    } catch (error) {
        console.error('メニューデータの読み込みエラー:', error);
        menusData = [];
    }
}

function displayRestaurants(restaurants) {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        grid.appendChild(card);
    });
}

function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';

    const menuCount = menusData.filter(m => m.restaurant_id === restaurant.id).length;

    card.innerHTML = `
        <div class="restaurant-header">
            <img src="${restaurant.logo}" alt="${restaurant.name}" class="restaurant-logo"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjMwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+qPC90ZXh0Pgo8L3N2Zz4='">
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <span class="restaurant-category">${restaurant.category}</span>
            </div>
        </div>
        <p class="restaurant-description">${restaurant.description}</p>
        <div class="restaurant-meta">
            <span>設立: ${restaurant.established}</span>
            <span>メニュー: ${menuCount}件</span>
        </div>
        <div class="restaurant-actions">
            <button class="btn-small" onclick="editRestaurant('${restaurant.id}')">編集</button>
            <button class="btn-small" style="background: #dc3545;" onclick="deleteRestaurant('${restaurant.id}')">削除</button>
        </div>
    `;

    return card;
}

function displayMenus() {
    const tbody = document.getElementById('menusTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    menusData.forEach(menu => {
        const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);
        const row = createMenuRow(menu, restaurant);
        tbody.appendChild(row);
    });
}

function createMenuRow(menu, restaurant) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><img src="${menu.image}" alt="${menu.name}"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAxNUMyNyAxNSAyOSAxNiAzMCAxOEMzMSAyMCAzMSAyMyAzMCAyNUMyOSAyNyAyNyAyOCAyNSAyOEMyMyAyOCAyMSAyNyAyMCAyNUMxOSAyMyAxOSAyMCAyMCAxOEMyMSAxNiAyMyAxNSAyNSAxNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHR1ZXh0IHg9IjI1IiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuODoeODi+ODpeODvDwvdGV4dD4KPC9zdmc+'">
        </td>
        <td>
            <div class="menu-restaurant-cell">
                <img src="${restaurant?.logo}" alt="${restaurant?.name}" class="menu-restaurant-logo"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+qPC90ZXh0Pgo8L3N2Zz4='">
                <span>${restaurant?.name || '不明'}</span>
            </div>
        </td>
        <td>${menu.name}</td>
        <td>${menu.category}</td>
        <td>¥${menu.price.toLocaleString()}</td>
        <td>${menu.nutrition.calories}kcal</td>
        <td>${menu.nutrition.protein}g</td>
        <td>
            <button class="btn-small" onclick="editMenu('${menu.id}')">編集</button>
            <button class="btn-small" style="background: #dc3545; margin-left: 0.5rem;" onclick="deleteMenu('${menu.id}')">削除</button>
        </td>
    `;

    return row;
}

// レストラン関連のモーダル・フォーム管理
function showAddRestaurantModal() {
    editingRestaurantId = null;
    document.getElementById('restaurantModalTitle').textContent = '新しいレストランを追加';
    document.getElementById('restaurantForm').reset();
    document.getElementById('restaurantModal').style.display = 'block';
}

function editRestaurant(restaurantId) {
    const restaurant = restaurantsData.find(r => r.id === restaurantId);
    if (!restaurant) return;

    editingRestaurantId = restaurantId;
    document.getElementById('restaurantModalTitle').textContent = 'レストランを編集';

    document.getElementById('restaurantName').value = restaurant.name;
    document.getElementById('restaurantCategory').value = restaurant.category;
    document.getElementById('restaurantDescription').value = restaurant.description || '';
    document.getElementById('restaurantLogo').value = restaurant.logo || '';
    document.getElementById('restaurantWebsite').value = restaurant.website || '';
    document.getElementById('restaurantEstablished').value = restaurant.established || '';
    document.getElementById('restaurantLocations').value = Array.isArray(restaurant.locations) ? restaurant.locations.join(',') : restaurant.locations || '';

    document.getElementById('restaurantModal').style.display = 'block';
}

function closeRestaurantModal() {
    document.getElementById('restaurantModal').style.display = 'none';
    editingRestaurantId = null;
}

function deleteRestaurant(restaurantId) {
    if (!confirm('このレストランを削除しますか？関連するメニューも削除されます。')) return;

    const index = restaurantsData.findIndex(r => r.id === restaurantId);
    if (index !== -1) {
        restaurantsData.splice(index, 1);

        // 関連メニューも削除
        menusData = menusData.filter(m => m.restaurant_id !== restaurantId);

        saveRestaurantData();
        displayRestaurants(restaurantsData);
        displayMenus();
        alert('レストランを削除しました');
    }
}

// メニュー関連のモーダル・フォーム管理
function showAddMenuModal() {
    editingMenuId = null;
    document.getElementById('menuModalTitle').textContent = '新しいメニューを追加';
    document.getElementById('menuForm').reset();
    populateMenuRestaurantSelect();
    document.getElementById('menuModal').style.display = 'block';
}

function editMenu(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;

    editingMenuId = menuId;
    document.getElementById('menuModalTitle').textContent = 'メニューを編集';

    populateMenuRestaurantSelect();

    document.getElementById('menuName').value = menu.name;
    document.getElementById('menuRestaurant').value = menu.restaurant_id;
    document.getElementById('menuCategory').value = menu.category;
    document.getElementById('menuDescription').value = menu.description;
    document.getElementById('menuImage').value = menu.image || '';
    document.getElementById('menuPrice').value = menu.price;
    document.getElementById('menuSize').value = menu.size || '';

    // 栄養成分
    document.getElementById('menuCalories').value = menu.nutrition.calories;
    document.getElementById('menuProtein').value = menu.nutrition.protein;
    document.getElementById('menuCarbs').value = menu.nutrition.carbs;
    document.getElementById('menuFat').value = menu.nutrition.fat;
    document.getElementById('menuFiber').value = menu.nutrition.fiber || '';
    document.getElementById('menuSodium').value = menu.nutrition.sodium || '';

    // アレルギー・食事制限
    document.getElementById('menuAllergens').value = Array.isArray(menu.allergens) ? menu.allergens.join(',') : '';
    document.getElementById('menuVegetarian').checked = menu.is_vegetarian || false;
    document.getElementById('menuVegan').checked = menu.is_vegan || false;
    document.getElementById('menuGlutenFree').checked = menu.is_gluten_free || false;
    document.getElementById('menuAvailable').checked = menu.available !== false;
    document.getElementById('menuSeasonal').checked = menu.seasonal || false;

    document.getElementById('menuModal').style.display = 'block';
}

function closeMenuModal() {
    document.getElementById('menuModal').style.display = 'none';
    editingMenuId = null;
}

function deleteMenu(menuId) {
    if (!confirm('このメニューを削除しますか？')) return;

    const index = menusData.findIndex(m => m.id === menuId);
    if (index !== -1) {
        menusData.splice(index, 1);
        saveRestaurantData();
        displayMenus();
        displayRestaurants(restaurantsData); // メニュー数の更新
        alert('メニューを削除しました');
    }
}

function populateMenuRestaurantSelect() {
    const select = document.getElementById('menuRestaurant');

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

function populateMenuRestaurantFilter() {
    const select = document.getElementById('filterMenuRestaurant');
    if (!select) return;

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

// フィルター機能
function setupRestaurantFilters() {
    const searchInput = document.getElementById('searchRestaurants');
    const categoryFilter = document.getElementById('filterRestaurantCategory');

    if (searchInput) {
        searchInput.addEventListener('input', filterRestaurants);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterRestaurants);
    }
}

function setupMenuFilters() {
    const searchInput = document.getElementById('searchMenus');
    const restaurantFilter = document.getElementById('filterMenuRestaurant');
    const categoryFilter = document.getElementById('filterMenuCategory');

    if (searchInput) {
        searchInput.addEventListener('input', filterMenus);
    }
    if (restaurantFilter) {
        restaurantFilter.addEventListener('change', filterMenus);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterMenus);
    }
}

function filterRestaurants() {
    const searchTerm = document.getElementById('searchRestaurants')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterRestaurantCategory')?.value || '';

    let filteredRestaurants = restaurantsData.filter(restaurant => {
        const matchesSearch = !searchTerm ||
            restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.description.toLowerCase().includes(searchTerm);

        const matchesCategory = !categoryFilter || restaurant.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    displayRestaurants(filteredRestaurants);
}

function filterMenus() {
    const searchTerm = document.getElementById('searchMenus')?.value.toLowerCase() || '';
    const restaurantFilter = document.getElementById('filterMenuRestaurant')?.value || '';
    const categoryFilter = document.getElementById('filterMenuCategory')?.value || '';

    let filteredMenus = menusData.filter(menu => {
        const matchesSearch = !searchTerm ||
            menu.name.toLowerCase().includes(searchTerm) ||
            menu.description.toLowerCase().includes(searchTerm);

        const matchesRestaurant = !restaurantFilter || menu.restaurant_id === restaurantFilter;
        const matchesCategory = !categoryFilter || menu.category === categoryFilter;

        return matchesSearch && matchesRestaurant && matchesCategory;
    });

    // フィルタリングされたメニューを表示
    const tbody = document.getElementById('menusTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    filteredMenus.forEach(menu => {
        const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);
        const row = createMenuRow(menu, restaurant);
        tbody.appendChild(row);
    });
}

// データ保存
function saveRestaurantData() {
    const data = {
        restaurants: restaurantsData,
        menus: menusData,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('restaurantData', JSON.stringify(data));
}

// フォーム送信処理の設定
function setupForms() {
    // 食材フォーム
    const foodForm = document.getElementById('foodForm');
    if (foodForm) {
        foodForm.addEventListener('submit', saveFoodForm);
    }

    // カテゴリーフォーム
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', saveCategoryForm);
    }

    // レストランフォーム
    const restaurantForm = document.getElementById('restaurantForm');
    if (restaurantForm) {
        restaurantForm.addEventListener('submit', saveRestaurantForm);
    }

    // メニューフォーム
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        menuForm.addEventListener('submit', saveMenuForm);
    }

    // 画像プレビュー
    const imageInput = document.getElementById('foodImage');
    if (imageInput) {
        imageInput.addEventListener('change', previewImage);
    }
}

function saveRestaurantForm(e) {
    e.preventDefault();

    const restaurant = {
        id: editingRestaurantId || generateId(),
        name: document.getElementById('restaurantName').value,
        category: document.getElementById('restaurantCategory').value,
        description: document.getElementById('restaurantDescription').value,
        logo: document.getElementById('restaurantLogo').value,
        website: document.getElementById('restaurantWebsite').value,
        established: document.getElementById('restaurantEstablished').value,
        locations: document.getElementById('restaurantLocations').value.split(',').map(l => l.trim()),
        last_updated: new Date().toISOString()
    };

    if (editingRestaurantId) {
        // 編集
        const index = restaurantsData.findIndex(r => r.id === editingRestaurantId);
        if (index !== -1) {
            restaurantsData[index] = restaurant;
        }
    } else {
        // 追加
        restaurantsData.push(restaurant);
    }

    saveRestaurantData();
    displayRestaurants(restaurantsData);
    populateMenuRestaurantSelect();
    populateMenuRestaurantFilter();
    closeRestaurantModal();

    alert(editingRestaurantId ? 'レストランを更新しました' : 'レストランを追加しました');
}

function saveMenuForm(e) {
    e.preventDefault();

    const allergens = document.getElementById('menuAllergens').value
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

    const menu = {
        id: editingMenuId || generateId(),
        restaurant_id: document.getElementById('menuRestaurant').value,
        name: document.getElementById('menuName').value,
        category: document.getElementById('menuCategory').value,
        description: document.getElementById('menuDescription').value,
        image: document.getElementById('menuImage').value,
        price: parseInt(document.getElementById('menuPrice').value),
        size: document.getElementById('menuSize').value,
        nutrition: {
            calories: parseInt(document.getElementById('menuCalories').value),
            protein: parseFloat(document.getElementById('menuProtein').value),
            carbs: parseFloat(document.getElementById('menuCarbs').value),
            fat: parseFloat(document.getElementById('menuFat').value),
            fiber: parseFloat(document.getElementById('menuFiber').value) || 0,
            sodium: parseInt(document.getElementById('menuSodium').value) || 0
        },
        allergens: allergens,
        is_vegetarian: document.getElementById('menuVegetarian').checked,
        is_vegan: document.getElementById('menuVegan').checked,
        is_gluten_free: document.getElementById('menuGlutenFree').checked,
        available: document.getElementById('menuAvailable').checked,
        seasonal: document.getElementById('menuSeasonal').checked,
        added_date: editingMenuId ? undefined : new Date().toISOString(),
        last_updated: new Date().toISOString()
    };

    if (editingMenuId) {
        // 編集
        const index = menusData.findIndex(m => m.id === editingMenuId);
        if (index !== -1) {
            // 追加日は保持
            menu.added_date = menusData[index].added_date;
            menusData[index] = menu;
        }
    } else {
        // 追加
        menusData.push(menu);
    }

    saveRestaurantData();
    displayMenus();
    displayRestaurants(restaurantsData); // メニュー数の更新
    closeMenuModal();

    alert(editingMenuId ? 'メニューを更新しました' : 'メニューを追加しました');
}

// モーダルのクリックイベント（外側クリックで閉じる）
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});