class AnalyticsService {
    constructor() {
        this.baseURL = '/api/analytics';
    }

    async getAnalytics(startDate, endDate) {
        try {
            // In a real app, this would be an API call
            // For now, we'll use localStorage with some initial data if empty
            let analytics = JSON.parse(localStorage.getItem('analytics')) || this.getInitialData();
            
            // Filter data based on date range
            const filteredData = this.filterDataByDateRange(analytics, startDate, endDate);
            return filteredData;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    async updateAnalytics(newData) {
        try {
            localStorage.setItem('analytics', JSON.stringify(newData));
            return newData;
        } catch (error) {
            console.error('Error updating analytics:', error);
            throw error;
        }
    }

    filterDataByDateRange(data, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Filter data points within range
        return {
            ...data,
            revenueData: data.revenueData.filter(item => {
                const date = new Date(item.date);
                return date >= start && date <= end;
            })
        };
    }

    getInitialData() {
        const today = new Date();
        const last12Months = Array.from({length: 12}, (_, i) => {
            const date = new Date();
            date.setMonth(today.getMonth() - i);
            return date;
        }).reverse();

        return {
            kpis: {
                revenue: {
                    value: 128430,
                    trend: 12.5,
                    prevValue: 114160
                },
                users: {
                    value: 2845,
                    trend: 8.3,
                    prevValue: 2627
                },
                conversion: {
                    value: 3.6,
                    trend: -1.2,
                    prevValue: 3.64
                },
                engagement: {
                    value: 272, // in seconds
                    trend: 0.8,
                    prevValue: 270
                }
            },
            revenueData: last12Months.map((date, index) => ({
                date: date.toISOString(),
                revenue: Math.floor(30000 + Math.random() * 90000),
                users: Math.floor(1000 + Math.random() * 2000)
            })),
            demographics: [
                { age: '18-24', percentage: 44 },
                { age: '25-34', percentage: 55 },
                { age: '35-44', percentage: 13 },
                { age: '45-54', percentage: 43 },
                { age: '55+', percentage: 22 }
            ],
            trafficSources: [
                { name: 'Organic Search', value: 12450, percentage: 45 },
                { name: 'Direct', value: 8320, percentage: 30 },
                { name: 'Social Media', value: 4160, percentage: 15 },
                { name: 'Referral', value: 2080, percentage: 7.5 },
                { name: 'Email', value: 690, percentage: 2.5 }
            ],
            topPages: [
                { url: '/home', views: 8245, avgTime: 135, bounceRate: 25 },
                { url: '/products', views: 6320, avgTime: 222, bounceRate: 18 },
                { url: '/about', views: 3180, avgTime: 90, bounceRate: 45 },
                { url: '/blog', views: 2845, avgTime: 250, bounceRate: 22 },
                { url: '/contact', views: 1920, avgTime: 65, bounceRate: 65 }
            ]
        };
    }
}