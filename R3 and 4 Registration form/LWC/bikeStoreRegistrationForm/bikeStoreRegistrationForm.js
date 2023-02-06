import { LightningElement,api,track,wire } from 'lwc';
import registerUser from '@salesforce/apex/bikeStoreRegistrationForm.registerUser';
import isEmailExist from '@salesforce/apex/bikeStoreRegistrationForm.isEmailExist';
import isPhoneExist from '@salesforce/apex/bikeStoreRegistrationForm.isPhoneExist';
import pset from '@salesforce/apex/bikeStoreRegistrationForm.pset';


// import getPSAForPsGroups from '@salesforce/apex/B2B_PermissionSetGroupAssignmentUtils.getPSAForPsGroups'
export default class BikeStoreRegistrationForm extends LightningElement 
{
    @api showModal = false; // to show the modal for an error success or any warning
    @track firstName = ''; // first name I have passed the apex class full name = firstName+LastName;
    @track lastName = '';
    @track email = null;
    @track Phone = null;
    @track username = null;
    @track password = null;
    @track confirmPassword='';

    @track companyName=null;
    @track isCompanyUser = false;
    @track accountName = null;
    @track psetGroupId = '0PG5h000000kIdhGAE';
     newUID;
    @track loginUrl;
    // @track navigationVar;
    // Error Handling

    @track errorCheck;
    @track defaultErrorMsg;
    @track emailError;   
    @track errorMessage;    // to show error message
    @track passwordTooltip='tooltiptext tooltipHide';
    @track passwordTooltiperror = 'tooltiptext tooltipHide';



    // @track
    // @track error;
    @track showTermsAndConditions=false;
    @track userName = '';
    @track userCreated = false;
    showUserName;
    @track pageLoading = true;
    @track tooltip_style ='tooltiptext';
    @track tooltip_styleShow = 'tooltiptext tooltipShow';
    @track tooltip_styleHide = 'tooltiptext tooltipHide';
    @track tooltip_field = 'tooltiptext tooltipHide';

    @track showToast = false;
    @track toastTitle ="This Field is Required";
    @track toastMessage = "Please enter the correct/Required Value";


    connectedCallback()
    {
        this.pageLoading = false;
        this.defaultErrorMsg = "Something Went Wrong, Please Try Again after sometimes";
        this.errorCheck = false;
        this.isCompanyUser= false;
    }

    handleFirstNameChange(event)
    {
        this.firstName = event.target.value;
        console.log(`firstname ${this.firstname}`)
        if(!this.isCompanyUser)
        {
            this.accountName = this.firstName + this.lastName;
            console.log(this.accountName);
        }
        if(this.lastName == '' && this.firstName == '')
        {
            this.accountName = null;
        }
        if(this.lastName == null && this.firstName == null)
        {
            this.accountName = null;
        }

    }

    handleLastNameChange(event)
    {
        this.lastName = event.target.value;
        if(!this.isCompanyUser)
        {
            this.accountName = this.firstName + this.lastName;
            console.log(this.accountName);
        }
        if(this.lastName == '' && this.firstName == '')
        {
            this.accountName = null;
        }
        if(this.lastName == null && this.firstName == null)
        {
            this.accountName = null;
        }
    }
    

    handleEmailHover(event)
    {
        // On Hovering over Email
    }
    handleEmailChange(event)
    {
        this.email = event.target.value;
        this.userName = event.target.value;
    }
    onEmailInvalid(event)
    {

        if (!event.target.validity.valid) 
        {
            event.target.setCustomValidity('Enter a valid email address')
        }
    }
    onEmailInput(event)
    {

        event.target.setCustomValidity('')
    }
    handlePhoneChange(event){
        this.Phone =event.target.value;

    }

    handlePasswordChange(event){

        this.password = event.target.value;
    }

    handleConfirmPasswordChange(event){

        this.confirmPassword = event.target.value;
    }


    handleTermsAndConditions(event){

        this.showTermsAndConditions = true;
    }
    closeTermsAndConditions()
    {
        this.showTermsAndConditions = false;
    }

