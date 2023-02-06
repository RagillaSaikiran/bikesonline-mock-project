import { LightningElement, api, track  } from 'lwc';
import LightningModal from 'lightning/modal';
import createCase from '@salesforce/apex/bikeQueryForm.createCase';
import createLead from '@salesforce/apex/bikeQueryForm.createLead';

export default class BikeQueryForm extends LightningModal {
  @api content;
  @api isGuestUser;
  @api userId;

  @track firstName = '';
  @track lastName = '';
  @track email = null;
  @track companyName= null;
  @track comment= null;

  handleFirstNameChange(event){
    this.firstName = event.target.value;
  }
  handleLastNameChange(event){
    this.lastName = event.target.value;
  }
  handleEmailChange(event){
    this.email = event.target.value;
  }
  handleCompanyNameChange(event){
    this.companyName = event.target.value;
  }
  handleComment(event){
    this.comment = event.target.value;
  }
  
    handleSubmitLead(){
    createLead({firstname : this.firstName, lastname : this.lastName, email : this.email, companyname : this.companyName, comment : this.comment})
    .then((result) =>{
        console.log(result);
      })
      this.close('okay');
   }

  handleSubmitCase(){
    createCase({comment : this.comment, id : this.userId})
    .then((result1) =>{
      console.log(result1)
    })
    this.close('Okay');
  }
}