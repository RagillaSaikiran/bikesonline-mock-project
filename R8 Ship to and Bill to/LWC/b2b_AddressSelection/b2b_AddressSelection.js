import { LightningElement, api,track } from 'lwc';
import getContactPointAddress from '@salesforce/apex/B2BAddressSelection.getContactPointAddress';
import getContactPointAddressById from '@salesforce/apex/B2BAddressSelection.getContactPointAddressById';
import updateCartDeliveryGroup from '@salesforce/apex/B2BAddressSelection.updateCartDeliveryGroup';
import UpdateContactPointAddress from '@salesforce/apex/B2BAddressSelection.UpdateContactPointAddress';
import saveNewAddress from '@salesforce/apex/B2BAddressSelection.saveNewAddress';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';


export default class b2b_AddressSelection extends LightningElement {
    currentCartId;
    showShipTo ;
    showBillTo;
    isModalOpen;
    @track _contactPointAddressId = '';
    @track billTo = []
    @track shipTo = []
    @track billingOption = [];
    @track shippingOption = [];
    @track billingRecord = {
        Name : '',
        Street : '',
        City : '',
        State : '',
        Country : '',
        PostalCode : '',
    };
    @track shipRecord = {
        Name : '',
        Street : '',
        City : '',
        State : '',
        Country : '',
        PostalCode : '',
    };
    @track saveRecord = {
        Street : '',
        City : '',
        State : '',
        Country : '',
        PostalCode : '',
    };
    @api
    get cartId() {
        return this.currentCartId;
    }
    set cartId(value) {
        this.currentCartId = value;
    }

    @api
    get contactPointAddressId() {
        return this._contactPointAddressId;
    }
    set contactPointAddressId(value) {
        this._contactPointAddressId = value;
    }

    handleUpdateCartDeliveryGroup(cpaId){
        let params = {
            'cartId' : this.currentCartId,
            'cpAddressId' : cpaId
        };
        updateCartDeliveryGroup({dataMap : params})
        .then((result)=>{
            console.log('update cart delivery group');
            console.log(result);
        })
        .catch((error=>{
            console.log(error);
        }))
    }
    handleUpdateContactPointAddress(cpaId){
        let params = {
            'cpAddressId' : cpaId
        };
        UpdateContactPointAddress({dataMap : params})
        .then((result)=>{
            console.log('update contactpointaddress');
            console.log(result);
        })
        .catch((error=>{
            console.log(error);
        }))
    }

    handleBillingChange(event){
        let selectedBillingId = event.detail.value;
        console.log(selectedBillingId);
        this.handleGetContactPointAddressById(selectedBillingId);
        this.handleUpdateContactPointAddress(selectedBillingId);
        this.handleUpdateCartDeliveryGroup(selectedBillingId);   
    }

    handleShippingChange(event){
        let selectedShippingId = event.detail.value;
        console.log(selectedShippingId);
        this.handleGetContactPointAddressById(selectedShippingId);
        this.handleUpdateCartDeliveryGroup(selectedShippingId);
        this.handleUpdateContactPointAddress(selectedShippingId);
        this._contactPointAddressId = selectedShippingId;
        const shippingAddressEvent = new FlowAttributeChangeEvent('contactPointAddressId', this._contactPointAddressId) 
        this.dispatchEvent(shippingAddressEvent);
        console.log(shippingAddressEvent);   
    }

    handleGetContactPointAddressById(selectedId){
        console.log('call');
        let params = {
            'cpAddressId' : selectedId
        };
        getContactPointAddressById({dataMap : params})
        .then((result)=>{
            console.log('contactpointaddress called');
            console.log(result);
            if(result.AddressType == 'Billing'){
                this.billingRecord.Name = result.Name;
                this.billingRecord.Street = result.Street;
                this.billingRecord.City = result.City;
                this.billingRecord.PostalCode = result.PostalCode;
                this.billingRecord.State = result.State
                this.billingRecord.Country = result.Country;
            }
            else{
                this.shipRecord.Name = result.Name;
                this.shipRecord.Street = result.Street;
                this.shipRecord.Country = result.Country;
                this.shipRecord.City = result.City;
                this.shipRecord.PostalCode = result.PostalCode;
                this.shipRecord.State = result.State;
            }
            console.log(JSON.stringify(this.billingRecord));
            console.log(JSON.stringify(this.shipRecord));
        })
        .catch((error=>{
            console.log(error);
        }))
    }

    handleGetContactPointAddress(){
        let params = {};
        getContactPointAddress({dataMap : params})
        .then((result)=>{
            this.shippingOption = [];
            this.billingOption = [];
            console.log(result);
            for (let key in result) {
                if(result[key].AddressType == 'Shipping'){
                    let optionsStringTxt = `${result[key].Name}`;
                    this.shippingOption.push({ label: optionsStringTxt, value:result[key].Id});
                    console.log(JSON.stringify(this.shippingOption));
                }
                else{
                    let optionsStringTxt = `${result[key].Name}`;
                    this.billingOption.push({ label: optionsStringTxt, value:result[key].Id});
                    console.log(JSON.stringify(this.billingOption));
                }
            } 
            console.log('shipping ops',JSON.stringify(this.shippingOption));
            console.log('Billing ops',JSON.stringify(this.billingOption));
        })
        .catch((error=>{
            console.log(error);
        }))
    }
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    submitDetails(){
        console.log('details Submitted');
        const isInputsCorrectInput = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        if(isInputsCorrectInput){
            console.log('if called')
            this.saveRecord.Street = this.template.querySelector("[data-field='Street']").value;
            this.saveRecord.City = this.template.querySelector("[data-field='city']").value;
            this.saveRecord.State = this.template.querySelector("[data-field='State']").value;
            this.saveRecord.Country  = this.template.querySelector("[data-field='Country']").value;
            this.saveRecord.PostalCode = this.template.querySelector("[data-field='ZipCode']").value;
            
            let params = {
                'address' : this.saveRecord,
                'cartId' : this.currentCartId,
            };
            console.log('params'+params)

            saveNewAddress({dataMap : params})
            .then((result)=>{
                console.log('contact point address inserted');
                console.log(result);
                if(result.isSuccess == true){
                    const event = new ShowToastEvent({
                        title: 'Toast message',
                        message: 'Toast Message',
                        variant: 'success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(event);
                    this.shipRecord.Street = result.cpaRecord.Street;
                    this.shipRecord.Country = result.cpaRecord.Country;
                    this.shipRecord.City = result.cpaRecord.City;
                    this.shipRecord.PostalCode = result.cpaRecord.PostalCode;
                    this.shipRecord.State = result.cpaRecord.State;
                    this.handleGetContactPointAddress();
                    this.handleUpdateCartDeliveryGroup(result.cpaRecord.Id);
                    this.closeModal();
                }
            })
            .catch((error=>{
                console.log(error);
            }))
        }
        console.log(JSON.stringify(this.shipRecord));
    }
    connectedCallback(){
        console.log('call1');
        console.log('currentCartId>>>'+ JSON.stringify(this.currentCartId));
        console.log(this._contactPointAddressId);
        this.handleGetContactPointAddress();
    }
}