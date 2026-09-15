import { LightningElement, api } from 'lwc';

const DEFAULT_PAGE_SIZE = 25;

export default class CbpErrorTable extends LightningElement {
    @api pageSize = DEFAULT_PAGE_SIZE;

    _errors = [];
    currentPage = 1;
    sortField = 'code';
    sortDirection = 'asc';
    expandedId = null;

    @api
    get errors() {
        return this._errors;
    }

    set errors(value) {
        this._errors = value || [];
        this.currentPage = 1;
        this.expandedId = null;
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
        return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    }

    get safeCurrentPage() {
        return Math.min(this.currentPage, this.totalPages);
    }

    get pageRows() {
        const page = this.safeCurrentPage;
        const start = (page - 1) * this.pageSize;
        return this.sortedErrors.slice(start, start + this.pageSize).map((row) => {
            const isExpanded = row.id === this.expandedId;
            return {
                ...row,
                isExpanded,
                rowClass: isExpanded ? 'error-row error-row_expanded' : 'error-row',
                toggleLabel: isExpanded ? 'Hide details' : 'View details',
                toggleIcon: isExpanded ? '▾' : '▸',
                detailKey: `${row.id}-detail`,
                displayDate: row.dateUpdated || '—'
            };
        });
    }

    get pageInfo() {
        return `Page ${this.safeCurrentPage} of ${this.totalPages}`;
    }

    get resultCountLabel() {
        const count = this.totalCount;
        return `${count.toLocaleString()} result${count === 1 ? '' : 's'}`;
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

    get codeHeaderClass() {
        return this.headerClass('code');
    }

    get narrativeHeaderClass() {
        return this.headerClass('narrative');
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
        return this.sortField === field ? 'grid__sort-btn grid__sort-btn_active' : 'grid__sort-btn';
    }

    sortIconFor(field) {
        if (this.sortField !== field) {
            return '';
        }
        return this.sortDirection === 'asc' ? '▲' : '▼';
    }

    get codeSortIcon() {
        return this.sortIconFor('code');
    }

    get narrativeSortIcon() {
        return this.sortIconFor('narrative');
    }

    get categorySortIcon() {
        return this.sortIconFor('category');
    }

    get flowSortIcon() {
        return this.sortIconFor('flow');
    }

    get dateSortIcon() {
        return this.sortIconFor('dateUpdated');
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
