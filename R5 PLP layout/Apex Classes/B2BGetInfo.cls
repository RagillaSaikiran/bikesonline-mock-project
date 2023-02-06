public with sharing class B2BGetInfo {
  @AuraEnabled(cacheable=true)
  public static ConnectApi.ProductDetail getProduct(
    String communityId,
    String productId,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);

    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
    return ConnectApi.CommerceCatalog.getProduct(
      webstoreId,
      productId,
      effectiveAccountID,
      null,
      false,
      null,
      false,
      true,
      false
    );
  }


  @AuraEnabled
  public static ConnectApi.CartSummary getCartSummary(
    String communityId,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);

    //'current' is available in version 50.0 and later and indicates a cart with a status that isn’t Closed or PendingDelete
    //This is important for the product detail page since we are using the cart summary to check if the status is "Processing" or "Checkout"
    String activeCartOrId = 'current';

    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
    return ConnectApi.CommerceCart.getCartSummary(
      webstoreId,
      effectiveAccountId,
      activeCartOrId
    );
  }

  @AuraEnabled
  public static ConnectApi.CartItem addToCart(
    String communityId,
    String productId,
    String quantity,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);

    ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
    cartInput.productId = productId;
    cartInput.quantity = quantity;
    cartInput.type = ConnectApi.CartItemType.PRODUCT;

    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_static_methods
    return ConnectApi.CommerceCart.addItemToCart(
      webstoreId,
      effectiveAccountId,
      'active',
      cartInput
    );
  }

  @AuraEnabled
  public static ConnectApi.Wishlist createAndAddToList(
    String communityId,
    String productId,
    String wishlistName,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);

    // Store the product in a WishlistItemInput to pass to the Wishlist
    ConnectApi.WishlistItemInput wishlistItemInput = new ConnectApi.WishlistItemInput();
    wishlistItemInput.productId = productId;

    //Create a wishlistInput to be created
    ConnectApi.WishlistInput wishlistInput = new ConnectApi.WishlistInput();
    wishlistInput.name = wishlistName;
    wishlistInput.products = new List<ConnectApi.WishlistItemInput>{
      wishlistItemInput
    };

    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceWishlist_static_methods.htm#apex_ConnectAPI_CommerceWishlist_static_methods
    return ConnectApi.CommerceWishlist.createWishlist(
      webstoreId,
      effectiveAccountId,
      wishlistInput
    );
  }

  @AuraEnabled(cacheable=true)
  public static ConnectApi.ProductPrice getProductPrice(
    String communityId,
    String productId,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);

    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceStorePricing_static_methods.htm#apex_ConnectAPI_CommerceStorePricing_static_methods
    return ConnectApi.CommerceStorePricing.getProductPrice(
      webstoreId,
      productId,
      effectiveAccountId
    );
  }
  

      // Method to check whether Produts are in Stock or Not
      @AuraEnabled(cacheable=true)
      public static String updateStatus(String productId)
      {
        Map<String, Object> resultData = getInventory(productId);
        Decimal availQuantity = (Decimal)resultData.get('Available_for_Purchase__c');
        if(availQuantity<=0)
        {
          List<Product2> product = [SELECT Id, StockKeepingUnit from Product2 WHERE Id=:productId];
          String sku = product[0].StockKeepingUnit;
          Http http = new Http();
          HttpRequest request = new HttpRequest();
          request.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/apexrest/ProductInventoryItem/'+sku);
          request.setBody('{"Status__c":"Out of Stock"}');
          request.setMethod('PATCH');
          request.setHeader('Authorization','Bearer '+UserInfo.getSessionId());
          request.setHeader('Content-Type', 'application/json');
          HttpResponse response = http.send(request);
          System.debug('response--'+response);
          if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
            return 'Stock Field Updated';
          }
          return 'Stock Field Not Updated';
        }
        return 'In Stock - No need to update Stock Status';
      }
    
      // Method to call getInventory from API Class
      @AuraEnabled(cacheable=true)
      public static Map<String, Object> getInventory(String productId) {
        List<Product2> product = [SELECT Id, StockKeepingUnit from Product2 WHERE Id=:productId];
        String sku = product[0].StockKeepingUnit;
        Http http = new Http();
        Map<String,Object> responseData  = new Map<String,Object>();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/apexrest/ProductInventoryItem/'+sku);
        request.setMethod('GET');
        request.setHeader('Authorization','Bearer '+UserInfo.getSessionId());
        request.setHeader('Content-Type', 'application/json');
        HttpResponse response = http.send(request);
        // If the request is successful, parse the JSON response.
        System.debug('response--'+response);
        if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
          responseData = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        }
        return responseData;
      }
    
      //Method to update Inventory for reserve and Commit
      @AuraEnabled(cacheable=true)
      public static String updateInventory(String productId, String sku, Decimal reservedQuantity) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/apexrest/ProductInventoryItem/'+sku);
        request.setBody('{"Reserved__c":'+reservedQuantity+'}');
        request.setMethod('PATCH');
        request.setHeader('Authorization','Bearer '+UserInfo.getSessionId());
        request.setHeader('Content-Type', 'application/json');
        HttpResponse response = http.send(request);
        //System.debug('xxx'+ reservedQuantity);
        // If the request is successful, parse the JSON response.
        System.debug('response--'+response);
        if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
          return 'Field Updated';
        }
        return 'Field Not Updated';
      }
    
      @AuraEnabled(cacheable=true)
      public static void committInventory(String orderSummaryId){
      List<OrderItemSummary> orderItems = [SELECT Id, OrderSummaryId, Quantity, StockKeepingUnit, Product2Id FROM OrderItemSummary WHERE OrderSummaryId =:orderSummaryId];
      for(OrderItemSummary odis : orderItems){
        String sku = odis.StockKeepingUnit;
        if(sku!=null){
            Decimal newCommittedQuantity = odis.Quantity;
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/apexrest/ProductInventoryItem/'+sku);
            request.setBody('{"Committed__c":'+newCommittedQuantity+'}');
            request.setMethod('PATCH');
            request.setHeader('Authorization','Bearer '+UserInfo.getSessionId());
            request.setHeader('Content-Type', 'application/json');
            HttpResponse response = http.send(request);
            }
      }
    }
      
  //Method to create case when product is Out of Stock
  @AuraEnabled
  public static string createCase(String productId, String userId){
    try {
      List<User> userlist = [SELECT u.Id, u.ContactId FROM User u WHERE u.Id =:userId];
      Case ca = new Case();
      //ca.Origin = 'Web';
      ca.ContactId = userlist[0].ContactId;
      //ca.AccountId = effectiveAccountId;
      ca.Comments = 'Notify Me When Product Available';
      insert ca;
      return 'Successfully created Case';
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
