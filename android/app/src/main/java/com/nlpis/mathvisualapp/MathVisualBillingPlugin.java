package com.nlpis.mathvisualapp;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@CapacitorPlugin(name = "MathVisualBilling")
public class MathVisualBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billingClient;
    private boolean connectionInFlight = false;
    private final List<PendingReadyRequest> pendingReadyRequests = new ArrayList<>();

    @Override
    public void load() {
        super.load();
        ensureBillingClient();
        startConnectionIfNeeded();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        ensureReady(() -> syncPurchasesInternal(new ArrayList<>(), null, true, "resume"));
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (billingClient != null) {
            billingClient.endConnection();
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        ensureReady(() -> {
            JSObject payload = new JSObject();
            payload.put("available", true);
            payload.put("connected", billingClient != null && billingClient.isReady());
            payload.put("platform", "android");
            payload.put("store", "google_play");
            payload.put("libraryVersion", "8.3.0");
            call.resolve(payload);
        }, call);
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        List<RequestedProduct> requestedProducts = parseRequestedProducts(call.getArray("items"), null, null);
        if (requestedProducts.isEmpty()) {
            JSObject payload = new JSObject();
            payload.put("products", new JSArray());
            payload.put("notFoundProductIds", new JSArray());
            call.resolve(payload);
            return;
        }

        ensureReady(() -> queryProductDetails(requestedProducts, new QueryCallback() {
            @Override
            public void onSuccess(JSArray products, JSArray notFoundProductIds) {
                JSObject payload = new JSObject();
                payload.put("products", products);
                payload.put("notFoundProductIds", notFoundProductIds);
                call.resolve(payload);
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        }), call);
    }

    @PluginMethod
    public void purchaseProduct(PluginCall call) {
        String productId = safeString(call.getString("productId"));
        String productType = normalizeProductType(call.getString("type"));
        String preferredOfferToken = safeString(call.getString("offerToken"));

        if (productId.isEmpty()) {
            call.reject("productId is required.", "ERR_NO_PRODUCT_ID");
            return;
        }

        RequestedProduct requestedProduct = new RequestedProduct(productId, productType);
        ensureReady(() -> queryProductDetails(singletonList(requestedProduct), new QueryCallback() {
            @Override
            public void onSuccess(JSArray products, JSArray notFoundProductIds) {
                ProductDetails details = findQueriedProductDetails(productId, productType);
                if (details == null) {
                    call.reject("Product is not available in Google Play for this build.", "ERR_PRODUCT_UNAVAILABLE");
                    return;
                }

                BillingFlowParams.ProductDetailsParams productDetailsParams = buildFlowProductParams(details, preferredOfferToken);
                if (productDetailsParams == null) {
                    call.reject("No eligible Google Play offer was found for this product.", "ERR_NO_OFFER");
                    return;
                }

                JSObject launchPayload = new JSObject();
                launchPayload.put("productId", productId);
                launchPayload.put("type", productType);
                launchPayload.put("started", false);

                getActivity().runOnUiThread(() -> {
                    BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(singletonList(productDetailsParams))
                        .build();
                    BillingResult billingResult = billingClient.launchBillingFlow(getActivity(), billingFlowParams);
                    launchPayload.put("started", billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK);
                    launchPayload.put("responseCode", billingResult.getResponseCode());
                    launchPayload.put("debugMessage", safeString(billingResult.getDebugMessage()));
                    call.resolve(launchPayload);
                    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        notifyPurchaseEvent("launch_error", billingResult, null, "launch");
                    }
                });
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        }), call);
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        List<RequestedProduct> requestedProducts = parseRequestedProducts(call.getArray("items"), null, null);
        ensureReady(() -> syncPurchasesInternal(requestedProducts, call, true, "restore"), call);
    }

    @PluginMethod
    public void syncPurchases(PluginCall call) {
        List<RequestedProduct> requestedProducts = parseRequestedProducts(call.getArray("items"), null, null);
        ensureReady(() -> syncPurchasesInternal(requestedProducts, call, true, "sync"), call);
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, List<Purchase> purchases) {
        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            handlePurchaseList(purchases, "purchase_update");
            return;
        }
        if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            notifyPurchaseEvent("cancelled", billingResult, null, "purchase");
            return;
        }
        notifyPurchaseEvent("error", billingResult, null, "purchase");
    }

    private void ensureBillingClient() {
        if (billingClient != null) return;
        BillingClient.Builder builder = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enableAutoServiceReconnection()
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .build()
            );
        billingClient = builder.build();
    }

    private void startConnectionIfNeeded() {
        ensureReady(null, null);
    }

    private void ensureReady(Runnable readyAction) {
        ensureReady(readyAction, null);
    }

    private void ensureReady(Runnable readyAction, PluginCall call) {
        ensureBillingClient();
        if (billingClient.isReady()) {
            if (readyAction != null) readyAction.run();
            return;
        }
        pendingReadyRequests.add(new PendingReadyRequest(readyAction, call));
        if (connectionInFlight) return;

        connectionInFlight = true;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                connectionInFlight = false;
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    notifyBillingState("connected", billingResult);
                    List<PendingReadyRequest> pendingRequests = new ArrayList<>(pendingReadyRequests);
                    pendingReadyRequests.clear();
                    for (PendingReadyRequest pendingRequest : pendingRequests) {
                        if (pendingRequest.readyAction != null) pendingRequest.readyAction.run();
                    }
                    return;
                }
                List<PendingReadyRequest> pendingRequests = new ArrayList<>(pendingReadyRequests);
                pendingReadyRequests.clear();
                notifyBillingState("setup_error", billingResult);
                for (PendingReadyRequest pendingRequest : pendingRequests) {
                    if (pendingRequest.call != null) {
                        pendingRequest.call.reject(getBillingMessage(billingResult, "Failed to connect to Google Play Billing."), "ERR_BILLING_SETUP");
                    }
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                connectionInFlight = false;
                notifyBillingState("disconnected", null);
            }
        });
    }

    private void queryProductDetails(List<RequestedProduct> requestedProducts, QueryCallback callback) {
        Map<String, List<RequestedProduct>> groupedByType = new LinkedHashMap<>();
        for (RequestedProduct requestedProduct : requestedProducts) {
            groupedByType.computeIfAbsent(requestedProduct.type, (key) -> new ArrayList<>()).add(requestedProduct);
        }

        if (groupedByType.isEmpty()) {
            callback.onSuccess(new JSArray(), new JSArray());
            return;
        }

        JSArray productsPayload = new JSArray();
        Set<String> foundKeys = new LinkedHashSet<>();
        int[] remainingCalls = { groupedByType.size() };
        boolean[] finished = { false };
        for (Map.Entry<String, List<RequestedProduct>> entry : groupedByType.entrySet()) {
            List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
            for (RequestedProduct requestedProduct : entry.getValue()) {
                productList.add(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(requestedProduct.productId)
                        .setProductType(requestedProduct.type)
                        .build()
                );
            }

            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

            billingClient.queryProductDetailsAsync(params, (billingResult, queryProductDetailsResult) -> {
                if (finished[0]) return;
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    finished[0] = true;
                    callback.onError("ERR_QUERY_PRODUCTS", getBillingMessage(billingResult, "Google Play could not load products right now."));
                    return;
                }

                List<ProductDetails> productDetailsList = queryProductDetailsResult.getProductDetailsList();
                for (ProductDetails details : productDetailsList) {
                    productsPayload.put(serializeProductDetails(details));
                    foundKeys.add(buildProductKey(details.getProductId(), details.getProductType()));
                }

                remainingCalls[0] -= 1;
                if (remainingCalls[0] > 0) return;

                JSArray notFoundProductIds = new JSArray();
                for (RequestedProduct requestedProduct : requestedProducts) {
                    String requestedKey = buildProductKey(requestedProduct.productId, requestedProduct.type);
                    if (!foundKeys.contains(requestedKey)) {
                        notFoundProductIds.put(requestedProduct.productId);
                    }
                }
                callback.onSuccess(productsPayload, notFoundProductIds);
            });
        }
    }

    private void syncPurchasesInternal(List<RequestedProduct> requestedProducts, PluginCall call, boolean notifyListeners, String reason) {
        Set<String> requestedProductIds = new LinkedHashSet<>();
        Set<String> requestedTypes = new LinkedHashSet<>();
        for (RequestedProduct requestedProduct : requestedProducts) {
            requestedProductIds.add(requestedProduct.productId);
            requestedTypes.add(requestedProduct.type);
        }
        if (requestedTypes.isEmpty()) {
            requestedTypes.add(BillingClient.ProductType.SUBS);
            requestedTypes.add(BillingClient.ProductType.INAPP);
        }

        JSArray purchasesPayload = new JSArray();
        Set<String> activeProductIds = new LinkedHashSet<>();
        int[] remainingCalls = { requestedTypes.size() };
        final boolean[] sawError = { false };

        for (String productType : requestedTypes) {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(productType)
                .build();

            billingClient.queryPurchasesAsync(params, (billingResult, purchasesList) -> {
                if (sawError[0]) return;
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    sawError[0] = true;
                    if (call != null) {
                        call.reject(getBillingMessage(billingResult, "Failed to sync purchases from Google Play."), "ERR_QUERY_PURCHASES");
                    }
                    notifyPurchaseEvent("sync_error", billingResult, null, reason);
                    return;
                }

                for (Purchase purchase : purchasesList) {
                    List<String> products = purchase.getProducts();
                    boolean matchesRequestedProducts = requestedProductIds.isEmpty();
                    if (!matchesRequestedProducts) {
                        for (String productId : products) {
                            if (requestedProductIds.contains(productId)) {
                                matchesRequestedProducts = true;
                                break;
                            }
                        }
                    }
                    if (!matchesRequestedProducts) continue;

                    purchasesPayload.put(serializePurchase(purchase));
                    if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                        activeProductIds.addAll(products);
                        acknowledgePurchaseIfNeeded(purchase, reason);
                    }
                }

                remainingCalls[0] -= 1;
                if (remainingCalls[0] > 0) return;

                JSObject payload = new JSObject();
                payload.put("reason", reason);
                payload.put("hasPremium", activeProductIds.size() > 0);
                payload.put("activeProductIds", new JSArray(new ArrayList<>(activeProductIds)));
                payload.put("purchases", purchasesPayload);
                payload.put("syncedAt", System.currentTimeMillis());

                if (notifyListeners) {
                    notifyListeners("billingStateChanged", payload);
                }
                if (call != null) {
                    call.resolve(payload);
                }
            });
        }
    }

    private void handlePurchaseList(List<Purchase> purchases, String reason) {
        JSArray purchasesPayload = new JSArray();
        Set<String> activeProductIds = new LinkedHashSet<>();
        for (Purchase purchase : purchases) {
            purchasesPayload.put(serializePurchase(purchase));
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                activeProductIds.addAll(purchase.getProducts());
                acknowledgePurchaseIfNeeded(purchase, reason);
            }
        }

        JSObject payload = new JSObject();
        payload.put("status", activeProductIds.isEmpty() ? "pending" : "purchased");
        payload.put("reason", reason);
        payload.put("hasPremium", activeProductIds.size() > 0);
        payload.put("activeProductIds", new JSArray(new ArrayList<>(activeProductIds)));
        payload.put("purchases", purchasesPayload);
        payload.put("syncedAt", System.currentTimeMillis());
        notifyListeners("purchaseUpdated", payload);
        notifyListeners("billingStateChanged", payload);
    }

    private void acknowledgePurchaseIfNeeded(Purchase purchase, String reason) {
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED || purchase.isAcknowledged()) return;
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, billingResult -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) return;
            notifyPurchaseEvent("acknowledge_error", billingResult, purchase, reason);
        });
    }

    private ProductDetails findQueriedProductDetails(String productId, String productType) {
        return cachedDetails.get(buildProductKey(productId, productType));
    }

    private final Map<String, ProductDetails> cachedDetails = new LinkedHashMap<>();

    private JSObject serializeProductDetails(ProductDetails details) {
        cachedDetails.put(buildProductKey(details.getProductId(), details.getProductType()), details);

        JSObject payload = new JSObject();
        payload.put("productId", safeString(details.getProductId()));
        payload.put("type", safeString(details.getProductType()));
        payload.put("title", safeString(details.getTitle()));
        payload.put("name", safeString(details.getName()));
        payload.put("description", safeString(details.getDescription()));

        if (BillingClient.ProductType.SUBS.equals(details.getProductType())) {
            ProductDetails.SubscriptionOfferDetails offerDetails = chooseSubscriptionOffer(details, "");
            if (offerDetails != null) {
                ProductDetails.PricingPhase phase = choosePricingPhase(offerDetails);
                payload.put("offerToken", safeString(offerDetails.getOfferToken()));
                payload.put("basePlanId", safeString(offerDetails.getBasePlanId()));
                payload.put("offerId", safeString(offerDetails.getOfferId()));
                if (phase != null) {
                    payload.put("formattedPrice", safeString(phase.getFormattedPrice()));
                    payload.put("priceCurrencyCode", safeString(phase.getPriceCurrencyCode()));
                    payload.put("priceAmountMicros", phase.getPriceAmountMicros());
                    payload.put("billingPeriod", safeString(phase.getBillingPeriod()));
                }
            }
        } else {
            ProductDetails.OneTimePurchaseOfferDetails offerDetails = chooseOneTimeOffer(details, "");
            if (offerDetails != null) {
                payload.put("offerToken", safeString(offerDetails.getOfferToken()));
                payload.put("formattedPrice", safeString(offerDetails.getFormattedPrice()));
                payload.put("priceCurrencyCode", safeString(offerDetails.getPriceCurrencyCode()));
                payload.put("priceAmountMicros", offerDetails.getPriceAmountMicros());
            }
        }

        return payload;
    }

    private JSObject serializePurchase(Purchase purchase) {
        JSObject payload = new JSObject();
        payload.put("orderId", safeString(purchase.getOrderId()));
        payload.put("purchaseToken", safeString(purchase.getPurchaseToken()));
        payload.put("packageName", safeString(purchase.getPackageName()));
        payload.put("purchaseState", purchase.getPurchaseState());
        payload.put("isAcknowledged", purchase.isAcknowledged());
        payload.put("isAutoRenewing", purchase.isAutoRenewing());
        payload.put("purchaseTime", purchase.getPurchaseTime());
        payload.put("products", new JSArray(new ArrayList<>(purchase.getProducts())));
        return payload;
    }

    private BillingFlowParams.ProductDetailsParams buildFlowProductParams(ProductDetails details, String preferredOfferToken) {
        BillingFlowParams.ProductDetailsParams.Builder builder = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details);

        if (BillingClient.ProductType.SUBS.equals(details.getProductType())) {
            ProductDetails.SubscriptionOfferDetails offerDetails = chooseSubscriptionOffer(details, preferredOfferToken);
            if (offerDetails == null) return null;
            builder.setOfferToken(offerDetails.getOfferToken());
            return builder.build();
        }

        ProductDetails.OneTimePurchaseOfferDetails oneTimeOfferDetails = chooseOneTimeOffer(details, preferredOfferToken);
        if (oneTimeOfferDetails != null && !safeString(oneTimeOfferDetails.getOfferToken()).isEmpty()) {
            builder.setOfferToken(oneTimeOfferDetails.getOfferToken());
        }
        return builder.build();
    }

    private ProductDetails.SubscriptionOfferDetails chooseSubscriptionOffer(ProductDetails details, String preferredOfferToken) {
        List<ProductDetails.SubscriptionOfferDetails> offers = details.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) return null;
        String normalizedToken = safeString(preferredOfferToken);
        if (!normalizedToken.isEmpty()) {
            for (ProductDetails.SubscriptionOfferDetails offer : offers) {
                if (normalizedToken.equals(safeString(offer.getOfferToken()))) {
                    return offer;
                }
            }
        }
        return offers.get(0);
    }

    private ProductDetails.OneTimePurchaseOfferDetails chooseOneTimeOffer(ProductDetails details, String preferredOfferToken) {
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
        if (offers == null || offers.isEmpty()) return null;
        String normalizedToken = safeString(preferredOfferToken);
        if (!normalizedToken.isEmpty()) {
            for (ProductDetails.OneTimePurchaseOfferDetails offer : offers) {
                if (normalizedToken.equals(safeString(offer.getOfferToken()))) {
                    return offer;
                }
            }
        }
        return offers.get(0);
    }

    private ProductDetails.PricingPhase choosePricingPhase(ProductDetails.SubscriptionOfferDetails offerDetails) {
        if (offerDetails.getPricingPhases() == null || offerDetails.getPricingPhases().getPricingPhaseList().isEmpty()) {
            return null;
        }
        List<ProductDetails.PricingPhase> phases = offerDetails.getPricingPhases().getPricingPhaseList();
        return phases.get(phases.size() - 1);
    }

    private void notifyBillingState(String status, BillingResult billingResult) {
        JSObject payload = new JSObject();
        payload.put("status", safeString(status));
        payload.put("connected", billingClient != null && billingClient.isReady());
        if (billingResult != null) {
            payload.put("responseCode", billingResult.getResponseCode());
            payload.put("debugMessage", safeString(billingResult.getDebugMessage()));
        }
        notifyListeners("billingStateChanged", payload);
    }

    private void notifyPurchaseEvent(String status, BillingResult billingResult, Purchase purchase, String reason) {
        JSObject payload = new JSObject();
        payload.put("status", safeString(status));
        payload.put("reason", safeString(reason));
        if (billingResult != null) {
            payload.put("responseCode", billingResult.getResponseCode());
            payload.put("debugMessage", safeString(billingResult.getDebugMessage()));
        }
        if (purchase != null) {
            payload.put("purchase", serializePurchase(purchase));
        }
        notifyListeners("purchaseUpdated", payload);
    }

    private String getBillingMessage(BillingResult billingResult, String fallback) {
        String debugMessage = billingResult != null ? safeString(billingResult.getDebugMessage()) : "";
        if (!debugMessage.isEmpty()) return debugMessage;
        return fallback;
    }

    private List<RequestedProduct> parseRequestedProducts(JSArray items, String fallbackProductId, String fallbackType) {
        LinkedHashMap<String, RequestedProduct> uniqueProducts = new LinkedHashMap<>();

        if (items != null) {
            for (int index = 0; index < items.length(); index++) {
                JSONObject item = items.optJSONObject(index);
                if (item == null) continue;
                String productId = safeString(item.optString("productId", ""));
                String productType = normalizeProductType(item.optString("type", ""));
                if (productId.isEmpty()) continue;
                uniqueProducts.put(buildProductKey(productId, productType), new RequestedProduct(productId, productType));
            }
        }

        String singleProductId = safeString(fallbackProductId);
        if (!singleProductId.isEmpty()) {
            String singleType = normalizeProductType(fallbackType);
            uniqueProducts.put(buildProductKey(singleProductId, singleType), new RequestedProduct(singleProductId, singleType));
        }

        return new ArrayList<>(uniqueProducts.values());
    }

    private String normalizeProductType(String value) {
        String normalized = safeString(value).toLowerCase(Locale.ROOT);
        if ("subs".equals(normalized) || "subscription".equals(normalized) || BillingClient.ProductType.SUBS.equals(normalized)) {
            return BillingClient.ProductType.SUBS;
        }
        return BillingClient.ProductType.INAPP;
    }

    private String buildProductKey(String productId, String type) {
        return safeString(type) + "::" + safeString(productId);
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private <T> List<T> singletonList(T value) {
        List<T> list = new ArrayList<>();
        list.add(value);
        return list;
    }

    private interface QueryCallback {
        void onSuccess(JSArray products, JSArray notFoundProductIds);

        void onError(String code, String message);
    }

    private static class RequestedProduct {
        final String productId;
        final String type;

        RequestedProduct(String productId, String type) {
            this.productId = productId;
            this.type = type;
        }
    }

    private static class PendingReadyRequest {
        final Runnable readyAction;
        final PluginCall call;

        PendingReadyRequest(Runnable readyAction, PluginCall call) {
            this.readyAction = readyAction;
            this.call = call;
        }
    }
}
