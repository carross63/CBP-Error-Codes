import { LightningElement, api } from 'lwc';

const SEARCH_DEBOUNCE_MS = 250;
const ALL_VALUE = '';

export default class CbpErrorSidebar extends LightningElement {
    @api searchTerm = '';
    @api selectedCategory = ALL_VALUE;
    @api categories = [];
    @api totalCount = 0;
    @api filteredCount = 0;
    @api hasActiveFilters = false;

    isFilterSheetOpen = false;
    searchDebounceTimer;

    get resultsSummary() {
        if (!this.hasActiveFilters) {
            return `${this.totalCount.toLocaleString()} total codes`;
        }
        return `${this.filteredCount.toLocaleString()} of ${this.totalCount.toLocaleString()} codes`;
    }

    get filterCount() {
        return this.selectedCategory ? 1 : 0;
    }

    get categoryOptions() {
        return this.categories.map((entry) => ({
            ...entry,
            cssClass: this.optionClass(entry.value === this.selectedCategory)
        }));
    }

    get allCategoriesClass() {
        return this.optionClass(this.selectedCategory === ALL_VALUE);
    }

    optionClass(isSelected) {
        return isSelected ? 'filter-option filter-option_selected' : 'filter-option';
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
        this.isFilterSheetOpen = false;
    }

    handleOpenFilterSheet() {
        this.isFilterSheetOpen = true;
    }

    handleCloseFilterSheet() {
        this.isFilterSheetOpen = false;
    }

    handleReset() {
        this.template.querySelectorAll('.search-input').forEach((input) => {
            input.value = '';
        });
        this.isFilterSheetOpen = false;
        this.dispatchEvent(new CustomEvent('reset'));
    }
}
