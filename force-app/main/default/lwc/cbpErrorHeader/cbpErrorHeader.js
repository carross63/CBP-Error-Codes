import { LightningElement, api } from 'lwc';

export default class CbpErrorHeader extends LightningElement {
    @api pageTitle = 'ACE Error Code Reference';
    @api totalCount = 0;

    get formattedCount() {
        return this.totalCount ? `${this.totalCount.toLocaleString()} condition codes` : '';
    }
}
