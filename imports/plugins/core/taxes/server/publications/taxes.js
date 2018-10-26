import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import { Counts } from "meteor/tmeasday:publish-counts";
import { TaxCodes } from "../../lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

//
// Security
// Security definitions
//
Security.permit(["insert", "update", "remove"]).collections([
  TaxCodes
]).ifHasRole({
  role: "admin",
  group: Reaction.getShopId()
});

/**
 * tax codes
 */
Meteor.publish("TaxCodes", function (query, params) {
  check(query, Match.Optional(Object));
  check(params, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};

  // for now, not adding shopId to query
  // taxCodes are reasonable shared??
  //  select.shopId = shopId;

  const options = params || {};
  // const options = params || {
  //   fields: {
  //     id: 1,
  //     label: 1
  //   },
  //   sort: {
  //     label: 1
  //   }
  // };

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "taxcode-count", TaxCodes.find(
    select,
    options
  ));

  return TaxCodes.find(
    select,
    options
  );
});
