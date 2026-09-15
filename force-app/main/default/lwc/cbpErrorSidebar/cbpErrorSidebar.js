import { LightningElement, api } from 'lwc';

const SEARCH_DEBOUNCE_MS = 250;
const ALL_VALUE = '';

export default class CbpErrorSidebar extends LightningElement {
    @api searchTerm = '';
    @api selectedCategory = ALL_VALUE;
    @api selectedFlow = ALL_VALUE;
    @api categories = [];
    @api flows = [];
    @api totalCount = 0;
    @api filteredCount = 0;
    @api hasActiveFilters = false;

    searchDebounceTimer;

    get resultsSummary() {
        if (!this.hasActiveFilters) {
            return `${this.totalCount.toLocaleString()} total codes`;
        }
        return `${this.filteredCount.toLocaleString()} of ${this.totalCount.toLocaleString()} codes`;
    }

    get categoryOptions() {
        return this.categories.map((entry) => ({
            ...entry,
            isActive: entry.value === this.selectedCategory,
            cssClass: this.pillClass(entry.value === this.selectedCategory)
        }));
    }

    get flowOptions() {
        return this.flows.map((entry) => ({
            ...entry,
            isActive: entry.value === this.selectedFlow,
            cssClass: this.pillClass(entry.value === this.selectedFlow)
        }));
    }

    get allCategoriesActive() {
        return this.selectedCategory === ALL_VALUE;
    }

    get allFlowsActive() {
        return this.selectedFlow === ALL_VALUE;
    }

    get allCategoriesClass() {
        return this.pillClass(this.allCategoriesActive);
    }

    get allFlowsClass() {
        return this.pillClass(this.allFlowsActive);
    }

    pillClass(isActive) {
        return isActive ? 'facet-pill facet-pill_active' : 'facet-pill';
    }

    handleSearchInput(event) {
        const value = event.target.value;
        window.clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = window.setTimeout(() => {
            this.dispatchEvent(new CustomEvent('search', { detail: { value } }));
        }, SEARCH_DEBOUNCE_MS);
    }

    handleCategoryClick(event) {
        const value = event.currentTarget.dataset.value || ALL_VALUE;
        this.dispatchEvent(new CustomEvent('categorychange', { detail: { value } }));
    }

    handleFlowClick(event) {
        const value = event.currentTarget.dataset.value || ALL_VALUE;
        this.dispatchEvent(new CustomEvent('flowchange', { detail: { value } }));
    }

    handleReset() {
        const searchBox = this.template.querySelector('.sidebar__search-input');
        if (searchBox) {
            searchBox.value = '';
        }
        this.dispatchEvent(new CustomEvent('reset'));
    }
}
