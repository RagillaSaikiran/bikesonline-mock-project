/**
 * @description Demonstrates how to make REST calls to ConnectApi.CommerceSearch class
 * to perform Search and Category browsing for B2B Commerce on Lightning.
 *
 * @see B2BUtils
 */

 public with sharing class B2BSearchControllerSample {

    // Cached API version of this apex class.
    private static Decimal apiVersionApexClass = [
        SELECT ApiVersion
        FROM ApexClass
        WHERE Name = 'B2BSearchControllerSample'
        LIMIT 1
    ]

    .ApiVersion;

    /**
     * @description Demonstrates how to call ConnectApi.CommerceSearch.productSearch
     * @param communityId The Id of the community from which the call originated
     * @param searchQuery The search query parameters which includes searchTerm, categoryId, refinements, page and includePrices
     * @param @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     */

    @AuraEnabled
    public static Object productSearch(
        String communityId,
        String searchQuery,
        String effectiveAccountId
    ) {
        // Lookup the webstore ID associated with the community

        String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(
            communityId
        );

        ConnectApi.ProductSearchResults searchProducts;
        Object response;
    try {
        ConnectApi.ProductSearchInput searchInput = (ConnectApi.ProductSearchInput) JSON.deserializeStrict(searchQuery,ConnectApi.ProductSearchInput.class);
        response =  ConnectApi.CommerceSearch.searchProducts( webstoreId, effectiveAccountId,searchInput);

    } catch (System.Exception e) {
        System.debug('ERROR: ' + e);
        throw e;
    }
    return response;
    }
}