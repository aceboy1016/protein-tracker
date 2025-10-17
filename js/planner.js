class MealPlanner {
    constructor() {
        this.foods = [];
        this.currentTarget = 70;
        this.mealTargets = {
            breakfast: 20,
            lunch: 25,
            dinner: 25
        };
        this.meals = {
            breakfast: [],
            lunch: [],
            dinner: []
        };
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.populateFoodSelectors();
        this.initTemplates();
        this.initCharts();
        // チャート初期化後に表示を更新
        setTimeout(() => {
            this.updateDisplay();
        }, 100);
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
        }
    }

    setupEventListeners() {
        // 目標タンパク質量の変更
        document.getElementById('targetProtein').addEventListener('change', (e) => {
            const value = e.target.value;
            const customContainer = document.getElementById('customTargetContainer');

            if (value === 'custom') {
                customContainer.classList.remove('hidden');
            } else {
                customContainer.classList.add('hidden');
                this.setTarget(parseInt(value));
            }
        });

        // カスタム目標量の変更
        document.getElementById('customTarget').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 0) {
                this.setTarget(value);
            }
        });

        // ボタンイベント
        document.getElementById('autoDistributeBtn').addEventListener('click', () => {
            this.autoDistribute();
        });

        document.getElementById('resetPlanBtn').addEventListener('click', () => {
            this.resetPlan();
        });

        document.getElementById('savePlanBtn').addEventListener('click', () => {
            this.savePlan();
        });

        document.getElementById('loadPlanBtn').addEventListener('click', () => {
            this.loadPlan();
        });
    }

    setTarget(amount) {
        this.currentTarget = amount;
        this.autoDistribute();
    }

    autoDistribute() {
        // 3食に自動配分 (朝:30%, 昼:35%, 夕:35%)
        this.mealTargets = {
            breakfast: Math.round(this.currentTarget * 0.3),
            lunch: Math.round(this.currentTarget * 0.35),
            dinner: Math.round(this.currentTarget * 0.35)
        };

        // 合計が目標と一致するように調整
        const total = Object.values(this.mealTargets).reduce((sum, val) => sum + val, 0);
        const diff = this.currentTarget - total;
        if (diff !== 0) {
            this.mealTargets.dinner += diff;
        }

        this.updateDisplay();
    }

    populateFoodSelectors() {
        const selectors = ['breakfastFoodSelect', 'lunchFoodSelect', 'dinnerFoodSelect'];

        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            select.innerHTML = '<option value="">食材を選択...</option>';

            // カテゴリー別にグループ化
            const categories = {
                '魚介類': [],
                '肉類': [],
                '卵類': [],
                '乳製品': [],
                '豆類': [],
                'その他': []
            };

            this.foods.forEach(food => {
                if (categories[food.category]) {
                    categories[food.category].push(food);
                }
            });

            Object.keys(categories).forEach(category => {
                if (categories[category].length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = category;

                    categories[category].forEach(food => {
                        const option = document.createElement('option');
                        option.value = food.id;
                        option.textContent = `${food.name} (${food.protein_per_serving}g)`;
                        optgroup.appendChild(option);
                    });

                    select.appendChild(optgroup);
                }
            });
        });
    }

    addFoodToMeal(mealType) {
        const selectId = mealType + 'FoodSelect';
        const select = document.getElementById(selectId);
        const foodId = select.value;

        if (!foodId) return;

        const food = this.foods.find(f => f.id === foodId);
        if (!food) return;

        // 同じ食材がすでに追加されているかチェック
        const existingItem = this.meals[mealType].find(item => item.id === food.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.meals[mealType].push({
                ...food,
                quantity: 1
            });
        }

        select.value = '';
        this.updateDisplay();
    }

    removeFoodFromMeal(mealType, foodId) {
        this.meals[mealType] = this.meals[mealType].filter(item => item.id !== foodId);
        this.updateDisplay();
    }

    updateFoodQuantity(mealType, foodId, quantity) {
        const item = this.meals[mealType].find(item => item.id === foodId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeFoodFromMeal(mealType, foodId);
            } else {
                this.updateDisplay();
            }
        }
    }

    calculateMealProtein(mealType) {
        return this.meals[mealType].reduce((total, item) => {
            return total + (item.protein_per_serving * item.quantity);
        }, 0);
    }

    calculateTotalProtein() {
        return Object.keys(this.meals).reduce((total, mealType) => {
            return total + this.calculateMealProtein(mealType);
        }, 0);
    }

    updateDisplay() {
        this.updateSummary();
        this.updateMealCards();
        this.updateCharts();
    }

    updateSummary() {
        const total = this.calculateTotalProtein();
        const achievement = Math.round((total / this.currentTarget) * 100);
        const remaining = Math.max(0, this.currentTarget - total);

        document.getElementById('totalProtein').textContent = total.toFixed(1) + 'g';
        document.getElementById('targetAmount').textContent = this.currentTarget + 'g';
        document.getElementById('achievementRate').textContent = achievement + '%';
        document.getElementById('remainingAmount').textContent = remaining.toFixed(1) + 'g';
    }

    updateMealCards() {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            this.updateMealCard(mealType);
        });
    }

    updateMealCard(mealType) {
        const mealProtein = this.calculateMealProtein(mealType);
        const target = this.mealTargets[mealType];
        const progress = Math.min(100, (mealProtein / target) * 100);

        // 目標表示の更新
        document.getElementById(mealType + 'Target').textContent = `目標: ${target}g`;

        // 食材リストの更新
        const itemsContainer = document.getElementById(mealType + 'Items');
        if (this.meals[mealType].length === 0) {
            itemsContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--text-light); font-style: italic;">
                    まだ食材が選択されていません
                </div>
            `;
        } else {
            itemsContainer.innerHTML = this.meals[mealType].map(item => {
                const totalProtein = item.protein_per_serving * item.quantity;
                const categoryShortName = this.getCategoryShortName(item.category);
                const servingDisplay = item.template_serving_weight ?
                    `${item.template_serving_weight} × ${item.quantity}` :
                    `${item.serving_size} × ${item.quantity}`;

                return `
                    <div class="food-item fade-in" style="margin-bottom: 0.5rem;">
                        <div class="food-icon" style="font-size: 0.75rem; width: 2.5rem; height: 2.5rem;">${categoryShortName}</div>
                        <div class="food-info">
                            <div class="food-name" style="font-size: 0.875rem;">${item.name}</div>
                            <div class="food-details" style="font-size: 0.75rem;">
                                ${servingDisplay} = <strong style="color: var(--primary-color);">${totalProtein.toFixed(1)}g</strong>タンパク質
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="number" min="0" max="10" value="${item.quantity}"
                                   onchange="planner.updateFoodQuantity('${mealType}', '${item.id}', parseInt(this.value))"
                                   style="width: 50px; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 0.25rem;">
                            <button onclick="planner.removeFoodFromMeal('${mealType}', '${item.id}')"
                                    style="background: #ef4444; color: white; border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem; cursor: pointer; transition: background 0.2s;">×</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // プログレスバーの更新
        document.getElementById(mealType + 'Progress').style.width = progress + '%';
        document.getElementById(mealType + 'Amount').textContent = `${mealProtein.toFixed(1)}g / ${target}g`;
    }

    initCharts() {
        try {
            this.initMealChart();
            this.initProgressChart();
            console.log('Charts initialized successfully');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    initMealChart() {
        const canvas = document.getElementById('mealChart');
        if (!canvas) {
            console.warn('Meal chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        this.charts.meal = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['朝食', '昼食', '夕食'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#fef3c7', '#fed7aa', '#fde68a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) {
            console.warn('Progress chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['達成済み', '残り'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#4ade80', '#e5e7eb']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        // チャートが初期化されているかチェック
        if (!this.charts.meal || !this.charts.progress) {
            console.log('Charts not initialized yet, skipping update');
            return;
        }

        try {
            // 食事別チャートの更新
            const mealData = [
                this.calculateMealProtein('breakfast'),
                this.calculateMealProtein('lunch'),
                this.calculateMealProtein('dinner')
            ];
            if (this.charts.meal.data && this.charts.meal.data.datasets[0]) {
                this.charts.meal.data.datasets[0].data = mealData;
                this.charts.meal.update();
            }

            // 達成度チャートの更新
            const total = this.calculateTotalProtein();
            const achievement = Math.min(100, (total / this.currentTarget) * 100);
            if (this.charts.progress.data && this.charts.progress.data.datasets[0]) {
                this.charts.progress.data.datasets[0].data = [achievement, 100 - achievement];
                this.charts.progress.update();
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    resetPlan() {
        if (confirm('プランをリセットしますか？')) {
            this.meals = {
                breakfast: [],
                lunch: [],
                dinner: []
            };
            this.updateDisplay();
        }
    }

    savePlan() {
        const planData = {
            target: this.currentTarget,
            mealTargets: this.mealTargets,
            meals: this.meals,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('proteinPlan', JSON.stringify(planData));

        // 成功メッセージを表示
        const message = document.createElement('div');
        message.className = 'success';
        message.textContent = 'プランを保存しました！';
        document.querySelector('main .container').appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    loadPlan() {
        const savedPlan = localStorage.getItem('proteinPlan');
        if (!savedPlan) {
            alert('保存されたプランがありません。');
            return;
        }

        try {
            const planData = JSON.parse(savedPlan);
            this.currentTarget = planData.target;
            this.mealTargets = planData.mealTargets;
            this.meals = planData.meals;

            // UIの更新
            document.getElementById('targetProtein').value = this.currentTarget;
            this.updateDisplay();

            // 成功メッセージを表示
            const message = document.createElement('div');
            message.className = 'success';
            message.textContent = 'プランを読み込みました！';
            document.querySelector('main .container').appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);
        } catch (error) {
            alert('プランの読み込みに失敗しました。');
        }
    }

    loadPresetPattern(pattern) {
        this.resetPlan();

        const patterns = {
            balanced: {
                breakfast: [
                    { id: 'chicken_egg', quantity: 1 },
                    { id: 'yogurt', quantity: 1 }
                ],
                lunch: [
                    { id: 'chicken_breast', quantity: 1 },
                    { id: 'tofu', quantity: 1 }
                ],
                dinner: [
                    { id: 'grilled_mackerel', quantity: 1 },
                    { id: 'natto', quantity: 1 }
                ]
            },
            convenient: {
                breakfast: [
                    { id: 'protein_powder', quantity: 1 },
                    { id: 'milk', quantity: 1 }
                ],
                lunch: [
                    { id: 'canned_tuna', quantity: 1 },
                    { id: 'protein_bar', quantity: 1 }
                ],
                dinner: [
                    { id: 'chicken_breast', quantity: 1 },
                    { id: 'cheese', quantity: 2 }
                ]
            },
            vegetarian: {
                breakfast: [
                    { id: 'soymilk', quantity: 1 },
                    { id: 'almonds', quantity: 1 }
                ],
                lunch: [
                    { id: 'tofu', quantity: 2 },
                    { id: 'kidney_beans', quantity: 1 }
                ],
                dinner: [
                    { id: 'natto', quantity: 2 },
                    { id: 'peanuts', quantity: 1 }
                ]
            }
        };

        const selectedPattern = patterns[pattern];
        if (!selectedPattern) return;

        Object.keys(selectedPattern).forEach(mealType => {
            selectedPattern[mealType].forEach(item => {
                const food = this.foods.find(f => f.id === item.id);
                if (food) {
                    this.meals[mealType].push({
                        ...food,
                        quantity: item.quantity
                    });
                }
            });
        });

        this.updateDisplay();
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

    initTemplates() {
        const templates = this.getTemplateData();
        const container = document.getElementById('templateCards');
        container.innerHTML = templates.map(template => this.createTemplateCard(template)).join('');
    }

    getTemplateData() {
        return [
            {
                id: 'balanced',
                name: 'バランス型',
                subtitle: '健康的な食生活',
                icon: 'BAL',
                description: '肉・魚・卵・豆類をバランス良く組み合わせた、栄養バランスに優れたプランです。',
                targetProtein: 75,
                difficulty: '簡単',
                time: '20分',
                meals: {
                    breakfast: [
                        { id: 'chicken_egg', quantity: 1, name: '鶏卵', serving_weight: '50g' },
                        { id: 'greek_yogurt', quantity: 1, name: 'ギリシャヨーグルト', serving_weight: '100g' }
                    ],
                    lunch: [
                        { id: 'chicken_breast', quantity: 1, name: '鶏むね肉', serving_weight: '120g' },
                        { id: 'tofu', quantity: 1, name: '木綿豆腐', serving_weight: '100g' }
                    ],
                    dinner: [
                        { id: 'grilled_mackerel', quantity: 1, name: '焼きさば', serving_weight: '80g' },
                        { id: 'natto', quantity: 1, name: '納豆', serving_weight: '40g' }
                    ]
                },
                tags: ['鶏むね肉', 'ギリシャヨーグルト', '焼きさば', '納豆']
            },
            {
                id: 'convenient',
                name: '忙しい人向け',
                subtitle: '時短・手軽',
                icon: 'FAST',
                description: 'コンビニで手に入る食材とプロテインを活用した、調理時間を最小限に抑えたプランです。',
                targetProtein: 80,
                difficulty: '超簡単',
                time: '5分',
                meals: {
                    breakfast: [
                        { id: 'protein_powder', quantity: 1, name: 'プロテインパウダー', serving_weight: '25g' },
                        { id: 'milk', quantity: 1, name: '牛乳', serving_weight: '200ml' }
                    ],
                    lunch: [
                        { id: 'canned_tuna', quantity: 1, name: 'ツナ缶', serving_weight: '70g' },
                        { id: 'protein_bar', quantity: 1, name: 'プロテインバー', serving_weight: '40g' }
                    ],
                    dinner: [
                        { id: 'chicken_breast', quantity: 1, name: '鶏むね肉（サラダチキン）', serving_weight: '120g' },
                        { id: 'cheese', quantity: 2, name: 'チーズ', serving_weight: '36g' }
                    ]
                },
                tags: ['プロテイン', 'サラダチキン', 'ツナ缶', 'チーズ']
            },
            {
                id: 'vegetarian',
                name: 'ベジタリアン',
                subtitle: '植物性中心',
                icon: 'VEG',
                description: '豆類、ナッツ、豆乳などの植物性タンパク質を中心とした、ヘルシーなプランです。',
                targetProtein: 70,
                difficulty: '普通',
                time: '15分',
                meals: {
                    breakfast: [
                        { id: 'soymilk', quantity: 1, name: '豆乳', serving_weight: '200ml' },
                        { id: 'almonds', quantity: 1, name: 'アーモンド', serving_weight: '20g' }
                    ],
                    lunch: [
                        { id: 'tofu', quantity: 2, name: '木綿豆腐', serving_weight: '200g' },
                        { id: 'kidney_beans', quantity: 1, name: 'いんげん豆', serving_weight: '50g' }
                    ],
                    dinner: [
                        { id: 'natto', quantity: 2, name: '納豆', serving_weight: '80g' },
                        { id: 'peanuts', quantity: 1, name: 'ピーナッツ', serving_weight: '20g' }
                    ]
                },
                tags: ['豆腐', '納豆', '豆乳', 'ナッツ類']
            },
            {
                id: 'muscle_building',
                name: '筋肉増強',
                subtitle: 'トレーニング向け',
                icon: 'MUSC',
                description: '高タンパクな食材を厳選した、筋肥大を目指すトレーニーのためのプランです。',
                targetProtein: 120,
                difficulty: '普通',
                time: '25分',
                meals: {
                    breakfast: [
                        { id: 'chicken_egg', quantity: 2, name: '鶏卵×2', serving_weight: '100g' },
                        { id: 'protein_powder', quantity: 1, name: 'プロテイン', serving_weight: '25g' }
                    ],
                    lunch: [
                        { id: 'chicken_breast', quantity: 1, name: '鶏むね肉', serving_weight: '120g' },
                        { id: 'canned_tuna', quantity: 1, name: 'ツナ缶', serving_weight: '70g' }
                    ],
                    dinner: [
                        { id: 'beef_sirloin', quantity: 1, name: '牛サーロイン', serving_weight: '120g' },
                        { id: 'cottage_cheese', quantity: 2, name: 'カッテージチーズ', serving_weight: '60g' }
                    ]
                },
                tags: ['鶏むね肉', '牛肉', 'プロテイン', 'カッテージチーズ']
            }
        ];
    }

    createTemplateCard(template) {
        const totalProtein = this.calculateTemplateProtein(template);

        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon">${template.icon}</div>
                    <div class="template-info">
                        <h3>${template.name}</h3>
                        <p class="template-subtitle">${template.subtitle}</p>
                    </div>
                </div>

                <p class="template-description">${template.description}</p>

                <div class="template-stats">
                    <div class="template-stat">
                        <div class="template-stat-value">${totalProtein}g</div>
                        <div class="template-stat-label">タンパク質</div>
                    </div>
                    <div class="template-stat">
                        <div class="template-stat-value">${template.time}</div>
                        <div class="template-stat-label">調理時間</div>
                    </div>
                </div>

                <div class="template-meals-preview" style="margin-bottom: 1rem;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">このプランの食事内容:</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.7rem;">
                        <div>
                            <div style="font-weight: 600; color: var(--text-dark);">朝食</div>
                            ${template.meals.breakfast.map(item => `<div>${item.name}</div>`).join('')}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-dark);">昼食</div>
                            ${template.meals.lunch.map(item => `<div>${item.name}</div>`).join('')}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-dark);">夕食</div>
                            ${template.meals.dinner.map(item => `<div>${item.name}</div>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="template-foods">
                    <div class="template-foods-title">主な食材:</div>
                    <div class="template-foods-list">
                        ${template.tags.map(tag => `<span class="template-food-tag">${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="template-action">
                    <button class="template-btn" onclick="planner.applyTemplate('${template.id}')">
                        このプランを適用
                    </button>
                </div>
            </div>
        `;
    }

    calculateTemplateProtein(template) {
        let total = 0;
        Object.values(template.meals).forEach(meal => {
            meal.forEach(item => {
                const food = this.foods.find(f => f.id === item.id);
                if (food) {
                    total += food.protein_per_serving * item.quantity;
                }
            });
        });
        return Math.round(total);
    }

    applyTemplate(templateId) {
        console.log('Template ID:', templateId); // デバッグ
        const templates = this.getTemplateData();
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }

        console.log('Applying template:', template); // デバッグ

        // テンプレートカードにアニメーション追加
        const templateCard = document.querySelector(`[data-template-id="${templateId}"]`);
        if (!templateCard) {
            console.error('Template card not found:', templateId);
            return;
        }
        templateCard.classList.add('template-applying');

        setTimeout(() => {
            // 既存のプランをクリア
            this.meals = {
                breakfast: [],
                lunch: [],
                dinner: []
            };

            // 目標タンパク質量を設定
            this.currentTarget = template.targetProtein;
            this.autoDistribute();

            // テンプレートの食材を適用
            Object.keys(template.meals).forEach(mealType => {
                console.log(`Processing meal: ${mealType}`); // デバッグ
                template.meals[mealType].forEach(item => {
                    console.log(`Looking for food ID: ${item.id}`); // デバッグ
                    const food = this.foods.find(f => f.id === item.id);
                    if (food) {
                        console.log(`Found food: ${food.name}`); // デバッグ
                        this.meals[mealType].push({
                            ...food,
                            quantity: item.quantity,
                            template_serving_weight: item.serving_weight
                        });
                    } else {
                        console.warn(`Food not found for ID: ${item.id}`);
                    }
                });
            });

            // UIを更新
            document.getElementById('targetProtein').value = template.targetProtein;
            this.updateDisplay();

            // 食事カードにアニメーション追加
            document.querySelectorAll('.meal-card').forEach(card => {
                card.classList.add('meal-update');
                setTimeout(() => card.classList.remove('meal-update'), 400);
            });

            // テンプレートカードの選択状態を更新
            document.querySelectorAll('.template-card').forEach(card => {
                card.classList.remove('selected');
            });
            templateCard.classList.add('selected');

            // 成功メッセージを表示
            this.showTemplateAppliedMessage(template.name);

            templateCard.classList.remove('template-applying');
        }, 300);
    }

    showTemplateAppliedMessage(templateName) {
        const message = document.createElement('div');
        message.className = 'success fade-in';
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem;">✓</div>
                <div>
                    <strong>${templateName}</strong> プランを適用しました！<br>
                    <small>朝・昼・夕の食事に食材が自動で設定されました</small>
                </div>
            </div>
        `;

        const container = document.querySelector('main .container');
        container.appendChild(message);

        // スクロールして食事プランを表示
        setTimeout(() => {
            const mealPlanner = document.querySelector('.meal-planner');
            if (mealPlanner) {
                mealPlanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);

        setTimeout(() => {
            message.remove();
        }, 4000);
    }
}

// グローバル関数（HTMLから呼び出される）
function addFoodToMeal(mealType) {
    planner.addFoodToMeal(mealType);
}

function loadPresetPattern(pattern) {
    planner.loadPresetPattern(pattern);
}

// ページ読み込み時に初期化
let planner;
document.addEventListener('DOMContentLoaded', () => {
    planner = new MealPlanner();
});