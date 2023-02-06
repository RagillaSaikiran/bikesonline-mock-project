import { LightningElement } from 'lwc';
import isguest from '@salesforce/user/isGuest';
import Id from '@salesforce/user/Id';
import bikeQueryForm from 'c/bikeQueryForm';

export default class MyFooterPart extends LightningElement {
result;
     Guestuser=isguest;
       userId = Id;
       async handleClick(){
         this.result = await bikeQueryForm.open(
             {
                content: 'hello',
                isGuestUser: this.Guestuser,
                userId: this.userId
             }
             );
         console.log(this.result);
 }
}