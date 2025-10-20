// シンプルな管理画面 - レストランロゴ機能付き

// グローバル変数
let restaurantsData = [];
let menusData = [];
let editingRestaurantId = null;

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

    // モーダル強制表示
    const modal = document.getElementById('restaurantModal');
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';

    // モーダルコンテンツのスタイル設定
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.position = 'relative';
        modalContent.style.top = '50%';
        modalContent.style.left = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '1rem';
        modalContent.style.maxWidth = '600px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflow = 'auto';
    }

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

    // モーダル強制表示
    const modal = document.getElementById('restaurantModal');
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';

    // モーダルコンテンツのスタイル設定
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.position = 'relative';
        modalContent.style.top = '50%';
        modalContent.style.left = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '1rem';
        modalContent.style.maxWidth = '600px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflow = 'auto';
    }

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

// メニュー管理用のダミー関数
function editMenu(menuId) {
    alert(`メニュー編集機能は現在実装中です (ID: ${menuId})`);
}

function deleteMenu(menuId) {
    if (!confirm('このメニューを削除しますか？')) return;

    const index = menusData.findIndex(m => m.id === menuId);
    if (index !== -1) {
        menusData.splice(index, 1);

        // localStorage に保存（重要！）
        saveRestaurantDataToStorage();

        updateDisplaysAfterSave();
        alert('メニューを削除しました');
    }
}

function showAddMenuModal() {
    alert('メニュー追加機能は現在実装中です');
}

console.log('admin-simple.js読み込み完了');