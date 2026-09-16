import { LightningElement, api } from 'lwc';

const CURRENT_YEAR = new Date().getFullYear();

export default class CbpErrorFooter extends LightningElement {
    @api entityName = 'U.S. Customs and Border Protection';

    get copyrightYear() {
        return CURRENT_YEAR;
    }
}
