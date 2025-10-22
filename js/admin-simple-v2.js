// シンプルな管理画面 - レストランロゴ機能付き
console.log('🚀 ULTRATHINK FIX: admin-simple-v2.js 読み込み開始 - NUTRITION FIELD FIXED VERSION');

// グローバル変数
let restaurantsData = [];
let menusData = [];
let editingRestaurantId = null;
let editingMenuId = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('管理画面初期化開始');

    // タブ切り替え
    setupTabs();

    // レストランデータ読み込み
    loadRestaurantData();

    // フォーム設定
    setupForms();

    // メニュー表示機能も初期化
    setupMenuDisplay();

    console.log('管理画面初期化完了');
});

// タブ切り替え
function setupTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // アクティブ状態切り替え
            navLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            this.classList.add('active');
            const targetTab = document.getElementById('tab-' + this.dataset.tab);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// レストランデータ読み込み
function loadRestaurantData() {
    console.log('レストランデータ読み込み開始');

    // 1. 最優先：localStorageから編集済みデータをチェック
    const storedData = JSON.parse(localStorage.getItem('restaurantData') || '{}');

    if (storedData.restaurants && storedData.restaurants.length > 0) {
        restaurantsData = storedData.restaurants;
        menusData = storedData.menus || [];
        console.log('localStorageから読み込み完了:', restaurantsData.length, 'レストラン');
    } else {
        // 2. フォールバック：埋め込みデータから読み込み
        if (typeof RESTAURANT_DATA !== 'undefined' && RESTAURANT_DATA.restaurants) {
            restaurantsData = RESTAURANT_DATA.restaurants;
            menusData = RESTAURANT_DATA.menus || [];
            console.log('埋め込みデータから読み込み完了:', restaurantsData.length, 'レストラン');
        } else {
            console.warn('データが見つかりません');
            restaurantsData = [];
            menusData = [];
        }
    }

    displayRestaurants();
}

// レストラン表示
function displayRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) {
        console.error('restaurantsGrid要素が見つかりません');
        return;
    }

    grid.innerHTML = '';

    if (restaurantsData.length === 0) {
        grid.innerHTML = '<p>レストランデータがありません</p>';
        return;
    }

    restaurantsData.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        grid.appendChild(card);
    });

    // イベントリスナーを設定（重複を避けるため毎回新しく設定）
    setupRestaurantCardEvents();

    console.log('レストランカード表示完了:', restaurantsData.length, '件');
}

// レストランカードのイベント設定（イベント委譲を使用）
function setupRestaurantCardEvents() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;

    // 既存のイベントリスナーを削除
    grid.removeEventListener('click', handleRestaurantCardClick);

    // 新しいイベントリスナーを追加（イベント委譲）
    grid.addEventListener('click', handleRestaurantCardClick);
}

// レストランカードクリックハンドラー
function handleRestaurantCardClick(event) {
    const target = event.target;

    if (target.classList.contains('edit-btn')) {
        event.preventDefault();
        event.stopPropagation();
        const restaurantId = target.getAttribute('data-restaurant-id');
        console.log('編集ボタンクリック:', restaurantId);
        editRestaurant(restaurantId);
    } else if (target.classList.contains('delete-btn')) {
        event.preventDefault();
        event.stopPropagation();
        const restaurantId = target.getAttribute('data-restaurant-id');
        console.log('削除ボタンクリック:', restaurantId);
        deleteRestaurant(restaurantId);
    }
}