    handleRegister(event)
    {
                            // Field Validation
                            console.log('Inside Handle Register');
                            this.errorCheck = false;
                            this.errorMessage = null;

                            this.tooltip_field = 'tooltiptext tooltipHide';
                            this.tooltip_field = 'tooltiptext tooltipHide';

                            if(!this.firstName || this.firstName == ''){

                                this.tooltip_field = 'tooltiptext tooltipShow';

                            } else {

                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }

                            if(!this.lastName || this.lastName == ''){

                                this.tooltip_field = 'tooltiptext tooltipShow';

                            } else {
                                
                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }

                            if(!this.email){

                                this.tooltip_field = 'tooltiptext tooltipShow';

                            } else {
                                
                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }
                            
                            if(!this.Phone){

                                this.tooltip_field = 'tooltiptext tooltipShow';

                            } else {

                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }

                            if(!this.password){

                                this.tooltip_field = 'tooltiptext tooltipShow';
                                

                            } else {
                                
                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }

                            if(!this.confirmPassword){

                                this.tooltip_field = 'tooltiptext tooltipShow';

                            } else {
                                
                                this.tooltip_field = 'tooltiptext tooltipHide';
                            }
                            //  End of field validation


                            // this.showNotification();
                            console.log('Inside the handleReg')
                            this.pageLoading = true;
                            
                            // this.tooltip_style ='tooltiptext tooltipHide';
                            this.showToast = false;

                            if(this.firstName && this.lastName && this.email && this.userName && this.Phone && this.password && this.confirmPassword)
                            {
                                if(this.password != this.confirmPassword){
                    
                                    this.tooltip_field = "tooltiptext tooltipHide";
                                    this.passwordError = 'Password did not match. Please Make sure both the passwords match.';
                                    this.passwordTooltiperror = 'tooltiptext tooltipShow tooltipError';
                    
                                    
                                    this.pageLoading = false;
                                    
                                    return;
                                }else{
                                    isEmailExist({Email: this.email})
                                    .then((result) =>{
                                        if(result != null && result != undefined && result == true)
                                        {
                                            console.log('debug4');
                                            console.log('result', result)
        
                                            this.errorCheck = true;
                                            this.emailError = 'Your username already exists';
                                            this.errorMessage= 'email already exists';
                                            this.pageLoading = false;
                                            console.log('Check 3');
                                        }
                                        else {
                                            isPhoneExist({Phone: this.Phone})
                                            .then((result3) =>{
                                                if(result3 != null && result3 != undefined && result3 == true)
                                                {
                                                    console.log('debug4');
                                                    console.log('result', result3)
                                         
                                                    this.errorCheck = true;
                                                    this.emailError = 'Your username already exists.';
                                                    this.errorMessage = 'PhoneNumber already exists';
                                                    this.pageLoading = false;
                                                    console.log('Check 3');
                                                }
                                                else {
                                            
        
                                                registerUser({ firstName: this.firstName, lastName: this.lastName, email: this.email, phone:this.Phone, accountName : this.accountName, pass:this.password, orgUser:this.isCompanyUser})
                                                .then((result1) => 
                                                {
                                                                
                                                    if(result1){    
                                        
                                                        
                                                         console.log(JSON.stringify(result1));
                                                        console.log('Yay! User Created Successfully');
                                                        this.newUID = result1[1];
                                                        this.loginUrl = result1[3];
                                                        // console.log(this.newUID);
                                                        // console.log(this.loginUrl);
                                                        // window.location.href = this.loginUrl;
        
                                                        this.userCreated  =true;
                                                        this.assignPS();
                                                    
                                                    }
                                                    
                                                })
                                                .catch((error) => {
                                                    console.log('debugT2');
                                                    
                                    
                                                    console.log('error-',error);
                                                    // console.log('Check 5');
        
                                                    this.pageLoading = false;
                                    
                                                    if(error && error.body && error.body.message){
                                    
                                                        this.errorCheck = true;
                                                        this.errorMessage = error.body.message;
                                                        console.log('Check 6');
                                                        
                                                    
                                                    }           
                                                    
                                                });
                                            }
                                                
                                            })
                                            .catch((error) => {
                                                console.log('debugT3');
                                                
                                
                                                console.log('error-',error);
                                                // console.log('Check 5');
        
                                                this.pageLoading = false;
                                
                                                if(error && error.body && error.body.message){
                                
                                                    this.errorCheck = true;
                                                    this.errorMessage = error.body.message;
                                                    console.log('Check 6');
                                                    
                                                
                                                }           
                                                
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        this.error = error;
                                        console.log('debugT3');
                                    
                                        if(error && error.body && error.body.message){
                                            // console.log('Check 7');
                                            console.log('error msg-', error.body.message);
                                        }
        
                                        this.pageLoading = false;
                                        
                                    });

                                }
                               
                            }
                           
    }


    // Assigning Permission Sets to new User

    assignPS()
    {
        
        pset({permissionsetGroupsID:this.psetGroupId, userId: this.newUID})
        .then((result2) =>
        {
            console.log(result2);
            console.log(this.loginUrl);
            window.location.href = this.loginUrl;
            this.pageLoading = false;
        })
        .catch((error) =>
        {

            this.error = error;
            console.log('debugT4');
            this.pageLoading =false;
            console.log(error);
        });
    }
}