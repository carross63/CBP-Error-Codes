import { LightningElement, api } from 'lwc';

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const FIELD_LABELS = {
    code: 'Code',
    narrative: 'Narrative',
    category: 'Category',
    flow: 'Flow',
    dateUpdated: 'Updated'
};
const SORT_PRESETS = [
    { key: 'code-asc', label: 'Code (ascending)', field: 'code', direction: 'asc' },
    { key: 'code-desc', label: 'Code (descending)', field: 'code', direction: 'desc' },
    { key: 'updated-desc', label: 'Recently updated', field: 'dateUpdated', direction: 'desc' },
    { key: 'category-asc', label: 'Category (A–Z)', field: 'category', direction: 'asc' }
];

export default class CbpErrorTable extends LightningElement {
    @api pageSize = DEFAULT_PAGE_SIZE;

    _errors = [];
    currentPage = 1;
    sortField = 'code';
    sortDirection = 'asc';
    expandedId = null;
    selectedPageSize = null;
    isSortSheetOpen = false;

    @api
    get errors() {
        return this._errors;
    }

    set errors(value) {
        this._errors = value || [];
        this.currentPage = 1;
        this.expandedId = null;
    }

    get effectivePageSize() {
        return this.selectedPageSize || this.pageSize;
    }

    get pageSizeOptions() {
        const current = this.effectivePageSize;
        return PAGE_SIZE_OPTIONS.map((size) => ({
            value: size,
            label: String(size),
            isSelected: size === current
        }));
    }

    get sortedErrors() {
        const data = [...this._errors];
        const dir = this.sortDirection === 'asc' ? 1 : -1;
        const field = this.sortField;
        data.sort((a, b) => {
            if (field === 'code') {
                const numA = Number(a.code);
                const numB = Number(b.code);
                if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                    return (numA - numB) * dir;
                }
            }
            return String(a[field]).localeCompare(String(b[field])) * dir;
        });
        return data;
    }

    get totalCount() {
        return this._errors.length;
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.totalCount / this.effectivePageSize));
    }

    get safeCurrentPage() {
        return Math.min(this.currentPage, this.totalPages);
    }

    get pageRows() {
        const page = this.safeCurrentPage;
        const size = this.effectivePageSize;
        const start = (page - 1) * size;
        return this.sortedErrors.slice(start, start + size).map((row) => {
            const isExpanded = row.id === this.expandedId;
            return {
                ...row,
                isExpanded,
                rowClass: isExpanded ? 'error-row error-row_expanded' : 'error-row',
                toggleLabel: isExpanded ? 'Hide details' : 'View details',
                detailKey: `${row.id}-detail`,
                displayDate: row.dateUpdated || '—'
            };
        });
    }

    get resultsSummary() {
        const total = this.totalCount;
        if (total === 0) {
            return 'Showing 0 of 0 codes';
        }
        const size = this.effectivePageSize;
        const start = (this.safeCurrentPage - 1) * size + 1;
        const end = Math.min(total, start + size - 1);
        return `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} codes`;
    }

    get pageNumbers() {
        const total = this.totalPages;
        const current = this.safeCurrentPage;
        const pages = [];

        const addPage = (num) => {
            pages.push({
                isPage: true,
                key: `p-${num}`,
                value: num,
                cssClass: num === current ? 'page-num page-num_active' : 'page-num'
            });
        };
        const addEllipsis = (key) => pages.push({ isPage: false, key });

        if (total <= 7) {
            for (let i = 1; i <= total; i += 1) {
                addPage(i);
            }
            return pages;
        }

        addPage(1);
        if (current > 3) {
            addEllipsis('e-start');
        }
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i += 1) {
            addPage(i);
        }
        if (current < total - 2) {
            addEllipsis('e-end');
        }
        addPage(total);
        return pages;
    }

    get isFirstPage() {
        return this.safeCurrentPage <= 1;
    }

    get isLastPage() {
        return this.safeCurrentPage >= this.totalPages;
    }

    get hasResults() {
        return this.totalCount > 0;
    }

    get currentSortLabel() {
        const matchedPreset = SORT_PRESETS.find(
            (preset) => preset.field === this.sortField && preset.direction === this.sortDirection
        );
        if (matchedPreset) {
            return matchedPreset.label.replace(/\s*\(.*\)/, '');
        }
        return FIELD_LABELS[this.sortField] || this.sortField;
    }

    get sortPresetOptions() {
        return SORT_PRESETS.map((preset) => {
            const isSelected = preset.field === this.sortField && preset.direction === this.sortDirection;
            return {
                ...preset,
                cssClass: isSelected ? 'sort-option sort-option_selected' : 'sort-option'
            };
        });
    }

    get codeHeaderClass() {
        return this.headerClass('code');
    }

    get categoryHeaderClass() {
        return this.headerClass('category');
    }

    get flowHeaderClass() {
        return this.headerClass('flow');
    }

    get dateHeaderClass() {
        return this.headerClass('dateUpdated');
    }

    headerClass(field) {
        return this.sortField === field ? 'col-sort-btn col-sort-btn_active' : 'col-sort-btn';
    }

    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
    }

    handleRowToggle(event) {
        const id = event.currentTarget.dataset.id;
        this.expandedId = this.expandedId === id ? null : id;
    }

    handleOpenSortSheet() {
        this.isSortSheetOpen = true;
    }

    handleCloseSortSheet() {
        this.isSortSheetOpen = false;
    }

    handleSortPresetClick(event) {
        const key = event.currentTarget.dataset.key;
        const preset = SORT_PRESETS.find((entry) => entry.key === key);
        if (preset) {
            this.sortField = preset.field;
            this.sortDirection = preset.direction;
        }
        this.isSortSheetOpen = false;
    }

    handlePageSizeChange(event) {
        this.selectedPageSize = Number(event.target.value);
        this.currentPage = 1;
    }

    handlePageClick(event) {
        this.currentPage = Number(event.currentTarget.dataset.page);
    }

    handlePrev() {
        if (!this.isFirstPage) {
            this.currentPage = this.safeCurrentPage - 1;
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage = this.safeCurrentPage + 1;
        }
    }
}
