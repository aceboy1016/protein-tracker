class FoodDatabase {
    constructor() {
        this.foods = [];
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderFoods();
    }

    async loadData() {
        try {
            const response = await fetch('data/protein-data.json');
            const data = await response.json();

            this.foods = [];
            Object.keys(data).forEach(category => {
                this.foods.push(...data[category]);
            });
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            this.showError('食材データの読み込みに失敗しました。');
        }
    }

    setupEventListeners() {
        // 検索機能
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.renderFoods(e.target.value);
        });

        // カテゴリーフィルター
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // アクティブタブの切り替え
                filterTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                this.currentCategory = e.target.dataset.category;
                this.renderFoods(searchInput.value);
            });
        });

        // ソート機能
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderFoods(searchInput.value);
        });
    }

    filterFoods(searchTerm = '') {
        let filtered = this.foods;

        // カテゴリーフィルター
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(food => food.category === this.getCategoryName(this.currentCategory));
        }

        // 検索フィルター
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(food =>
                food.name.toLowerCase().includes(term)
            );
        }

        return filtered;
    }

    sortFoods(foods) {
        return [...foods].sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name, 'ja');
                case 'protein_desc':
                    return b.protein_per_100g - a.protein_per_100g;
                case 'protein_asc':
                    return a.protein_per_100g - b.protein_per_100g;
                case 'serving_desc':
                    return b.protein_per_serving - a.protein_per_serving;
                case 'serving_asc':
                    return a.protein_per_serving - b.protein_per_serving;
                default:
                    return 0;
            }
        });
    }

    getCategoryName(category) {
        const categoryMap = {
            'fish': '魚介類',
            'meat': '肉類',
            'eggs': '卵類',
            'dairy': '乳製品',
            'beans': '豆類',
            'other': 'その他'
        };
        return categoryMap[category] || category;
    }

    renderFoods(searchTerm = '') {
        const container = document.getElementById('foodContainer');
        const filtered = this.filterFoods(searchTerm);
        const sorted = this.sortFoods(filtered);

        if (sorted.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <p>条件に一致する食材が見つかりませんでした。</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">検索条件やカテゴリーを変更してお試しください。</p>
                </div>
            `;
            return;
        }

        const foodCards = sorted.map(food => this.createFoodCard(food)).join('');
        container.innerHTML = `
            <div class="fade-in">
                <div style="margin-bottom: 1rem; color: var(--text-light); text-align: center;">
                    ${sorted.length}件の食材が見つかりました
                </div>
                ${foodCards}
            </div>
        `;
    }

    createFoodCard(food) {
        const categoryShortName = this.getCategoryShortName(food.category);
        return `
            <div class="food-item fade-in">
                <div class="food-icon">${categoryShortName}</div>
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div class="food-details">
                        ${food.serving_size} | ${food.category}
                    </div>
                    <div class="food-details">
                        100gあたり: ${food.protein_per_100g}g
                    </div>
                </div>
                <div class="protein-amount">
                    ${food.protein_per_serving}g
                </div>
            </div>
        `;
    }

    getCategoryShortName(category) {
        const categoryMap = {
            '魚介類': 'FISH',
            '肉類': 'MEAT',
            '卵類': 'EGG',
            '乳製品': 'MILK',
            '豆類': 'BEAN',
            'その他': 'OTHER'
        };
        return categoryMap[category] || 'FOOD';
    }

    showError(message) {
        const container = document.getElementById('foodContainer');
        container.innerHTML = `
            <div class="error">
                <strong>エラー:</strong> ${message}
            </div>
        `;
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new FoodDatabase();
});