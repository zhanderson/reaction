import { cloneDeep } from "lodash";
import mockContext from "/imports/test-utils/helpers/mockContext";
import { registerPluginHandler, getTaxServicesForShop } from "./registration";

const fakeShopId = "FAKE_SHOP_ID";
const fakePackage = {
  _id: "FAKE_PKG_ID",
  name: "fake",
  shopId: fakeShopId,
  settings: {
    activeTaxServiceName: "custom-rates",
    fallbackTaxServiceName: "rapid-tax-service"
  }
};

// test pluginTaxServices
const pluginTaxServices = [{
  name: "rapid-tax-service",
  taxServices: [{
    displayName: "RapidTaxService",
    name: "rapid-tax-service",
    functions: {
      calculateOrderTaxes() { },
      getTaxCodes() { }
    }
  }]
}, {
  name: "custom-rates",
  taxServices: [{
    displayName: "Custom Rates",
    name: "custom-rates",
    functions: {
      calculateOrderTaxes() { },
      getTaxCodes() { }
    }
  }]
}];

pluginTaxServices.forEach(({ name, taxServices }) => {
  registerPluginHandler({ name, taxServices });
});

test("returns object containing active tax service when available", async () => {
  const testPackage = cloneDeep(fakePackage);
  testPackage.settings.fallbackTaxServiceName = null;
  mockContext.collections.Packages.findOne.mockReturnValueOnce(testPackage);
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.collections.Packages.findOne).toHaveBeenCalledWith({ name: "reaction-taxes", shopId: fakeShopId });
  expect(typeof result.activeTaxService).toEqual("object");
});

test("returns an empty object when no active tax found", async () => {
  const testPackage = cloneDeep(fakePackage);
  testPackage.settings = null;
  mockContext.collections.Packages.findOne.mockReturnValueOnce(testPackage);
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.collections.Packages.findOne).toHaveBeenCalledWith({ name: "reaction-taxes", shopId: fakeShopId });
  expect(result.activeTaxService).toEqual(undefined);
});

test("returns object containing both active and fallback tax service when both are available", async () => {
  const testPackage = cloneDeep(fakePackage);
  mockContext.collections.Packages.findOne.mockReturnValueOnce(testPackage);
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.collections.Packages.findOne).toHaveBeenCalledWith({ name: "reaction-taxes", shopId: fakeShopId });
  expect(typeof result.activeTaxService).toEqual("object");
  expect(typeof result.fallbackTaxService).toEqual("object");
});
