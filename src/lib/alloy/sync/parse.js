/**
 * Persistence adapter for Parse
 */

module.exports.sync = function(method, model, options) {

  var api_version = "1";

  // Method to HTTP Type Map 
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // get id if it is not a Backbone Collection
  var object_id = model.models? "" : model.id; 

  var class_name = model.__proto__._parse_class_name;
  if (!class_name) {
    Ti.API.error("Trying to use Parse adapter without _parse_class_name established.");
  }

  // create request parameters
  var http_method = methodMap[method];
  options || (options = {});

  // use basic auth to we can just use Parse._ajax instead of
  // implementing our own to which we could pass auth headers
  var url = [
    "https://",
    Alloy.CFG.parse_appid,
    ":javascript-key=",
    Alloy.CFG.parse_jskey,
    "@api.parse.com/",
    api_version,
    "/classes/",
    class_name
  ].join('');

  // need object for non-create
  if (method != "create") {
    url += "/" + object_id;
  }
  
  var data = {};
  if (!options.data && model && (method == 'create' || method == 'update')) {
    // delete data.createdAt
    // delete data.updatedAt
    data = JSON.stringify(model.toJSON());
  } else if (options.query && method == "read") { 
    data = encodeURI("where=" + JSON.stringify(options.query.where));
  }   
  
  Alloy.Globals.dump(http_method, url, data, options.success, options.error);
  return Parse._ajax(http_method, url, data, options.success, options.error);
};

module.exports.afterModelCreate = function(Model) {
  Model = Model || {};

  Model.prototype.idAttribute = 'objectId'; 

  return Model;
};

module.exports.afterCollectionCreate = function(Collection) {
  Collection = Collection || {};
  
  Collection.prototype.parse = function(options) {
    data = Backbone.Collection.prototype.parse.call(this, options);
    return data.results;
  }

  return Collection;
};