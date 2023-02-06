@RestResource(urlMapping='/ProductInventoryItem/*')
global class ProductInventoryItem {
    @HttpGet
    global static Product_Inventory_Item__c getInventoryData() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String productSKU = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        Product_Inventory_Item__c result = [select Id, Availability_Message__c, Availability_Message_RT__c, 
                Available_for_Purchase__c, Committed__c, Inventory_Location_Code__c, Name, Product_Item__c, 
            Product_Item__r.StockKeepingUnit, Qty_Available__c, Reserved__c, Status__c from Product_Inventory_Item__c
                  WHERE Product_Item__r.StockKeepingUnit = :productSKU];
         return result;
    }
    @HttpPatch
    global static void updateInventoryData()
    {
        RestRequest req = RestContext.request;
        String productSKU = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        Product_Inventory_Item__c inventory = [select Id, Availability_Message__c, Availability_Message_RT__c, 
      Available_for_Purchase__c, Committed__c, Inventory_Location_Code__c, Name, Product_Item__c, 
       Product_Item__r.StockKeepingUnit, Qty_Available__c, Reserved__c, Status__c from Product_Inventory_Item__c
                     WHERE Product_Item__r.StockKeepingUnit = :productSKU];
         Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(req.requestBody.toString());
         for(String fieldName : params.KeySet())
         {
             if(fieldName == 'Reserved__c')
             {
                 Decimal newReserved = (Decimal)params.get(fieldName);
                 if(inventory.Reserved__c != null)
                 {
                 inventory.Reserved__c+= newReserved;
                }
                else
                 {
                    inventory.Reserved__c = newReserved;
                 }
             }
            else if(fieldName == 'Committed__c')
             {
                Decimal newCommitted = (Decimal)params.get(fieldName);
                 if(inventory.Committed__c != null)
                 {
                    inventory.Reserved__c-=newCommitted;
                    inventory.Committed__c+=newCommitted;
                 }
                 else
                {
                    inventory.Reserved__c-= newCommitted;
                    inventory.Committed__c = newCommitted;
                 }
             }
             else
            {
                 inventory.put(fieldName, params.get(fieldName));
            }
        }
         try
        {
             update inventory;
        }
        catch(Exception e)
        {
            System.debug(e.getMessage());
        }
    }
}