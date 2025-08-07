class AnalyticsController {
    constructor() {
        this.initializeDates();
        this.initializeEventListeners();
        this.loadAnalytics();
    }

    initializeDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];

        document.getElementById('startDate').value = this.startDate;
        document.getElementById('endDate').value = this.endDate;
    }

    initializeEventListeners() {
        // Date range form button
        document.querySelector('.date-range-btn').addEventListener('click', () => {
            this.handleDateRangeChange();
        });

        // Date presets
        document.querySelectorAll('.date-preset').forEach(preset => {
            preset.addEventListener('click', (e) => this.handlePresetClick(e));
        });

        // Charts Refresh Buttons
        this.initializeChartButtons();

        // Traffic Sources Buttons
        this.initializeTrafficButtons();

        // Top Pages Buttons
        this.initializeTopPagesButtons();

        // Header Search
        this.initializeHeaderSearch();
    }

    initializeChartButtons() {
        document.querySelectorAll('.chart-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = this.getButtonAction(e.currentTarget);
                const chartId = e.currentTarget.closest('.chart-card').querySelector('.chart-container').id;
                
                switch(action) {
                    case 'refresh':
                        this.loadAnalytics();
                        break;
                    case 'download':
                        this.downloadChart(chartId);
                        break;
                    case 'more':
                        this.showChartOptions(chartId);
                        break;
                }
            });
        });
    }

    initializeTrafficButtons() {
        document.querySelectorAll('.traffic-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = this.getButtonAction(e.currentTarget);
                
                switch(action) {
                    case 'refresh':
                        this.loadAnalytics();
                        break;
                    case 'download':
                        this.downloadTrafficData();
                        break;
                    case 'more':
                        this.showTrafficOptions();
                        break;
                }
            });
        });
    }

    initializeTopPagesButtons() {
        document.querySelectorAll('.top-pages-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = this.getButtonAction(e.currentTarget);
                
                switch(action) {
                    case 'refresh':
                        this.loadAnalytics();
                        break;
                    case 'download':
                        this.downloadTopPagesData();
                        break;
                    case 'more':
                        this.showTopPagesOptions();
                        break;
                }
            });
        });

        // Add click handlers for page URLs
        document.querySelectorAll('.page-url').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPageDetails(e.currentTarget.textContent);
            });
        });
    }

    initializeHeaderSearch() {
        const searchInput = document.querySelector('.header-search input');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    getButtonAction(button) {
        const icon = button.querySelector('i');
        if (icon.classList.contains('fa-sync-alt')) return 'refresh';
        if (icon.classList.contains('fa-download')) return 'download';
        if (icon.classList.contains('fa-ellipsis-v')) return 'more';
        return 'unknown';
    }

    async handleSearch(query) {
        // Filter content based on search query
        if (!query) {
            this.loadAnalytics();
            return;
        }

        try {
            const analyticsService = new AnalyticsService();
            const data = await analyticsService.getAnalytics(this.startDate, this.endDate);
            
            // Filter top pages
            data.topPages = data.topPages.filter(page => 
                page.url.toLowerCase().includes(query.toLowerCase())
            );

            // Filter traffic sources
            data.trafficSources = data.trafficSources.filter(source => 
                source.name.toLowerCase().includes(query.toLowerCase())
            );

            this.updateUI(data);
        } catch (error) {
            console.error('Error during search:', error);
        }
    }

    downloadChart(chartId) {
        const chart = window[chartId.replace('Chart', 'Chart')];
        if (chart) {
            // Use exportToSVG for ApexCharts download
            const svg = chart.exports.getSVG();
            const link = document.createElement('a');
            link.download = `${chartId}-${new Date().toISOString()}.svg`;
            link.href = 'data:image/svg+xml;base64,' + btoa(svg);
            link.click();
        }
    }

    downloadData(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    downloadTrafficData() {
        const data = JSON.parse(localStorage.getItem('analytics'));
        if (data?.trafficSources) {
            this.downloadData(data.trafficSources, `traffic-sources-${new Date().toISOString()}.json`);
        }
    }

    downloadTopPagesData() {
        const data = JSON.parse(localStorage.getItem('analytics'));
        if (data?.topPages) {
            this.downloadData(data.topPages, `top-pages-${new Date().toISOString()}.json`);
        }
    }

    showChartOptions(chartId) {
        // Implement a modal or dropdown with chart options
        alert(`Chart options for ${chartId} (Customize in production)`);
    }

    showTrafficOptions() {
        // Implement a modal or dropdown with traffic options
        alert('Traffic source options (Customize in production)');
    }

    showTopPagesOptions() {
        // Implement a modal or dropdown with top pages options
        alert('Top pages options (Customize in production)');
    }

    showPageDetails(url) {
        // Implement a modal with detailed page analytics
        alert(`Detailed analytics for ${url} (Customize in production)`);
    }

    async handleDateRangeChange() {
        this.startDate = document.getElementById('startDate').value;
        this.endDate = document.getElementById('endDate').value;
        this.updateActivePreset(null);
        this.loadAnalytics();
    }

    async handlePresetClick(event) {
        const preset = event.currentTarget;
        const today = new Date();
        let startDate = new Date();

        switch(preset.textContent) {
            case 'Today':
                startDate = today;
                break;
            case 'Yesterday':
                startDate.setDate(today.getDate() - 1);
                today.setDate(today.getDate() - 1);
                break;
            case 'Last 7 Days':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'Last 30 Days':
                startDate.setDate(today.getDate() - 30);
                break;
            case 'This Month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'Last Month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                today = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
        }

        this.startDate = startDate.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];

        document.getElementById('startDate').value = this.startDate;
        document.getElementById('endDate').value = this.endDate;

        this.updateActivePreset(preset);
        this.loadAnalytics();
    }

    updateActivePreset(activePreset) {
        document.querySelectorAll('.date-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        if (activePreset) {
            activePreset.classList.add('active');
        }
    }

    async loadAnalytics() {
        try {
            const analyticsService = new AnalyticsService();
            const data = await analyticsService.getAnalytics(this.startDate, this.endDate);
            this.updateUI(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    updateUI(data) {
        this.updateKPIs(data.kpis);
        this.updateCharts(data);
        this.updateTrafficSources(data.trafficSources);
        this.updateTopPages(data.topPages);
    }

    // Additional methods for updating specific sections
    updateKPIs(kpis) {
        // Update KPI cards
        this.updateKPICard('Revenue', kpis.revenue, '$');
        this.updateKPICard('New Users', kpis.users);
        this.updateKPICard('Conversion Rate', kpis.conversion, '', '%');
        this.updateKPICard('Avg. Engagement', kpis.engagement, '', 's', true);
    }

    updateKPICard(title, data, prefix = '', suffix = '', isTime = false) {
        // Find the card by searching for the title text within kpi-title elements
        const cards = document.querySelectorAll('.kpi-card');
        const card = Array.from(cards).find(card => 
            card.querySelector('.kpi-title').textContent.trim() === title
        );
        
        if (!card) return;

        let displayValue = data.value;
        if (isTime) {
            const minutes = Math.floor(displayValue / 60);
            const seconds = displayValue % 60;
            displayValue = `${minutes}m ${seconds}s`;
        } else {
            displayValue = `${prefix}${displayValue.toLocaleString()}${suffix}`;
        }

        card.querySelector('.kpi-value').textContent = displayValue;
        
        const trendElement = card.querySelector('.kpi-trend');
        trendElement.className = `kpi-trend ${data.trend >= 0 ? 'up' : 'down'}`;
        trendElement.querySelector('i').className = `fas fa-arrow-${data.trend >= 0 ? 'up' : 'down'}`;
        trendElement.querySelector('span').textContent = `${Math.abs(data.trend)}% vs last month`;
    }

    updateCharts(data) {
        // Update Revenue Chart
        if (window.revenueChart) {
            const series = [{
                name: 'Revenue',
                data: data.revenueData.map(d => ({
                    x: new Date(d.date).getTime(),
                    y: d.revenue
                }))
            }, {
                name: 'Users',
                data: data.revenueData.map(d => ({
                    x: new Date(d.date).getTime(),
                    y: d.users
                }))
            }];
            
            window.revenueChart.updateOptions({
                series: series
            });
        }

        // Update Demographics Chart
        if (window.demographicsChart) {
            window.demographicsChart.updateOptions({
                series: data.demographics.map(d => d.percentage),
                labels: data.demographics.map(d => d.age)
            });
        }
    }

    updateTrafficSources(sources) {
        const container = document.querySelector('.traffic-sources');
        container.innerHTML = sources.map(source => this.createTrafficSourceHTML(source)).join('');
    }

    updateTopPages(pages) {
        const tbody = document.querySelector('.top-pages-table tbody');
        tbody.innerHTML = pages.map(page => this.createTopPageRowHTML(page)).join('');
    }

    // Helper methods
    createTrafficSourceHTML(source) {
        return `
            <div class="traffic-item">
                <div class="traffic-source">
                    <div class="traffic-icon ${source.name.toLowerCase().replace(' ', '-')}">
                        ${this.getTrafficSourceIcon(source.name)}
                    </div>
                    <div class="traffic-name">${source.name}</div>
                </div>
                <div class="traffic-stats">
                    <div class="traffic-value">${source.value.toLocaleString()}</div>
                    <div class="traffic-percentage">
                        <div class="traffic-percentage-bar ${source.name.toLowerCase().replace(' ', '-')}" 
                             style="width: ${source.percentage}%"></div>
                    </div>
                    <div class="traffic-value">${source.percentage}%</div>
                </div>
            </div>
        `;
    }

    createTopPageRowHTML(page) {
        const bounceRateClass = page.bounceRate > 50 ? 'high' : 
                              page.bounceRate > 30 ? 'medium' : 'low';
        return `
            <tr>
                <td><a href="#" class="page-url">${page.url}</a></td>
                <td class="page-views">${page.views.toLocaleString()}</td>
                <td class="page-time">${Math.floor(page.avgTime / 60)}m ${page.avgTime % 60}s</td>
                <td class="page-bounce ${bounceRateClass}">${page.bounceRate}%</td>
            </tr>
        `;
    }

    getTrafficSourceIcon(sourceName) {
        const icons = {
            'Organic Search': '<i class="fas fa-search"></i>',
            'Direct': '<i class="fas fa-link"></i>',
            'Social Media': '<i class="fas fa-share-alt"></i>',
            'Referral': '<i class="fas fa-external-link-alt"></i>',
            'Email': '<i class="fas fa-envelope"></i>'
        };
        return icons[sourceName] || '<i class="fas fa-globe"></i>';
    }
}