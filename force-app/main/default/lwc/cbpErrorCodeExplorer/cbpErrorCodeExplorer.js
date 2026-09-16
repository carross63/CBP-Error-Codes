import { LightningElement, api } from 'lwc';
import CATAIR_ERROR_DATA from '@salesforce/resourceUrl/cbpCatairErrorCodes';

const ALL_VALUE = '';

export default class CbpErrorCodeExplorer extends LightningElement {
    @api pageTitle = 'ACE Error Code Reference';
    @api pageSize = 25;

    allErrors = [];
    isLoading = true;
    loadError = false;

    searchTerm = '';
    selectedCategory = ALL_VALUE;

    connectedCallback() {
        this.loadErrorCodes();
    }

    async loadErrorCodes() {
        try {
            const response = await fetch(CATAIR_ERROR_DATA);
            if (!response.ok) {
                throw new Error(`Failed to load error code data: ${response.status}`);
            }
            const data = await response.json();
            this.allErrors = data.errors || [];
        } catch (error) {
            this.loadError = true;
            // eslint-disable-next-line no-console
            console.error('cbpErrorCodeExplorer: unable to load CATAIR error data', error);
        } finally {
            this.isLoading = false;
        }
    }

    get totalCount() {
        return this.allErrors.length;
    }

    get categories() {
        const counts = new Map();
        this.allErrors.forEach((row) => {
            const key = row.category || 'Other';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([label, count]) => ({ label, value: label, count }));
    }

    get filteredErrors() {
        const term = this.searchTerm.trim().toLowerCase();
        return this.allErrors.filter((row) => {
            if (this.selectedCategory && row.category !== this.selectedCategory) {
                return false;
            }
            if (!term) {
                return true;
            }
            return (
                row.code.toLowerCase().includes(term) ||
                row.narrative.toLowerCase().includes(term) ||
                row.explanation.toLowerCase().includes(term)
            );
        });
    }

    get filteredCount() {
        return this.filteredErrors.length;
    }

    get hasActiveFilters() {
        return Boolean(this.searchTerm || this.selectedCategory);
    }

    handleSearch(event) {
        this.searchTerm = event.detail.value;
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleResetFilters() {
        this.searchTerm = '';
        this.selectedCategory = ALL_VALUE;
    }
}