// レストランカード作成
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    const menuCount = menusData.filter(m => m.restaurant_id === restaurant.id).length;
    const logoSrc = restaurant.logoFile || restaurant.logo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg63jgrQ8L3RleHQ+Cjwvc3ZnPg==';

    card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
            <img src="${logoSrc}" alt="${restaurant.name}"
                 style="width: 60px; height: 60px; border-radius: 8px; margin-right: 1rem;"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg63jgrQ8L3RleHQ+Cjwvc3ZnPg==';">
            <div>
                <h3 style="margin: 0; font-size: 1.2rem;">${restaurant.name}</h3>
                <span style="color: #666; font-size: 0.9rem;">${restaurant.category}</span>
            </div>
        </div>
        <p style="color: #555; margin-bottom: 1rem;">${restaurant.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #666; font-size: 0.9rem;">
                設立: ${restaurant.established} | メニュー: ${menuCount}件
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="edit-btn" data-restaurant-id="${restaurant.id}"
                        style="background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.9rem;">
                    編集
                </button>
                <button class="delete-btn" data-restaurant-id="${restaurant.id}"
                        style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.9rem;">
                    削除
                </button>
            </div>
        </div>
    `;

    return card;
}

// レストラン編集
function editRestaurant(restaurantId) {
    console.log('editRestaurant呼び出し:', restaurantId);

    // 既にモーダルが開いている場合は何もしない
    const checkModal = document.getElementById('restaurantModal');
    if (checkModal && checkModal.style.display === 'block') {
        console.log('モーダルが既に開いています');
        return;
    }

    const restaurant = restaurantsData.find(r => r.id === restaurantId);
    if (!restaurant) {
        alert('レストランが見つかりません: ' + restaurantId);
        return;
    }

    editingRestaurantId = restaurantId;

    // フォームに値を設定
    document.getElementById('restaurantModalTitle').textContent = 'レストランを編集';
    document.getElementById('restaurantName').value = restaurant.name || '';
    document.getElementById('restaurantCategory').value = restaurant.category || '';
    document.getElementById('restaurantDescription').value = restaurant.description || '';
    document.getElementById('restaurantLogo').value = restaurant.logo || '';
    document.getElementById('restaurantWebsite').value = restaurant.website || '';
    document.getElementById('restaurantEstablished').value = restaurant.established || '';

    // 配列の場合は文字列に変換
    const locations = Array.isArray(restaurant.locations) ? restaurant.locations.join(',') : (restaurant.locations || '');
    document.getElementById('restaurantLocations').value = locations;

    // ロゴプレビュー設定
    updateLogoPreview(restaurant.logoFile || restaurant.logo);

    // モーダル表示
    const modal = document.getElementById('restaurantModal');
    modal.style.display = 'block';

    console.log('編集モーダル表示完了');
}

// ロゴプレビュー更新
function updateLogoPreview(logoUrl) {
    const previewImg = document.getElementById('logoPreviewImage');
    const previewText = document.getElementById('logoPreviewText');

    if (logoUrl) {
        previewImg.src = logoUrl;
        previewImg.style.display = 'block';
        previewText.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        previewText.style.display = 'block';
        previewText.textContent = 'ロゴ画像をアップロードまたはURLを入力';
    }
}

// レストラン削除
function deleteRestaurant(restaurantId) {
    if (!confirm('このレストランを削除しますか？')) return;

    const index = restaurantsData.findIndex(r => r.id === restaurantId);
    if (index !== -1) {
        restaurantsData.splice(index, 1);

        // localStorage に保存（重要！）
        saveRestaurantDataToStorage();

        updateDisplaysAfterSave();
        alert('レストランを削除しました');
    }
}

// フォーム設定
function setupForms() {
    // レストランフォーム
    const restaurantForm = document.getElementById('restaurantForm');
    if (restaurantForm) {
        restaurantForm.addEventListener('submit', saveRestaurant);
    }

    // メニューフォーム
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        console.log('メニューフォーム要素見つかりました:', menuForm);
        menuForm.addEventListener('submit', saveMenu);
        console.log('メニューフォームのsubmitイベントリスナー設定完了');
    } else {
        console.error('menuForm要素が見つかりません!');
    }

    // ロゴファイル入力
    const logoFileInput = document.getElementById('restaurantLogoFile');
    if (logoFileInput) {
        logoFileInput.addEventListener('change', handleLogoFileUpload);
    }

    // ロゴURL入力
    const logoUrlInput = document.getElementById('restaurantLogo');
    if (logoUrlInput) {
        logoUrlInput.addEventListener('input', function() {
            updateLogoPreview(this.value);
        });
    }

    // メニュー画像ファイル入力
    const menuImageFileInput = document.getElementById('menuImageFile');
    if (menuImageFileInput) {
        menuImageFileInput.addEventListener('change', handleMenuImageFileUpload);
    }

    // メニュー画像URL入力
    const menuImageUrlInput = document.getElementById('menuImage');
    if (menuImageUrlInput) {
        menuImageUrlInput.addEventListener('input', function() {
            updateMenuImagePreview(this.value);
        });
    }
}

// ロゴファイルアップロード処理
function handleLogoFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        updateLogoPreview(dataUrl);

        // URL入力をクリア（ファイル優先）
        document.getElementById('restaurantLogo').value = '';

        // データURLを一時保存
        if (editingRestaurantId) {
            const restaurant = restaurantsData.find(r => r.id === editingRestaurantId);
            if (restaurant) {
                restaurant.logoFile = dataUrl;
            }
        }
    };
    reader.readAsDataURL(file);
}

// レストラン保存
function saveRestaurant(event) {
    event.preventDefault();

    console.log('レストラン保存開始');

    const formData = new FormData(event.target);
    const logoUrl = document.getElementById('restaurantLogo').value;
    const logoFile = document.getElementById('logoPreviewImage').src;

    // ロゴの決定（ファイルがあればファイル、なければURL）
    let finalLogo = logoUrl;
    let finalLogoFile = null;

    if (logoFile && logoFile.startsWith('data:')) {
        finalLogoFile = logoFile;
        finalLogo = ''; // ファイル優先の場合URLはクリア
    }

    const restaurant = {
        id: editingRestaurantId || 'restaurant_' + Date.now(),
        name: document.getElementById('restaurantName').value,
        category: document.getElementById('restaurantCategory').value,
        description: document.getElementById('restaurantDescription').value,
        logo: finalLogo,
        logoFile: finalLogoFile,
        website: document.getElementById('restaurantWebsite').value,
        established: document.getElementById('restaurantEstablished').value,
        locations: document.getElementById('restaurantLocations').value.split(',').map(l => l.trim()).filter(l => l),
        last_updated: new Date().toISOString()
    };

    if (editingRestaurantId) {
        // 編集
        const index = restaurantsData.findIndex(r => r.id === editingRestaurantId);
        if (index !== -1) {
            restaurantsData[index] = restaurant;
        }
    } else {
        // 新規追加
        restaurantsData.push(restaurant);
    }

    // localStorage に保存（重要！）
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();
    closeRestaurantModal();

    const message = editingRestaurantId ? 'レストランを更新しました' : 'レストランを追加しました';
    alert(message);

    console.log('レストラン保存完了 - localStorageに永続化済み');
}

// レストランモーダルを閉じる
function closeRestaurantModal() {
    document.getElementById('restaurantModal').style.display = 'none';
    editingRestaurantId = null;

    // ファイル入力をクリア
    const logoFileInput = document.getElementById('restaurantLogoFile');
    if (logoFileInput) {
        logoFileInput.value = '';
    }
}

// 新しいレストラン追加
function showAddRestaurantModal() {
    editingRestaurantId = null;
    document.getElementById('restaurantModalTitle').textContent = '新しいレストランを追加';
    document.getElementById('restaurantForm').reset();
    updateLogoPreview(null);

    // モーダル表示
    const modal = document.getElementById('restaurantModal');
    modal.style.display = 'block';

    console.log('新規追加モーダル表示完了');
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// メニュー表示機能
function setupMenuDisplay() {
    displayMenus();
}

function displayMenus() {
    const tbody = document.getElementById('menusTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (menusData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">メニューデータがありません</td></tr>';
        return;
    }

    menusData.forEach(menu => {
        const restaurant = restaurantsData.find(r => r.id === menu.restaurant_id);
        const row = createMenuRow(menu, restaurant);
        tbody.appendChild(row);
    });

    console.log('メニュー表示完了:', menusData.length, '件');
}

function createMenuRow(menu, restaurant) {
    const row = document.createElement('tr');

    // レストランロゴの決定（ファイルアップロードを優先、次にURL、最後にデフォルト）
    const restaurantLogoSrc = restaurant?.logoFile || restaurant?.logo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg63jgrQ8L3RleHQ+Cjwvc3ZnPg==';

    row.innerHTML = `
        <td>
            <img src="${menu.image}" alt="${menu.name}"
                 style="width: 50px; height: 50px; border-radius: 4px;"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjI1IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg6Hjg4vjg6U8L3RleHQ+Cjwvc3ZnPg=='">
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="${restaurantLogoSrc}" alt="${restaurant?.name || '不明'}"
                     style="width: 30px; height: 30px; border-radius: 4px;"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg63jgrQ8L3RleHQ+Cjwvc3ZnPg=='">
                <span style="font-size: 0.9rem;">${restaurant?.name || '不明'}</span>
            </div>
        </td>
        <td>${menu.name}</td>
        <td>${menu.category}</td>
        <td>¥${menu.price?.toLocaleString() || '不明'}</td>
        <td>${menu.nutrition?.calories || 0}kcal</td>
        <td>${menu.nutrition?.protein || 0}g</td>
        <td>
            <button onclick="editMenu('${menu.id}')"
                    style="background: #007bff; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem; margin-right: 0.25rem;">
                編集
            </button>
            <button onclick="deleteMenu('${menu.id}')"
                    style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem;">
                削除
            </button>
        </td>
    `;

    return row;
}

// 保存時にメニュー表示も更新
function updateDisplaysAfterSave() {
    displayRestaurants();
    displayMenus();
}

// localStorageにデータを永続化
function saveRestaurantDataToStorage() {
    const dataToSave = {
        restaurants: restaurantsData,
        menus: menusData,
        lastUpdated: new Date().toISOString()
    };

    try {
        localStorage.setItem('restaurantData', JSON.stringify(dataToSave));
        console.log('データをlocalStorageに保存しました:', dataToSave.restaurants.length, 'レストラン');
    } catch (error) {
        console.error('localStorage保存エラー:', error);
        alert('データの保存に失敗しました。ブラウザの容量が不足している可能性があります。');
    }
}

// 未実装の関数をダミーで追加（エラー防止）
function showAddFoodModal() {
    alert('食材管理機能は現在実装中です');
}

function showAddCategoryModal() {
    alert('カテゴリー管理機能は現在実装中です');
}

function exportData() {
    alert('エクスポート機能は現在実装中です');
}

function resetAllData() {
    if (confirm('すべてのデータをリセットしますか？')) {
        restaurantsData = [];
        menusData = [];

        // localStorageもクリア
        localStorage.removeItem('restaurantData');
        console.log('localStorageからデータを削除しました');

        updateDisplaysAfterSave();
        alert('データをリセットしました');
    }
}

// メニュー管理関数（グローバルスコープ）
window.editMenu = function(menuId) {
    console.log('editMenu呼び出し - menuId:', menuId);
    const menu = menusData.find(m => m.id === menuId);
    console.log('見つかったメニュー:', menu);
    if (!menu) {
        alert('メニューが見つかりません');
        return;
    }

    editingMenuId = menuId;
    console.log('showMenuModal呼び出し開始');
    showMenuModal(menu);
};

window.deleteMenu = function(menuId) {
    if (!confirm('このメニューを削除しますか？')) return;

    const index = menusData.findIndex(m => m.id === menuId);
    if (index !== -1) {
        menusData.splice(index, 1);

        // localStorage に保存（重要！）
        saveRestaurantDataToStorage();

        updateDisplaysAfterSave();
        alert('メニューを削除しました');
    }
};

window.showAddMenuModal = function() {
    editingMenuId = null;
    showMenuModal();
};

function showMenuModal(menu = null) {
    // フォーム初期化
    const form = document.getElementById('menuForm');
    if (form) {
        form.reset();

        // フォームのsubmitイベントを再設定（確実に動作させるため）
        form.removeEventListener('submit', saveMenu);
        form.addEventListener('submit', saveMenu);
        console.log('メニューフォームのsubmitイベント再設定完了');
    }

    // レストラン選択肢を先に設定
    populateRestaurantSelect();

    // モーダルタイトル設定
    const title = document.getElementById('menuModalTitle');
    if (title) {
        title.textContent = menu ? 'メニューを編集' : '新しいメニューを追加';
    }

    if (menu) {
        // 編集モードの場合、フォームに値を設定
        setFormValue('menuName', menu.name);
        setFormValue('menuRestaurant', menu.restaurant_id);
        setFormValue('menuCategory', menu.category);
        setFormValue('menuDescription', menu.description);
        setFormValue('menuPrice', menu.price);
        setFormValue('menuSize', menu.size);
        setFormValue('menuImage', menu.image);

        // 画像プレビュー設定
        updateMenuImagePreview(menu.image);

        // 栄養情報
        if (menu.nutrition) {
            setFormValue('menuCalories', menu.nutrition.calories);
            setFormValue('menuProtein', menu.nutrition.protein);
            setFormValue('menuCarbs', menu.nutrition.carbs);
            setFormValue('menuFat', menu.nutrition.fat);
            setFormValue('menuFiber', menu.nutrition.fiber);
            setFormValue('menuSodium', menu.nutrition.sodium);
            // menuSugarフィールドは存在しないのでスキップ
        }

        // 食事制限
        setCheckboxValue('is_vegetarian', menu.is_vegetarian);
        setCheckboxValue('is_vegan', menu.is_vegan);
        setCheckboxValue('is_gluten_free', menu.is_gluten_free);
    }

    // モーダル表示（強制的にスタイル設定）
    const modal = document.getElementById('menuModal');
    console.log('メニューモーダル要素:', modal);
    if (modal) {
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '9999';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.backdropFilter = 'blur(5px)';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';

        // モーダルコンテンツのスタイリング改善
        const modalContent = modal.querySelector('.modal-content-large');
        if (modalContent) {
            modalContent.style.maxHeight = '85vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.margin = '2% auto';
            modalContent.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
            modalContent.style.border = 'none';
            modalContent.style.borderRadius = '16px';
        }
        console.log('メニューモーダル強制表示設定完了');
        console.log('モーダルスタイル確認:', {
            display: modal.style.display,
            position: modal.style.position,
            zIndex: modal.style.zIndex,
            visibility: modal.style.visibility
        });
    } else {
        console.error('menuModal要素が見つかりません');
        alert('メニューモーダルが見つかりません。ページをリロードしてください。');
    }
}

function setFormValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

function setCheckboxValue(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === 'boolean') {
        element.checked = value;
    }
}

window.closeMenuModal = function() {
    const modal = document.getElementById('menuModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingMenuId = null;
};

function saveMenu(event) {
    console.log('saveMenu関数が呼ばれました!');
    console.log('event:', event);

    if (event) {
        event.preventDefault();
        console.log('preventDefault実行完了');
    }

    console.log('メニュー保存開始');

    // 画像の処理（ファイル優先、なければURL）
    const imageFile = document.getElementById('menuImagePreviewImg')?.src || '';
    const imageUrl = document.getElementById('menuImage')?.value || '';
    let finalImage = imageUrl;

    if (imageFile && imageFile.startsWith('data:')) {
        finalImage = imageFile; // ファイルアップロード優先
    }

    console.log('画像処理完了:', { imageFile: imageFile.substring(0, 50), imageUrl, finalImage: finalImage.substring(0, 50) });

    // DOM要素の安全な取得
    const getElementValue = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`要素が見つかりません: ${id}`);
            return '';
        }
        return element.value || '';
    };

    const getElementChecked = (id) => {
        const element = document.getElementById(id);
        return element ? (element.checked || false) : false;
    };

    const menu = {
        id: editingMenuId || 'menu_' + Date.now(),
        name: getElementValue('menuName'),
        restaurant_id: getElementValue('menuRestaurant'),
        category: getElementValue('menuCategory'),
        description: getElementValue('menuDescription'),
        price: parseInt(getElementValue('menuPrice')) || 0,
        size: getElementValue('menuSize'),
        image: finalImage,
        nutrition: {
            calories: parseInt(getElementValue('menuCalories')) || 0,
            protein: parseFloat(getElementValue('menuProtein')) || 0,
            carbs: parseFloat(getElementValue('menuCarbs')) || 0,
            fat: parseFloat(getElementValue('menuFat')) || 0,
            fiber: parseFloat(getElementValue('menuFiber')) || 0,
            sodium: parseInt(getElementValue('menuSodium')) || 0,
            sugar: 0 // menuSugarフィールドは存在しない
        },
        is_vegetarian: getElementChecked('is_vegetarian'),
        is_vegan: getElementChecked('is_vegan'),
        is_gluten_free: getElementChecked('is_gluten_free'),
        last_updated: new Date().toISOString()
    };

    console.log('作成されたメニューオブジェクト:', menu);

    if (editingMenuId) {
        // 編集
        const index = menusData.findIndex(m => m.id === editingMenuId);
        if (index !== -1) {
            menusData[index] = menu;
        }
    } else {
        // 新規追加
        menusData.push(menu);
    }

    // localStorage に保存
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();
    closeMenuModal();

    const message = editingMenuId ? 'メニューを更新しました' : 'メニューを追加しました';
    alert(message);

    console.log('メニュー保存完了');
}

// メニュー画像ファイルアップロード処理
function handleMenuImageFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        updateMenuImagePreview(dataUrl);

        // URLフィールドをクリア（ファイル優先）
        document.getElementById('menuImage').value = '';
    };
    reader.readAsDataURL(file);
}

// メニュー画像プレビュー更新
function updateMenuImagePreview(imageUrl) {
    const previewDiv = document.getElementById('menuImagePreview');
    const previewImg = document.getElementById('menuImagePreviewImg');
    const previewText = document.getElementById('menuImagePreviewText');

    if (imageUrl) {
        previewImg.src = imageUrl;
        previewDiv.style.display = 'block';
        previewText.textContent = 'プレビュー';
    } else {
        previewDiv.style.display = 'none';
    }
}

// レストラン選択肢を設定
function populateRestaurantSelect() {
    const select = document.getElementById('menuRestaurant');
    if (!select) return;

    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // レストランデータから選択肢を追加
    restaurantsData.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.id;
        option.textContent = restaurant.name;
        select.appendChild(option);
    });
}

// 吉野家メニューデータのバッチインポート
function importYoshinoyaMenus() {
    const yoshinoyaMenus = [
        // 丼物メニュー
        {id: 'yoshinoya_gyudon_regular', restaurant_id: 'yoshinoya', name: '牛丼（並盛）', category: '丼', description: '定番の牛丼並盛', price: 426, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 633, protein: 19.6, carbs: 88.2, fat: 23.6, fiber: 0, sodium: 2500}},
        {id: 'yoshinoya_butadon_regular', restaurant_id: 'yoshinoya', name: '豚丼（並盛）', category: '丼', description: '豚肉の旨味たっぷりの豚丼', price: 380, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 576, protein: 14.4, carbs: 88.1, fat: 18.6, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_negishio_butadon', restaurant_id: 'yoshinoya', name: 'ねぎ塩豚丼（並盛）', category: '丼', description: 'ねぎ塩風味の豚丼', price: 450, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 612, protein: 15.2, carbs: 91.5, fat: 20.9, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_negishio_kalbi', restaurant_id: 'yoshinoya', name: 'ねぎ塩牛カルビ丼（並盛）', category: '丼', description: 'ねぎ塩風味の牛カルビ丼', price: 590, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 734, protein: 20.6, carbs: 87.1, fat: 33.4, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_kalbi_don', restaurant_id: 'yoshinoya', name: '牛カルビ丼（並盛）', category: '丼', description: '牛カルビの旨味が詰まった丼', price: 580, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 751, protein: 20.8, carbs: 92.7, fat: 32.7, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_yakiniku_don', restaurant_id: 'yoshinoya', name: '牛焼肉丼（並盛）', category: '丼', description: '牛焼肉がたっぷりの丼', price: 550, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 700, protein: 21.4, carbs: 97.6, fat: 26.2, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_stamina_don', restaurant_id: 'yoshinoya', name: 'スタミナ超特盛丼', category: '丼', description: 'ボリューム満点のスタミナ丼', price: 1200, size: '超特盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 2016, protein: 59.3, carbs: 197.3, fat: 109.3, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_unaju', restaurant_id: 'yoshinoya', name: '鰻重（一枚盛）', category: '丼', description: '香ばしい鰻の重', price: 890, size: '一枚盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 750, protein: 34.5, carbs: 99.9, fat: 26.0, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_karaage_don', restaurant_id: 'yoshinoya', name: 'から揚げ丼（並盛）', category: '丼', description: 'サクサクから揚げの丼', price: 490, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 943, protein: 44.0, carbs: 104.5, fat: 31.9, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_karagyuu', restaurant_id: 'yoshinoya', name: 'から牛（並盛）', category: '丼', description: 'から揚げと牛肉のコラボ', price: 590, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 887, protein: 30.0, carbs: 100.2, fat: 41.0, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_tartar_karaage', restaurant_id: 'yoshinoya', name: 'タルタル南蛮から揚げ丼', category: '丼', description: 'タルタルソースの南蛮から揚げ丼', price: 590, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1230, protein: 34.3, carbs: 116.3, fat: 69.5, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_negishio_karaage', restaurant_id: 'yoshinoya', name: 'ねぎ塩から揚げ丼', category: '丼', description: 'ねぎ塩風味のから揚げ丼', price: 540, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 992, protein: 33.7, carbs: 110.8, fat: 46.0, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_yangnyeom_karaage', restaurant_id: 'yoshinoya', name: 'ヤンニョムから揚げ丼', category: '丼', description: '韓国風ヤンニョムから揚げ丼', price: 540, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1013, protein: 32.9, carbs: 119.7, fat: 44.6, fiber: 0, sodium: 0}},

        // 定食メニュー
        {id: 'yoshinoya_gyu_sake_teishoku', restaurant_id: 'yoshinoya', name: '牛鮭定食', category: '定食', description: '牛肉と鮭の定食', price: 690, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 685, protein: 31.8, carbs: 88.0, fat: 25.0, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_gyu_saba_teishoku', restaurant_id: 'yoshinoya', name: '牛さば定食', category: '定食', description: '牛肉とさばの定食', price: 690, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 738, protein: 26.6, carbs: 88.0, fat: 28.5, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_teppan_kalbi_teishoku', restaurant_id: 'yoshinoya', name: '鉄板牛カルビ定食', category: '定食', description: '鉄板で焼いた牛カルビ定食', price: 790, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 911, protein: 27.4, carbs: 100.2, fat: 43.7, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_teppan_yakiniku_teishoku', restaurant_id: 'yoshinoya', name: '鉄板牛焼肉定食', category: '定食', description: '鉄板で焼いた牛焼肉定食', price: 750, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 811, protein: 26.6, carbs: 106.9, fat: 32.2, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_negishio_buta_teishoku', restaurant_id: 'yoshinoya', name: 'ねぎ塩豚定食', category: '定食', description: 'ねぎ塩豚の定食', price: 650, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 710, protein: 19.4, carbs: 100.2, fat: 26.1, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_negishio_kalbi_teishoku', restaurant_id: 'yoshinoya', name: 'ねぎ塩牛カルビ定食', category: '定食', description: 'ねぎ塩牛カルビの定食', price: 750, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 894, protein: 27.2, carbs: 94.3, fat: 44.6, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_gyusara_teishoku', restaurant_id: 'yoshinoya', name: '牛皿定食', category: '定食', description: '牛皿の定食', price: 590, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 719, protein: 26.4, carbs: 89.5, fat: 29.3, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_unaju_gyu_set', restaurant_id: 'yoshinoya', name: '鰻重牛小鉢セット', category: '定食', description: '鰻重と牛小鉢のセット', price: 1090, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 928, protein: 43.2, carbs: 107.7, fat: 38.5, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_gyusara_kalbi_teishoku', restaurant_id: 'yoshinoya', name: '牛皿・鉄板牛カルビ定食', category: '定食', description: '牛皿と鉄板牛カルビの定食', price: 1090, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1176, protein: 40.3, carbs: 101.9, fat: 66.5, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_gyusara_karaage_teishoku', restaurant_id: 'yoshinoya', name: '牛皿・から揚げ定食', category: '定食', description: '牛皿とから揚げの定食', price: 890, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1244, protein: 46.7, carbs: 112.2, fat: 67.4, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_karaage_teishoku', restaurant_id: 'yoshinoya', name: 'から揚げ定食', category: '定食', description: 'から揚げの定食', price: 690, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1168, protein: 42.2, carbs: 115.9, fat: 59.0, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_tartar_karaage_teishoku', restaurant_id: 'yoshinoya', name: 'タルタル南蛮から揚げ定食', category: '定食', description: 'タルタル南蛮から揚げの定食', price: 890, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 1454, protein: 44.6, carbs: 127.5, fat: 84.6, fiber: 0, sodium: 0}},

        // カレーメニュー
        {id: 'yoshinoya_kuro_curry', restaurant_id: 'yoshinoya', name: '黒カレー', category: 'カレー', description: '深いコクの黒カレー', price: 390, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 503, protein: 8.9, carbs: 103.8, fat: 7.1, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_gyu_kuro_curry', restaurant_id: 'yoshinoya', name: '牛黒カレー', category: 'カレー', description: '牛肉入りの黒カレー', price: 530, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 645, protein: 15.8, carbs: 106.5, fat: 18.6, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_nikudaku_curry', restaurant_id: 'yoshinoya', name: '肉だく牛黒カレー', category: 'カレー', description: '肉たっぷりの黒カレー', price: 630, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 784, protein: 22.4, carbs: 108.9, fat: 30.1, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_cheese_curry', restaurant_id: 'yoshinoya', name: 'チーズ黒カレー', category: 'カレー', description: 'チーズ入りの黒カレー', price: 490, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 609, protein: 15.7, carbs: 104.5, fat: 15.8, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_kalbi_curry', restaurant_id: 'yoshinoya', name: '牛カルビ黒カレー', category: 'カレー', description: '牛カルビ入りの黒カレー', price: 690, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 827, protein: 21.0, carbs: 109.0, fat: 33.9, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_karaage_curry', restaurant_id: 'yoshinoya', name: 'から揚げ黒カレー', category: 'カレー', description: 'から揚げ入りの黒カレー', price: 590, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 899, protein: 26.3, carbs: 117.8, fat: 36.0, fiber: 0, sodium: 0}},

        // サイドメニュー
        {id: 'yoshinoya_gyusara_regular', restaurant_id: 'yoshinoya', name: '牛皿（並盛）', category: 'サイド', description: '牛肉のみの皿', price: 330, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 281, protein: 13.5, carbs: 5.2, fat: 22.9, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_butasara_regular', restaurant_id: 'yoshinoya', name: '豚皿（並盛）', category: 'サイド', description: '豚肉のみの皿', price: 280, size: '並盛', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 232, protein: 8.9, carbs: 6.5, fat: 17.9, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_teppan_kalbi_sara', restaurant_id: 'yoshinoya', name: '鉄板牛カルビ皿', category: 'サイド', description: '鉄板牛カルビのみの皿', price: 490, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 532, protein: 20.0, carbs: 12.6, fat: 42.4, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_cheese_gyu_salad', restaurant_id: 'yoshinoya', name: 'チーズ牛サラダ（ドレッシング除く）', category: 'サラダ', description: 'チーズと牛肉のサラダ', price: 390, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 495, protein: 32.7, carbs: 9.3, fat: 36.8, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_kimchi_gyu_salad', restaurant_id: 'yoshinoya', name: 'キムチ牛サラダ（ドレッシング除く）', category: 'サラダ', description: 'キムチと牛肉のサラダ', price: 390, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 415, protein: 26.8, carbs: 13.6, fat: 28.4, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_vegetable_salad', restaurant_id: 'yoshinoya', name: '生野菜サラダ', category: 'サラダ', description: '新鮮な生野菜のサラダ', price: 120, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 23, protein: 0.9, carbs: 5.2, fat: 0.2, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_miso_soup', restaurant_id: 'yoshinoya', name: 'みそ汁', category: '汁物', description: '定番のみそ汁', price: 60, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 20, protein: 1.3, carbs: 2.5, fat: 0.6, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_ton_soup', restaurant_id: 'yoshinoya', name: 'とん汁', category: '汁物', description: '具だくさんのとん汁', price: 190, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 160, protein: 5.7, carbs: 14.0, fat: 9.1, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_tamago', restaurant_id: 'yoshinoya', name: '玉子', category: 'トッピング', description: '生玉子', price: 60, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 76, protein: 6.2, carbs: 0.2, fat: 5.2, fiber: 0, sodium: 0}},
        {id: 'yoshinoya_hanjuku_tamago', restaurant_id: 'yoshinoya', name: '半熟玉子', category: 'トッピング', description: '半熟の玉子', price: 120, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 76, protein: 6.2, carbs: 0.0, fat: 5.2, fiber: 0, sodium: 0}}
    ];

    // 既存の吉野家メニューを削除
    menusData = menusData.filter(menu => menu.restaurant_id !== 'yoshinoya');

    // 新しいメニューを追加
    yoshinoyaMenus.forEach(menu => {
        menu.last_updated = new Date().toISOString();
        menu.is_vegetarian = false;
        menu.is_vegan = false;
        menu.is_gluten_free = false;
        menusData.push(menu);
    });

    // localStorage に保存
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();

    alert(`吉野家メニュー ${yoshinoyaMenus.length} 件を正常にインポートしました！`);
    console.log('吉野家メニューインポート完了:', yoshinoyaMenus.length, '件');
}

// グローバル関数として登録
window.importYoshinoyaMenus = importYoshinoyaMenus;

// サブウェイメニュー一括インポート関数
function importSubwayMenus() {
    const subwayMenus = [
        // サンドイッチメニュー
        {id: 'subway_blt', restaurant_id: 'subway', name: 'BLT', category: 'サンドイッチ', description: 'ベーコン、レタス、トマトの定番サンドイッチ', price: 460, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-BLT.jpg', nutrition: {calories: 376, protein: 17.6, carbs: 41.5, fat: 15.6, fiber: 5.0, sodium: 2200, sugar: 6.2, saturated_fat: 5.2, trans_fat: 0.0, cholesterol: 45, calcium: 85, iron: 2.5, potassium: 320, vitamin_a: 400, vitamin_c: 8, vitamin_d: 1.2, vitamin_e: 3.5, vitamin_k: 10, thiamin: 0.12, riboflavin: 0.18, niacin: 6.8, vitamin_b6: 0.35, folate: 28, vitamin_b12: 1.5, phosphorus: 165, magnesium: 42, zinc: 2.2, selenium: 18}, allergens: ['卵', '乳', '小麦', '豚肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_shrimp_avocado', restaurant_id: 'subway', name: 'えびアボカド', category: 'サンドイッチ', description: 'プリプリのえびとアボカドの組み合わせ', price: 500, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-shrimp-avocado.jpg', nutrition: {calories: 338, protein: 15.6, carbs: 41.3, fat: 12.3, fiber: 4.5, sodium: 1800, sugar: 5.8, saturated_fat: 3.2, trans_fat: 0.0, cholesterol: 85, calcium: 75, iron: 2.2, potassium: 420, vitamin_a: 380, vitamin_c: 12, vitamin_d: 2.5, vitamin_e: 4.2, vitamin_k: 15, thiamin: 0.15, riboflavin: 0.22, niacin: 5.8, vitamin_b6: 0.42, folate: 35, vitamin_b12: 2.2, phosphorus: 185, magnesium: 55, zinc: 1.8, selenium: 22}, allergens: ['えび', '卵', '乳', '小麦'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_roast_beef', restaurant_id: 'subway', name: 'ローストビーフ', category: 'サンドイッチ', description: 'ジューシーなローストビーフサンドイッチ', price: 520, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-roast-beef.jpg', nutrition: {calories: 316, protein: 19.3, carbs: 40.0, fat: 8.8, fiber: 4.0, sodium: 1900, sugar: 5.2, saturated_fat: 3.8, trans_fat: 0.0, cholesterol: 55, calcium: 80, iron: 3.2, potassium: 380, vitamin_a: 320, vitamin_c: 8, vitamin_d: 1.8, vitamin_e: 2.8, vitamin_k: 12, thiamin: 0.18, riboflavin: 0.25, niacin: 8.5, vitamin_b6: 0.48, folate: 32, vitamin_b12: 2.8, phosphorus: 195, magnesium: 48, zinc: 3.5, selenium: 25}, allergens: ['小麦', '牛肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_teriyaki_chicken', restaurant_id: 'subway', name: 'てり焼きチキン', category: 'サンドイッチ', description: '甘辛いてり焼きソースのチキンサンド', price: 480, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-teriyaki-chicken.jpg', nutrition: {calories: 352, protein: 22.8, carbs: 45.1, fat: 9.0, fiber: 4.8, sodium: 2100, sugar: 8.5, saturated_fat: 2.8, trans_fat: 0.0, cholesterol: 65, calcium: 85, iron: 2.8, potassium: 450, vitamin_a: 420, vitamin_c: 15, vitamin_d: 1.5, vitamin_e: 3.8, vitamin_k: 18, thiamin: 0.22, riboflavin: 0.28, niacin: 12.5, vitamin_b6: 0.68, folate: 38, vitamin_b12: 2.5, phosphorus: 225, magnesium: 58, zinc: 2.8, selenium: 28}, allergens: ['卵', '乳', '小麦', '大豆', '鶏肉', 'りんご'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_prosciutto_mascarpone', restaurant_id: 'subway', name: '生ハム＆マスカルポーネ', category: 'サンドイッチ', description: '生ハムとマスカルポーネチーズの贅沢サンド', price: 550, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-prosciutto-mascarpone.jpg', nutrition: {calories: 358, protein: 19.0, carbs: 38.9, fat: 14.1, fiber: 0, sodium: 2600}, allergens: ['乳', '小麦', '豚肉']},
        {id: 'subway_avocado_bacon', restaurant_id: 'subway', name: 'アボカドベーコン', category: 'サンドイッチ', description: 'アボカドとベーコンの最強コンビ', price: 490, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-avocado-bacon.jpg', nutrition: {calories: 411, protein: 15.7, carbs: 38.6, fat: 21.6, fiber: 0, sodium: 2000}, allergens: ['卵', '乳', '小麦', '豚肉']},
        {id: 'subway_roast_chicken', restaurant_id: 'subway', name: 'ローストチキン', category: 'サンドイッチ', description: 'シンプルなローストチキンサンド', price: 430, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-roast-chicken.jpg', nutrition: {calories: 291, protein: 22.3, carbs: 38.1, fat: 5.5, fiber: 0, sodium: 1600}, allergens: ['小麦', '鶏肉']},
        {id: 'subway_egg', restaurant_id: 'subway', name: 'たまご', category: 'サンドイッチ', description: 'ふわふわたまごのサンドイッチ', price: 420, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-egg.jpg', nutrition: {calories: 387, protein: 15.2, carbs: 39.7, fat: 18.7, fiber: 0, sodium: 1600}, allergens: ['卵', '乳', '小麦']},
        {id: 'subway_tuna', restaurant_id: 'subway', name: 'ツナ', category: 'サンドイッチ', description: 'クリーミーなツナサラダサンド', price: 450, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-tuna.jpg', nutrition: {calories: 370, protein: 15.5, carbs: 39.8, fat: 16.3, fiber: 0, sodium: 1800}, allergens: ['卵', '小麦', 'さば', '大豆']},
        {id: 'subway_turkey_breast', restaurant_id: 'subway', name: 'ターキーブレスト', category: 'サンドイッチ', description: 'ヘルシーなターキーブレストサンド', price: 440, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-turkey-breast.jpg', nutrition: {calories: 266, protein: 19.4, carbs: 38.1, fat: 4.0, fiber: 5.0, sodium: 2000, sugar: 6.2, saturated_fat: 1.2, trans_fat: 0.0, cholesterol: 35, calcium: 95, iron: 2.8, potassium: 340, vitamin_a: 450, vitamin_c: 12, vitamin_d: 2.5, vitamin_e: 3.2, vitamin_k: 8, thiamin: 0.15, riboflavin: 0.18, niacin: 8.5, vitamin_b6: 0.45, folate: 35, vitamin_b12: 1.8, phosphorus: 180, magnesium: 42, zinc: 1.8, selenium: 15}, allergens: ['小麦', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_ham', restaurant_id: 'subway', name: 'ハム', category: 'サンドイッチ', description: 'クラシックなハムサンドイッチ', price: 410, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-ham.jpg', nutrition: {calories: 271, protein: 16.6, carbs: 40.7, fat: 4.7, fiber: 0, sodium: 2200}, allergens: ['小麦', '豚肉']},
        {id: 'subway_salad_chicken', restaurant_id: 'subway', name: 'サラダチキン', category: 'サンドイッチ', description: 'あっさりサラダチキンサンド', price: 440, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-salad-chicken.jpg', nutrition: {calories: 267, protein: 22.9, carbs: 34.4, fat: 4.1, fiber: 0, sodium: 2000}, allergens: ['卵', '乳', '小麦', '大豆', '鶏肉']},
        {id: 'subway_veggie_delight', restaurant_id: 'subway', name: 'ベジーデライト', category: 'サンドイッチ', description: '野菜たっぷりのヘルシーサンド', price: 350, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-veggie-delight.jpg', nutrition: {calories: 216, protein: 8.1, carbs: 39.5, fat: 2.8, fiber: 5.0, sodium: 1400, sugar: 8.5, saturated_fat: 0.8, trans_fat: 0.0, cholesterol: 0, calcium: 85, iron: 2.2, potassium: 280, vitamin_a: 750, vitamin_c: 18, vitamin_d: 0, vitamin_e: 2.8, vitamin_k: 25, thiamin: 0.12, riboflavin: 0.15, niacin: 4.2, vitamin_b6: 0.35, folate: 45, vitamin_b12: 0.0, phosphorus: 120, magnesium: 38, zinc: 1.2, selenium: 8}, allergens: ['小麦'], is_vegetarian: true, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},
        {id: 'subway_avocado_veggie', restaurant_id: 'subway', name: 'アボカドベジー', category: 'サンドイッチ', description: 'アボカド入りベジタリアンサンド', price: 390, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-avocado-veggie.jpg', nutrition: {calories: 289, protein: 9.0, carbs: 39.9, fat: 10.1, fiber: 0, sodium: 1400}, allergens: ['小麦']},
        {id: 'subway_cheese_roast_chicken', restaurant_id: 'subway', name: 'チーズローストチキン', category: 'サンドイッチ', description: 'チーズたっぷりローストチキン', price: 480, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/sandwich/sandwich-cheese-roast-chicken.jpg', nutrition: {calories: 344, protein: 26.5, carbs: 36.6, fat: 10.1, fiber: 0, sodium: 2300}, allergens: ['乳', '小麦', '鶏肉']},

        // サラダメニュー
        {id: 'subway_blt_salad', restaurant_id: 'subway', name: 'BLT サラダ', category: 'サラダ', description: 'BLTの具材をサラダで楽しむ', price: 360, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/salad/salad-variety.jpg', nutrition: {calories: 185, protein: 13.5, carbs: 3.5, fat: 13.0, fiber: 0, sodium: 1400}, allergens: ['乳', '豚肉']},
        {id: 'subway_shrimp_avocado_salad', restaurant_id: 'subway', name: 'えびアボカド サラダ', category: 'サラダ', description: 'えびアボカドの具材をサラダで', price: 400, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/salad/salad-variety.jpg', nutrition: {calories: 147, protein: 11.5, carbs: 3.3, fat: 9.7, fiber: 0, sodium: 1000}, allergens: ['えび', '卵']},
        {id: 'subway_roast_beef_salad', restaurant_id: 'subway', name: 'ローストビーフ サラダ', category: 'サラダ', description: 'ローストビーフの具材をサラダで', price: 420, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/salad/salad-variety.jpg', nutrition: {calories: 125, protein: 15.2, carbs: 2.0, fat: 6.2, fiber: 0, sodium: 1100}, allergens: ['牛肉']},
        {id: 'subway_teriyaki_chicken_salad', restaurant_id: 'subway', name: 'てり焼きチキン サラダ', category: 'サラダ', description: 'てり焼きチキンの具材をサラダで', price: 380, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/salad/salad-variety.jpg', nutrition: {calories: 123, protein: 18.7, carbs: 3.8, fat: 3.6, fiber: 0, sodium: 1100}, allergens: ['卵', '乳', '小麦', '大豆', '鶏肉', 'りんご']},
        {id: 'subway_salad_chicken_salad', restaurant_id: 'subway', name: 'サラダチキン サラダ', category: 'サラダ', description: 'サラダチキンの具材をサラダで', price: 340, size: 'レギュラー', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/salad/salad-variety.jpg', nutrition: {calories: 76, protein: 14.8, carbs: 0.8, fat: 1.5, fiber: 0, sodium: 1200}, allergens: ['卵', '乳', '小麦', '大豆', '鶏肉']},

        // サイドメニュー
        {id: 'subway_oven_potato_s', restaurant_id: 'subway', name: 'オーブンポテト (S)', category: 'サイド', description: 'カリッと焼き上げたポテト', price: 200, size: 'S', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/side/side-oven-potato.jpg', nutrition: {calories: 162, protein: 2.6, carbs: 19.9, fat: 8.0, fiber: 0, sodium: 800}, allergens: ['小麦', '大豆']},
        {id: 'subway_chicken_nuggets', restaurant_id: 'subway', name: 'チキンナゲット (5個)', category: 'サイド', description: 'サクサクのチキンナゲット', price: 250, size: '5個', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/side/side-chicken-nuggets.jpg', nutrition: {calories: 180, protein: 11.2, carbs: 10.3, fat: 10.4, fiber: 0, sodium: 800}, allergens: ['小麦', '大豆', '鶏肉']},
        {id: 'subway_cookie_chocolate', restaurant_id: 'subway', name: 'チョコチップクッキー', category: 'デザート', description: 'チョコチップたっぷりのクッキー', price: 150, size: '1枚', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/dessert/dessert-cookie.jpg', nutrition: {calories: 220, protein: 3, carbs: 30, fat: 10, fiber: 0, sodium: 200}, allergens: ['卵', '乳', '小麦', '大豆']},
        {id: 'subway_anko_mascarpone', restaurant_id: 'subway', name: 'あんこ＆マスカルポーネ', category: 'デザート', description: 'あんことマスカルポーネの和洋折衷デザート', price: 180, size: '1個', image: 'https://www.subway.co.jp/content/dam/subway/japan/menu/dessert/dessert-anko-mascarpone.jpg', nutrition: {calories: 198, protein: 4.8, carbs: 31.6, fat: 5.8, fiber: 0, sodium: 500}, allergens: ['乳', '小麦', '大豆']}
    ];

    console.log('サブウェイメニューインポート開始:', subwayMenus.length, '件');

    // レストランIDの確認とサブウェイレストラン追加（存在しない場合）
    if (!restaurantsData.find(r => r.id === 'subway')) {
        const subwayRestaurant = {
            id: 'subway',
            name: 'サブウェイ',
            category: 'サンドイッチ',
            logo: 'https://images.unsplash.com/photo-1594007644511-f3ed07bd9f10?w=150&h=150&fit=crop',
            description: '新鮮な野菜とお好みの具材でカスタマイズできるサンドイッチチェーン'
        };
        restaurantsData.push(subwayRestaurant);
        console.log('サブウェイレストラン追加完了');
    }

    // 既存のサブウェイメニューを削除
    menusData = menusData.filter(menu => menu.restaurant_id !== 'subway');

    // 新しいサブウェイメニューを追加
    menusData.push(...subwayMenus);

    // データ保存
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();

    alert(`サブウェイメニュー ${subwayMenus.length} 件を正常にインポートしました！`);
    console.log('サブウェイメニューインポート完了:', subwayMenus.length, '件');
}

// グローバル関数として登録
window.importSubwayMenus = importSubwayMenus;

// 大戸屋メニュー一括インポート関数
function importOotoyaMenus() {
    const ootoyaMenus = [
        // コラボメニュー
        {id: 'ootoya_karasuno_power', restaurant_id: 'ootoya', name: '【第1弾】烏野高校：飛ぶ準備は、ここから！「瞬発力ブースト飯」', category: 'コラボ定食', description: 'ハイキュー!!コラボメニュー：瞬発力をサポートする高エネルギー定食', price: 1480, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop', nutrition: {calories: 1209, protein: 54.4, carbs: 118.5, fat: 51.1, fiber: 7.9, sodium: 7100, sugar: 15.0, saturated_fat: 15.2, trans_fat: 0.0, cholesterol: 145, calcium: 180, iron: 4.8, potassium: 920, vitamin_a: 850, vitamin_c: 25, vitamin_d: 3.5, vitamin_e: 8.2, vitamin_k: 18, thiamin: 0.28, riboflavin: 0.42, niacin: 15.8, vitamin_b6: 0.85, folate: 68, vitamin_b12: 3.2, phosphorus: 385, magnesium: 95, zinc: 4.8, selenium: 35}, allergens: ['小麦', '卵', '乳', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: true, added_date: '2024-10-01', last_updated: '2024-12-01'},

        {id: 'ootoya_aoba_balance', restaurant_id: 'ootoya', name: '【第1弾】青葉城西高校：絶妙コンビネーションで奏でる「相乗効果バランス飯」', category: 'コラボ定食', description: 'ハイキュー!!コラボメニュー：栄養バランスを重視した定食', price: 1480, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop', nutrition: {calories: 1195, protein: 35.3, carbs: 131.6, fat: 53.5, fiber: 15.4, sodium: 6300, sugar: 18.2, saturated_fat: 16.8, trans_fat: 0.0, cholesterol: 95, calcium: 220, iron: 5.2, potassium: 1150, vitamin_a: 1200, vitamin_c: 45, vitamin_d: 2.8, vitamin_e: 12.5, vitamin_k: 35, thiamin: 0.32, riboflavin: 0.38, niacin: 12.2, vitamin_b6: 0.95, folate: 85, vitamin_b12: 2.8, phosphorus: 420, magnesium: 125, zinc: 3.8, selenium: 28}, allergens: ['小麦', '卵', '乳', '大豆'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: true, added_date: '2024-10-01', last_updated: '2024-12-01'},

        {id: 'ootoya_shiratorizawa_power', restaurant_id: 'ootoya', name: '【第1弾】白鳥沢学園高校：シンプルな強さは、積み重ね「パワーチャージ飯」', category: 'コラボ定食', description: 'ハイキュー!!コラボメニュー：シンプルで力強い定食', price: 1480, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop', nutrition: {calories: 1100, protein: 46.1, carbs: 99.5, fat: 31.1, fiber: 3.3, sodium: 4400, sugar: 12.8, saturated_fat: 9.5, trans_fat: 0.0, cholesterol: 125, calcium: 150, iron: 4.2, potassium: 850, vitamin_a: 680, vitamin_c: 18, vitamin_d: 3.2, vitamin_e: 6.8, vitamin_k: 12, thiamin: 0.25, riboflavin: 0.35, niacin: 14.5, vitamin_b6: 0.78, folate: 52, vitamin_b12: 3.8, phosphorus: 345, magnesium: 85, zinc: 4.2, selenium: 32}, allergens: ['小麦', '卵', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: true, added_date: '2024-10-01', last_updated: '2024-12-01'},

        // メイン定食
        {id: 'ootoya_sanma_charcoal', restaurant_id: 'ootoya', name: '生さんまの炭火焼き', category: '定食', description: '脂ののった生さんまを炭火でじっくり焼き上げた定食', price: 1380, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop', nutrition: {calories: 990, protein: 43.2, carbs: 77.0, fat: 51.0, fiber: 4.2, sodium: 6400, sugar: 8.5, saturated_fat: 12.8, trans_fat: 0.0, cholesterol: 85, calcium: 125, iron: 3.8, potassium: 680, vitamin_a: 450, vitamin_c: 12, vitamin_d: 15.5, vitamin_e: 8.5, vitamin_k: 8, thiamin: 0.18, riboflavin: 0.28, niacin: 12.8, vitamin_b6: 0.65, folate: 42, vitamin_b12: 8.5, phosphorus: 285, magnesium: 75, zinc: 2.8, selenium: 45}, allergens: ['魚'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: true, added_date: '2024-09-01', last_updated: '2024-12-01'},

        {id: 'ootoya_oyster_ankake', restaurant_id: 'ootoya', name: '牡蠣の酸辣あんかけ焼きそば', category: '麺類', description: '大粒の牡蠣と野菜を酸辣あんで仕上げた焼きそば', price: 1280, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1582867776454-2a8b2cbd4ab0?w=300&h=200&fit=crop', nutrition: {calories: 950, protein: 26.8, carbs: 105.1, fat: 42.8, fiber: 7.5, sodium: 12000, sugar: 12.5, saturated_fat: 8.5, trans_fat: 0.0, cholesterol: 95, calcium: 185, iron: 12.5, potassium: 850, vitamin_a: 680, vitamin_c: 28, vitamin_d: 2.8, vitamin_e: 6.5, vitamin_k: 18, thiamin: 0.22, riboflavin: 0.28, niacin: 8.5, vitamin_b6: 0.45, folate: 85, vitamin_b12: 18.5, phosphorus: 285, magnesium: 125, zinc: 8.5, selenium: 42}, allergens: ['小麦', '卵', '魚介'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-11-01', last_updated: '2024-12-01'},

        {id: 'ootoya_chicken_oyako', restaurant_id: 'ootoya', name: '炭火焼き鶏の親子重', category: '重', description: '炭火で香ばしく焼いた鶏肉の親子重', price: 1180, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1604413191989-cb001e3c30d8?w=300&h=200&fit=crop', nutrition: {calories: 967, protein: 50.3, carbs: 104.9, fat: 37.8, fiber: 4.9, sodium: 7200, sugar: 15.2, saturated_fat: 11.5, trans_fat: 0.0, cholesterol: 385, calcium: 95, iron: 4.2, potassium: 520, vitamin_a: 820, vitamin_c: 8, vitamin_d: 2.8, vitamin_e: 4.5, vitamin_k: 12, thiamin: 0.28, riboflavin: 0.52, niacin: 18.5, vitamin_b6: 0.85, folate: 68, vitamin_b12: 2.8, phosphorus: 385, magnesium: 68, zinc: 3.8, selenium: 35}, allergens: ['卵', '小麦', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'ootoya_pork_miso_stir_fry', restaurant_id: 'ootoya', name: '豚と野菜の味噌炒め', category: '定食', description: '豚肉と季節野菜を特製味噌ダレで炒めた定食', price: 1080, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', nutrition: {calories: 887, protein: 44.8, carbs: 74.0, fat: 40.6, fiber: 7.4, sodium: 5800, sugar: 9.5, saturated_fat: 12.5, trans_fat: 0.0, cholesterol: 125, calcium: 125, iron: 3.8, potassium: 890, vitamin_a: 950, vitamin_c: 42, vitamin_d: 1.5, vitamin_e: 5.8, vitamin_k: 28, thiamin: 0.85, riboflavin: 0.28, niacin: 12.5, vitamin_b6: 0.68, folate: 85, vitamin_b12: 2.2, phosphorus: 285, magnesium: 95, zinc: 3.5, selenium: 28}, allergens: ['小麦', '大豆', '豚肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'ootoya_chicken_kaasan', restaurant_id: 'ootoya', name: 'チキンかあさん煮定食', category: '定食', description: '鶏肉を優しい味付けで煮込んだ家庭的な定食', price: 980, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1604413191989-cb001e3c30d8?w=300&h=200&fit=crop', nutrition: {calories: 831, protein: 54.5, carbs: 89.4, fat: 27.4, fiber: 5.5, sodium: 5400, sugar: 12.8, saturated_fat: 8.5, trans_fat: 0.0, cholesterol: 145, calcium: 95, iron: 3.2, potassium: 680, vitamin_a: 580, vitamin_c: 18, vitamin_d: 1.8, vitamin_e: 4.2, vitamin_k: 15, thiamin: 0.22, riboflavin: 0.35, niacin: 16.8, vitamin_b6: 0.75, folate: 52, vitamin_b12: 2.5, phosphorus: 345, magnesium: 78, zinc: 3.2, selenium: 32}, allergens: ['小麦', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // 魚メニュー
        {id: 'ootoya_saba_miso', restaurant_id: 'ootoya', name: 'さばの味噌煮定食', category: '定食', description: '脂ののったさばを特製味噌で煮込んだ定食', price: 1180, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300&h=200&fit=crop', nutrition: {calories: 957, protein: 46.0, carbs: 89.6, fat: 46.8, fiber: 5.4, sodium: 5400, sugar: 15.2, saturated_fat: 12.8, trans_fat: 0.0, cholesterol: 95, calcium: 185, iron: 3.8, potassium: 680, vitamin_a: 450, vitamin_c: 12, vitamin_d: 8.5, vitamin_e: 5.8, vitamin_k: 8, thiamin: 0.18, riboflavin: 0.35, niacin: 12.5, vitamin_b6: 0.55, folate: 42, vitamin_b12: 12.5, phosphorus: 285, magnesium: 85, zinc: 2.8, selenium: 45}, allergens: ['魚', '大豆'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // 丼・重
        {id: 'ootoya_tofu_tororo_don', restaurant_id: 'ootoya', name: '手造り豆腐のトロロ丼', category: '丼', description: '手作り豆腐とトロロの優しい丼', price: 780, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop', nutrition: {calories: 618, protein: 29.3, carbs: 86.4, fat: 16.5, fiber: 6.4, sodium: 3900, sugar: 8.5, saturated_fat: 2.8, trans_fat: 0.0, cholesterol: 0, calcium: 285, iron: 4.2, potassium: 680, vitamin_a: 125, vitamin_c: 8, vitamin_d: 0, vitamin_e: 8.5, vitamin_k: 45, thiamin: 0.18, riboflavin: 0.22, niacin: 2.8, vitamin_b6: 0.28, folate: 95, vitamin_b12: 0.0, phosphorus: 285, magnesium: 125, zinc: 2.8, selenium: 12}, allergens: ['大豆'], is_vegetarian: true, is_vegan: true, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'ootoya_bakudan_don', restaurant_id: 'ootoya', name: 'ばくだん丼', category: '丼', description: 'まぐろ、納豆、オクラなどの具材を盛り込んだ丼', price: 880, size: 'レギュラー', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop', nutrition: {calories: 602, protein: 35.4, carbs: 70.8, fat: 18.7, fiber: 6.5, sodium: 3800, sugar: 6.8, saturated_fat: 4.2, trans_fat: 0.0, cholesterol: 45, calcium: 125, iron: 4.8, potassium: 750, vitamin_a: 580, vitamin_c: 15, vitamin_d: 8.5, vitamin_e: 6.5, vitamin_k: 85, thiamin: 0.18, riboflavin: 0.28, niacin: 8.5, vitamin_b6: 0.45, folate: 125, vitamin_b12: 8.5, phosphorus: 285, magnesium: 85, zinc: 2.8, selenium: 35}, allergens: ['魚', '大豆', '卵'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'}
    ];

    console.log('大戸屋メニューインポート開始:', ootoyaMenus.length, '件');

    // レストランIDの確認と大戸屋レストラン追加（存在しない場合）
    if (!restaurantsData.find(r => r.id === 'ootoya')) {
        const ootoyaRestaurant = {
            id: 'ootoya',
            name: '大戸屋',
            category: '定食・丼',
            logo: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=150&h=150&fit=crop',
            description: '和風の定食と丼を中心とした、栄養バランスの取れた食事を提供するレストランチェーン'
        };
        restaurantsData.push(ootoyaRestaurant);
        console.log('大戸屋レストラン追加完了');
    }

    // 既存の大戸屋メニューを削除
    menusData = menusData.filter(menu => menu.restaurant_id !== 'ootoya');

    // 新しい大戸屋メニューを追加
    menusData.push(...ootoyaMenus);

    // データ保存
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();

    alert(`大戸屋メニュー ${ootoyaMenus.length} 件を正常にインポートしました！`);
    console.log('大戸屋メニューインポート完了:', ootoyaMenus.length, '件');
}

// グローバル関数として登録
window.importOotoyaMenus = importOotoyaMenus;

// やよい軒メニュー一括インポート関数
function importYayoikenMenus() {
    const yayoikenMenus = [
        // 肉系メイン定食
        {id: 'yayoiken_ginger_pork', restaurant_id: 'yayoiken', name: 'しょうが焼定食', category: '定食', description: '豚の生姜焼きをメインとした定番定食', price: 690, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_533s.jpg', nutrition: {calories: 746, protein: 24.7, carbs: 72.6, fat: 28.5, fiber: 4.8, sodium: 4300, sugar: 8.5, saturated_fat: 9.2, trans_fat: 0.0, cholesterol: 85, calcium: 95, iron: 2.8, potassium: 680, vitamin_a: 420, vitamin_c: 15, vitamin_d: 1.5, vitamin_e: 4.2, vitamin_k: 12, thiamin: 0.85, riboflavin: 0.25, niacin: 8.5, vitamin_b6: 0.45, folate: 42, vitamin_b12: 2.2, phosphorus: 285, magnesium: 68, zinc: 3.2, selenium: 25}, allergens: ['小麦', '大豆', '豚肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_meat_veggie_stir_fry', restaurant_id: 'yayoiken', name: '肉野菜炒め定食', category: '定食', description: '豚肉と野菜たっぷりの炒め物定食', price: 630, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_534s.jpg', nutrition: {calories: 574, protein: 24.7, carbs: 70.7, fat: 17.5, fiber: 6.8, sodium: 5000, sugar: 12.5, saturated_fat: 5.2, trans_fat: 0.0, cholesterol: 65, calcium: 125, iron: 3.2, potassium: 850, vitamin_a: 950, vitamin_c: 45, vitamin_d: 1.2, vitamin_e: 6.5, vitamin_k: 35, thiamin: 0.65, riboflavin: 0.28, niacin: 8.2, vitamin_b6: 0.55, folate: 85, vitamin_b12: 1.8, phosphorus: 285, magnesium: 85, zinc: 2.8, selenium: 22}, allergens: ['小麦', '大豆', '豚肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_chicken_nanban', restaurant_id: 'yayoiken', name: 'チキン南蛮定食', category: '定食', description: 'タルタルソースたっぷりのチキン南蛮定食', price: 790, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_535s.jpg', nutrition: {calories: 1067, protein: 31.4, carbs: 104.0, fat: 55.6, fiber: 5.2, sodium: 5700, sugar: 15.8, saturated_fat: 14.2, trans_fat: 0.0, cholesterol: 185, calcium: 125, iron: 3.5, potassium: 580, vitamin_a: 680, vitamin_c: 12, vitamin_d: 2.8, vitamin_e: 8.5, vitamin_k: 15, thiamin: 0.22, riboflavin: 0.42, niacin: 15.8, vitamin_b6: 0.68, folate: 58, vitamin_b12: 2.8, phosphorus: 345, magnesium: 75, zinc: 3.5, selenium: 32}, allergens: ['小麦', '卵', '乳', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_karaage', restaurant_id: 'yayoiken', name: 'から揚げ定食', category: '定食', description: 'ジューシーな鶏の唐揚げ定食', price: 690, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_536s.jpg', nutrition: {calories: 968, protein: 42.4, carbs: 82.2, fat: 54.4, fiber: 4.5, sodium: 4900, sugar: 12.5, saturated_fat: 12.8, trans_fat: 0.0, cholesterol: 145, calcium: 85, iron: 3.2, potassium: 580, vitamin_a: 450, vitamin_c: 8, vitamin_d: 2.2, vitamin_e: 6.5, vitamin_k: 12, thiamin: 0.25, riboflavin: 0.35, niacin: 18.5, vitamin_b6: 0.75, folate: 48, vitamin_b12: 2.5, phosphorus: 385, magnesium: 68, zinc: 3.8, selenium: 35}, allergens: ['小麦', '卵', '乳', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_special_karaage', restaurant_id: 'yayoiken', name: '特から揚げ定食', category: '定食', description: '大きめの鶏の唐揚げをボリュームアップした定食', price: 790, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_537s.jpg', nutrition: {calories: 1152, protein: 54.4, carbs: 89.0, fat: 63.2, fiber: 5.2, sodium: 5700, sugar: 14.8, saturated_fat: 15.2, trans_fat: 0.0, cholesterol: 185, calcium: 95, iron: 3.8, potassium: 650, vitamin_a: 520, vitamin_c: 10, vitamin_d: 2.8, vitamin_e: 7.5, vitamin_k: 15, thiamin: 0.32, riboflavin: 0.42, niacin: 22.5, vitamin_b6: 0.85, folate: 58, vitamin_b12: 3.2, phosphorus: 445, magnesium: 78, zinc: 4.5, selenium: 42}, allergens: ['小麦', '卵', '乳', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // 魚系メイン定食
        {id: 'yayoiken_saba_shioyaki', restaurant_id: 'yayoiken', name: 'サバの塩焼定食', category: '定食', description: '脂ののったサバの塩焼き定食', price: 690, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_558s.jpg', nutrition: {calories: 715, protein: 24.4, carbs: 63.6, fat: 30.4, fiber: 4.2, sodium: 2000, sugar: 6.8, saturated_fat: 8.5, trans_fat: 0.0, cholesterol: 75, calcium: 185, iron: 3.2, potassium: 680, vitamin_a: 420, vitamin_c: 12, vitamin_d: 12.5, vitamin_e: 5.8, vitamin_k: 8, thiamin: 0.18, riboflavin: 0.32, niacin: 12.8, vitamin_b6: 0.55, folate: 42, vitamin_b12: 12.5, phosphorus: 285, magnesium: 85, zinc: 2.5, selenium: 45}, allergens: ['魚'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_saba_miso', restaurant_id: 'yayoiken', name: 'サバの味噌煮定食', category: '定食', description: '味噌で煮込んだサバの定食', price: 690, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_559s.jpg', nutrition: {calories: 650, protein: 22.0, carbs: 72.3, fat: 18.2, fiber: 5.5, sodium: 3200, sugar: 15.2, saturated_fat: 5.2, trans_fat: 0.0, cholesterol: 65, calcium: 185, iron: 3.5, potassium: 680, vitamin_a: 380, vitamin_c: 12, vitamin_d: 8.5, vitamin_e: 4.8, vitamin_k: 8, thiamin: 0.15, riboflavin: 0.28, niacin: 8.5, vitamin_b6: 0.45, folate: 48, vitamin_b12: 8.5, phosphorus: 285, magnesium: 95, zinc: 2.2, selenium: 35}, allergens: ['魚', '大豆'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_hokke', restaurant_id: 'yayoiken', name: 'しまほっけ定食', category: '定食', description: 'しまほっけの焼き魚定食', price: 790, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_560s.jpg', nutrition: {calories: 660, protein: 38.6, carbs: 63.1, fat: 26.2, fiber: 4.2, sodium: 2500, sugar: 6.5, saturated_fat: 6.8, trans_fat: 0.0, cholesterol: 95, calcium: 125, iron: 2.8, potassium: 750, vitamin_a: 450, vitamin_c: 8, vitamin_d: 15.5, vitamin_e: 6.2, vitamin_k: 8, thiamin: 0.18, riboflavin: 0.25, niacin: 15.8, vitamin_b6: 0.65, folate: 35, vitamin_b12: 15.5, phosphorus: 385, magnesium: 85, zinc: 2.8, selenium: 55}, allergens: ['魚'], is_vegetarian: false, is_vegan: false, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // ハンバーグ系定食
        {id: 'yayoiken_oroshi_hamburg', restaurant_id: 'yayoiken', name: '和風おろしハンバーグ定食', category: '定食', description: '大根おろしでさっぱりとした和風ハンバーグ定食', price: 790, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_550s.jpg', nutrition: {calories: 878, protein: 31.9, carbs: 100.8, fat: 25.8, fiber: 6.2, sodium: 4800, sugar: 18.5, saturated_fat: 9.5, trans_fat: 0.0, cholesterol: 125, calcium: 125, iron: 4.2, potassium: 780, vitamin_a: 580, vitamin_c: 25, vitamin_d: 2.2, vitamin_e: 6.5, vitamin_k: 22, thiamin: 0.28, riboflavin: 0.35, niacin: 12.5, vitamin_b6: 0.58, folate: 68, vitamin_b12: 2.8, phosphorus: 345, magnesium: 95, zinc: 4.2, selenium: 28}, allergens: ['小麦', '卵', '乳', '牛肉', '大豆'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_demi_hamburg', restaurant_id: 'yayoiken', name: 'デミハンバーグ定食', category: '定食', description: 'デミグラスソースのハンバーグ定食', price: 790, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_551s.jpg', nutrition: {calories: 859, protein: 31.7, carbs: 94.1, fat: 26.9, fiber: 5.8, sodium: 3900, sugar: 22.5, saturated_fat: 10.2, trans_fat: 0.0, cholesterol: 125, calcium: 95, iron: 4.5, potassium: 680, vitamin_a: 520, vitamin_c: 18, vitamin_d: 2.2, vitamin_e: 5.8, vitamin_k: 15, thiamin: 0.25, riboflavin: 0.32, niacin: 12.8, vitamin_b6: 0.55, folate: 58, vitamin_b12: 2.8, phosphorus: 345, magnesium: 85, zinc: 4.2, selenium: 28}, allergens: ['小麦', '卵', '乳', '牛肉', '大豆', '豚肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // コンビネーション定食
        {id: 'yayoiken_nanban_ebi_combo', restaurant_id: 'yayoiken', name: 'チキン南蛮とエビフライの定食', category: 'コンビ定食', description: 'チキン南蛮とエビフライの人気コンビ定食', price: 990, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_556s.jpg', nutrition: {calories: 1286, protein: 35.1, carbs: 114.3, fat: 72.8, fiber: 6.5, sodium: 6000, sugar: 18.5, saturated_fat: 18.5, trans_fat: 0.0, cholesterol: 245, calcium: 145, iron: 4.2, potassium: 650, vitamin_a: 720, vitamin_c: 15, vitamin_d: 3.5, vitamin_e: 12.5, vitamin_k: 18, thiamin: 0.28, riboflavin: 0.52, niacin: 18.5, vitamin_b6: 0.78, folate: 68, vitamin_b12: 3.5, phosphorus: 385, magnesium: 85, zinc: 4.2, selenium: 45}, allergens: ['小麦', '卵', '乳', 'えび', '大豆', '鶏肉'], is_vegetarian: false, is_vegan: false, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        // ベジタリアン対応メニュー
        {id: 'yayoiken_soy_ginger', restaurant_id: 'yayoiken', name: '大豆ミートのしょうが焼定食', category: '植物性定食', description: '大豆ミートを使用したヘルシーなしょうが焼定食', price: 690, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_541s.jpg', nutrition: {calories: 601, protein: 18.0, carbs: 77.3, fat: 15.6, fiber: 8.5, sodium: 4700, sugar: 12.5, saturated_fat: 2.8, trans_fat: 0.0, cholesterol: 0, calcium: 185, iron: 4.2, potassium: 680, vitamin_a: 420, vitamin_c: 15, vitamin_d: 0, vitamin_e: 8.5, vitamin_k: 25, thiamin: 0.35, riboflavin: 0.22, niacin: 5.8, vitamin_b6: 0.45, folate: 95, vitamin_b12: 0.0, phosphorus: 285, magnesium: 125, zinc: 3.2, selenium: 12}, allergens: ['小麦', '大豆'], is_vegetarian: true, is_vegan: true, is_gluten_free: false, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'},

        {id: 'yayoiken_soy_veggie_stir_fry', restaurant_id: 'yayoiken', name: '大豆ミートの野菜炒め定食', category: '植物性定食', description: '大豆ミートと野菜の炒め物定食', price: 630, size: 'レギュラー', image: 'https://www.yayoiken.com/files/menu_img/sp_542s.jpg', nutrition: {calories: 437, protein: 18.0, carbs: 74.6, fat: 6.0, fiber: 9.8, sodium: 5200, sugar: 15.5, saturated_fat: 1.2, trans_fat: 0.0, cholesterol: 0, calcium: 225, iron: 5.2, potassium: 950, vitamin_a: 1250, vitamin_c: 58, vitamin_d: 0, vitamin_e: 12.5, vitamin_k: 58, thiamin: 0.42, riboflavin: 0.28, niacin: 6.5, vitamin_b6: 0.68, folate: 125, vitamin_b12: 0.0, phosphorus: 285, magnesium: 145, zinc: 2.8, selenium: 8}, allergens: ['大豆'], is_vegetarian: true, is_vegan: true, is_gluten_free: true, available: true, seasonal: false, added_date: '2024-01-01', last_updated: '2024-12-01'}
    ];

    console.log('やよい軒メニューインポート開始:', yayoikenMenus.length, '件');

    // レストランIDの確認とやよい軒レストラン追加（存在しない場合）
    if (!restaurantsData.find(r => r.id === 'yayoiken')) {
        const yayoikenRestaurant = {
            id: 'yayoiken',
            name: 'やよい軒',
            category: '定食',
            logo: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=150&h=150&fit=crop',
            description: '手作りの味にこだわった、バランスの取れた定食を提供するレストランチェーン'
        };
        restaurantsData.push(yayoikenRestaurant);
        console.log('やよい軒レストラン追加完了');
    }

    // 既存のやよい軒メニューを削除
    menusData = menusData.filter(menu => menu.restaurant_id !== 'yayoiken');

    // 新しいやよい軒メニューを追加
    menusData.push(...yayoikenMenus);

    // データ保存
    saveRestaurantDataToStorage();

    // 表示更新
    updateDisplaysAfterSave();

    alert(`やよい軒メニュー ${yayoikenMenus.length} 件を正常にインポートしました！`);
    console.log('やよい軒メニューインポート完了:', yayoikenMenus.length, '件');
}

// グローバル関数として登録
window.importYayoikenMenus = importYayoikenMenus;

console.log('🎯 ULTRATHINK SUCCESS: admin-simple-v2.js読み込み完了 - NUTRITION FIELD FIXED - menuCalories/menuProtein対応版');