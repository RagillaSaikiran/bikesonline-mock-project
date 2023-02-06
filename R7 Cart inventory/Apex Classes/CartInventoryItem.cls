@RestResource(urlMapping='/CartInventoryItem/*')
global class CartInventoryItem {
    @HttpPatch
    global static void updateCartInventory()
    {
        RestRequest req = RestContext.request;
        //String productSKU = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        String requestBody = req.requestBody.toString();
        List<Product_Inventory_Item__c> inventoriesToUpdate = new List<Product_Inventory_Item__c>();
        Map<String,Object> inventories = (Map<String, Object>) JSON.deserializeUntyped(requestBody);
        Map<String, Object> inventoriesList = (Map<String, Object>)inventories.get('reqBody');
        String uniqueValue = (String)inventories.get('check');

        if(uniqueValue == 'clearCart' || uniqueValue == 'removeCart' || uniqueValue == 'decreasedQuantity')
        {
            List<Object> Ids = (List<Object>)inventories.get('productId');
            List<String> lstStr = new List<String>();
            for(Object a:Ids)
            {
                lstStr.add(String.valueOf(a));
            }
            for(Product_Inventory_Item__c items : [select Id, Availability_Message__c, Availability_Message_RT__c, 
            Available_for_Purchase__c, Committed__c, Inventory_Location_Code__c, Name, Product_Item__c, 
                Product_Item__r.StockKeepingUnit, Qty_Available__c, Reserved__c, Status__c from Product_Inventory_Item__c
              WHERE Product_Item__c in:lstStr])
            {
                Decimal oldReserve = (Decimal)inventoriesList.get(items.Product_Item__c);
                items.Reserved__c-= oldReserve;
                inventoriesToUpdate.add(items);
            }

        }
        else if(uniqueValue == 'increasedQuantity')
        {
            List<Object> Ids = (List<Object>)inventories.get('productId');
            List<String> lstStr = new List<String>();
            for(Object a:Ids)
            {
                lstStr.add(String.valueOf(a));
            }
            for(Product_Inventory_Item__c items : [select Id, Availability_Message__c, Availability_Message_RT__c, 
            Available_for_Purchase__c, Committed__c, Inventory_Location_Code__c, Name, Product_Item__c, 
                Product_Item__r.StockKeepingUnit, Qty_Available__c, Reserved__c, Status__c from Product_Inventory_Item__c
              WHERE Product_Item__c in:lstStr])
            {
                Decimal oldReserve = (Decimal)inventoriesList.get(items.Product_Item__c);
                items.Reserved__c+= oldReserve;
                inventoriesToUpdate.add(items);
            }
        }
        try
        {
            update inventoriesToUpdate;
        }
        catch(Exception e)
        {
            System.debug(e.getMessage());
        }

    }
}