public with sharing class bikeQueryForm {
    public bikeQueryForm() {
    }
    @AuraEnabled
    public static string createLead(string firstname, string lastname, string email, string companyname, string comment){
        try {
            lead le = new Lead();
            le.Firstname = firstname;
            le.Lastname = lastname;
            le.Email = email;
            le.Company = companyname;
            le.Description = comment;
            le.LeadSource = 'B2B store';
            
            insert le;
            return 'lead created successfully';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string createCase(string comment, string id){
        try {
            list<user> userlist = [SELECT u.Id, u.contactId FROM user u WHERE u.Id =:id ];

            case cas = new Case();
            cas.Comments = comment;
            cas.Origin = 'web';
            cas.ContactId = userlist[0].ContactId;
            insert cas;
            return 'case created successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
